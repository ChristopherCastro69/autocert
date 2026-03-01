import { NextRequest, NextResponse } from "next/server";
import { getOAuth2Client } from "@/lib/gmail";

export async function GET(request: NextRequest) {
  const orgId = request.nextUrl.searchParams.get("orgId");

  if (!orgId) {
    return NextResponse.json({ error: "orgId is required" }, { status: 400 });
  }

  const oauth2Client = getOAuth2Client();

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/gmail.send"],
    state: orgId,
  });

  return NextResponse.redirect(authUrl);
}
