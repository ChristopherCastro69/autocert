import { NextRequest, NextResponse } from "next/server";
import { getOAuth2Client } from "@/lib/gmail";
import { createAdminClient } from "@/lib/supabase/admin";

function errorRedirect(request: NextRequest, fallbackPath: string, message: string) {
  const url = new URL(fallbackPath, request.url);
  url.searchParams.set("gmail_error", message);
  return NextResponse.redirect(url);
}

async function detectGmailEmail(accessToken: string, oauth2Client: ReturnType<typeof getOAuth2Client>): Promise<string | null> {
  // Method 1: tokenInfo
  try {
    const tokenInfo = await oauth2Client.getTokenInfo(accessToken);
    if (tokenInfo.email) return tokenInfo.email;
  } catch {
    // Fall through
  }

  // Method 2: userinfo endpoint
  try {
    const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (res.ok) {
      const userInfo = await res.json();
      if (userInfo.email) return userInfo.email;
    }
  } catch {
    // Fall through
  }

  // Method 3: Gmail API profile
  try {
    const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (res.ok) {
      const profile = await res.json();
      if (profile.emailAddress) return profile.emailAddress;
    }
  } catch {
    // Fall through
  }

  return null;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const rawState = request.nextUrl.searchParams.get("state") ?? "";
  const error = request.nextUrl.searchParams.get("error");

  // Check if this is a guest mode callback (state starts with "guest|")
  if (rawState.startsWith("guest|")) {
    return handleGuestCallback(request, code, rawState, error);
  }

  // Parse orgId and optional returnTo from state (format: "orgId" or "orgId|/path")
  const [orgId, returnTo] = rawState.split("|");

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

  // Use returnTo if provided, otherwise fall back to settings
  const redirectPath = returnTo || (org ? `/dashboard/${org.slug}/settings` : "/dashboard");

  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token) {
      return errorRedirect(request, redirectPath, "Failed to obtain access token from Google");
    }

    if (!tokens.refresh_token) {
      return errorRedirect(
        request,
        redirectPath,
        "No refresh token received. Try revoking app access at myaccount.google.com/permissions and reconnecting."
      );
    }

    oauth2Client.setCredentials(tokens);

    const gmailEmail = await detectGmailEmail(tokens.access_token, oauth2Client);

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
        return errorRedirect(request, redirectPath, `Failed to update config: ${dbError.message}`);
      }
    } else {
      const { error: dbError } = await supabase
        .from("email_configs")
        .insert(payload);
      if (dbError) {
        return errorRedirect(request, redirectPath, `Failed to save config: ${dbError.message}`);
      }
    }

    // Success redirect with optional warning
    const url = new URL(redirectPath, request.url);
    url.searchParams.set("gmail_connected", "true");
    if (!gmailEmail) {
      url.searchParams.set("gmail_warning", "Connected but could not detect email address");
    }
    return NextResponse.redirect(url);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error during Gmail setup";
    console.error("Gmail OAuth callback error:", error);
    return errorRedirect(request, redirectPath, message);
  }
}

/**
 * Guest mode: exchange code for tokens and return them to the client via redirect.
 * No DB writes — tokens live in the browser session only.
 */
async function handleGuestCallback(
  request: NextRequest,
  code: string | null,
  rawState: string,
  error: string | null
) {
  const returnTo = rawState.replace("guest|", "") || "/guest/distribute";

  if (error) {
    return errorRedirect(request, returnTo, `Gmail authorization denied: ${error}`);
  }

  if (!code) {
    return errorRedirect(request, returnTo, "Missing authorization code");
  }

  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token) {
      return errorRedirect(request, returnTo, "Failed to obtain access token from Google");
    }

    if (!tokens.refresh_token) {
      return errorRedirect(
        request,
        returnTo,
        "No refresh token received. Try revoking app access at myaccount.google.com/permissions and reconnecting."
      );
    }

    const gmailEmail = await detectGmailEmail(tokens.access_token, oauth2Client);

    // Return tokens to client via query params — client reads and clears URL immediately
    const url = new URL(returnTo, request.url);
    url.searchParams.set("gmail_connected", "true");
    url.searchParams.set("gmail_access_token", tokens.access_token);
    url.searchParams.set("gmail_refresh_token", tokens.refresh_token);
    if (gmailEmail) {
      url.searchParams.set("gmail_email", gmailEmail);
    }

    return NextResponse.redirect(url);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error during Gmail setup";
    console.error("Guest Gmail OAuth callback error:", err);
    return errorRedirect(request, returnTo, message);
  }
}
