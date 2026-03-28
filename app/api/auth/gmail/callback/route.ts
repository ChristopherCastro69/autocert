import { NextRequest, NextResponse } from "next/server";
import { getOAuth2Client } from "@/lib/gmail";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const orgId = request.nextUrl.searchParams.get("state");

  if (!code || !orgId) {
    return NextResponse.json(
      { error: "Missing code or state parameter" },
      { status: 400 }
    );
  }

  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token || !tokens.refresh_token) {
      return NextResponse.json(
        { error: "Failed to obtain tokens" },
        { status: 400 }
      );
    }

    oauth2Client.setCredentials(tokens);

    // Get email - try tokenInfo first, fall back to userinfo endpoint
    let gmailEmail: string | null = null;
    try {
      const tokenInfo = await oauth2Client.getTokenInfo(tokens.access_token);
      gmailEmail = tokenInfo.email ?? null;
    } catch {
      // tokenInfo can fail for some token types
    }

    if (!gmailEmail) {
      try {
        const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        const userInfo = await res.json();
        gmailEmail = userInfo.email ?? null;
      } catch {
        // Fall through with null
      }
    }

    const supabase = await createClient();

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
      await supabase.from("email_configs").update(payload).eq("id", existing.id);
    } else {
      await supabase.from("email_configs").insert(payload);
    }

    // Resolve org slug for redirect
    const { data: org } = await supabase
      .from("organizations")
      .select("slug")
      .eq("id", orgId)
      .single();

    const redirectPath = org
      ? `/dashboard/${org.slug}/settings`
      : "/dashboard";

    return NextResponse.redirect(new URL(redirectPath, request.url));
  } catch (error) {
    console.error("Gmail OAuth callback error:", error);
    return NextResponse.json(
      { error: "OAuth callback failed" },
      { status: 500 }
    );
  }
}
