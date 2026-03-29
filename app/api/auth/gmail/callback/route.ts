import { NextRequest, NextResponse } from "next/server";
import { getOAuth2Client } from "@/lib/gmail";
import { createAdminClient } from "@/lib/supabase/admin";

function errorRedirect(request: NextRequest, fallbackPath: string, message: string) {
  const url = new URL(fallbackPath, request.url);
  url.searchParams.set("gmail_error", message);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const orgId = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");

  // Google may redirect back with an error (e.g. user denied access)
  if (error) {
    return errorRedirect(request, "/dashboard", `Gmail authorization denied: ${error}`);
  }

  if (!code || !orgId) {
    return errorRedirect(request, "/dashboard", "Missing authorization code or org ID");
  }

  const supabase = createAdminClient();

  // Resolve org slug early for redirect
  const { data: org } = await supabase
    .from("organizations")
    .select("slug")
    .eq("id", orgId)
    .single();

  const settingsPath = org ? `/dashboard/${org.slug}/settings` : "/dashboard";

  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token) {
      return errorRedirect(request, settingsPath, "Failed to obtain access token from Google");
    }

    if (!tokens.refresh_token) {
      return errorRedirect(
        request,
        settingsPath,
        "No refresh token received. Try revoking app access at myaccount.google.com/permissions and reconnecting."
      );
    }

    oauth2Client.setCredentials(tokens);

    // Get email — try multiple methods
    let gmailEmail: string | null = null;

    // Method 1: tokenInfo
    try {
      const tokenInfo = await oauth2Client.getTokenInfo(tokens.access_token);
      gmailEmail = tokenInfo.email ?? null;
    } catch {
      // May fail depending on token type
    }

    // Method 2: userinfo endpoint
    if (!gmailEmail) {
      try {
        const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        if (res.ok) {
          const userInfo = await res.json();
          gmailEmail = userInfo.email ?? null;
        }
      } catch {
        // Fall through
      }
    }

    // Method 3: Gmail API profile
    if (!gmailEmail) {
      try {
        const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        if (res.ok) {
          const profile = await res.json();
          gmailEmail = profile.emailAddress ?? null;
        }
      } catch {
        // Fall through
      }
    }

    const { data: existing } = await supabase
      .from("email_configs")
      .select("id")
      .eq("org_id", orgId)
      .maybeSingle();

    const payload = {
      org_id: orgId,
      provider: "gmail" as const,
      gmail_access_token: tokens.access_token,
      gmail_refresh_token: tokens.refresh_token,
      gmail_token_expiry: tokens.expiry_date
        ? new Date(tokens.expiry_date).toISOString()
        : null,
      gmail_email: gmailEmail,
      is_active: true,
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      const { error: dbError } = await supabase
        .from("email_configs")
        .update(payload)
        .eq("id", existing.id);
      if (dbError) {
        return errorRedirect(request, settingsPath, `Failed to update config: ${dbError.message}`);
      }
    } else {
      const { error: dbError } = await supabase
        .from("email_configs")
        .insert(payload);
      if (dbError) {
        return errorRedirect(request, settingsPath, `Failed to save config: ${dbError.message}`);
      }
    }

    // Success redirect with optional warning
    const url = new URL(settingsPath, request.url);
    url.searchParams.set("gmail_connected", "true");
    if (!gmailEmail) {
      url.searchParams.set("gmail_warning", "Connected but could not detect email address");
    }
    return NextResponse.redirect(url);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error during Gmail setup";
    console.error("Gmail OAuth callback error:", error);
    return errorRedirect(request, settingsPath, message);
  }
}
