import { NextRequest, NextResponse } from "next/server";
import { getOAuth2Client } from "@/lib/gmail";
import { verifyOrgMembership, isAuthError } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const orgId = request.nextUrl.searchParams.get("orgId");
  const returnTo = request.nextUrl.searchParams.get("returnTo") ?? "";

  const auth = await verifyOrgMembership(orgId);
  if (isAuthError(auth)) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  // Encode orgId + return path in state (separated by |)
  const state = returnTo ? `${auth.orgId}|${returnTo}` : auth.orgId;

  const oauth2Client = getOAuth2Client();

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "openid",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/gmail.settings.basic",
    ],
    state,
  });

  return NextResponse.redirect(authUrl);
}
