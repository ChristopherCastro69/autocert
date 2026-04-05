import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyOrgMembership, isAuthError } from "@/lib/auth";
import { getGmailClient } from "@/lib/gmail";

export async function GET(request: NextRequest) {
  const orgId = request.nextUrl.searchParams.get("orgId");

  const auth = await verifyOrgMembership(orgId);
  if (isAuthError(auth)) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = createAdminClient();

  const { data: config } = await supabase
    .from("email_configs")
    .select("*")
    .eq("org_id", orgId)
    .eq("is_active", true)
    .eq("provider", "gmail")
    .single();

  if (!config || !config.gmail_access_token || !config.gmail_refresh_token) {
    return NextResponse.json({ error: "Gmail not configured" }, { status: 400 });
  }

  try {
    const gmail = getGmailClient(config.gmail_access_token, config.gmail_refresh_token);
    const res = await gmail.users.settings.sendAs.list({ userId: "me" });
    const aliases = (res.data.sendAs ?? [])
      .filter((a) => a.verificationStatus === "accepted" || a.isPrimary)
      .map((a) => ({
        email: a.sendAsEmail ?? "",
        displayName: a.displayName ?? "",
        isPrimary: a.isPrimary ?? false,
      }));

    return NextResponse.json({ aliases });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch aliases" },
      { status: 500 }
    );
  }
}
