import { NextRequest, NextResponse } from "next/server";
import { getOAuth2Client } from "@/lib/gmail";

export async function GET(request: NextRequest) {
  const returnTo = request.nextUrl.searchParams.get("returnTo") ?? "/guest/distribute";

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
    state: `guest|${returnTo}`,
  });

  return NextResponse.redirect(authUrl);
}
