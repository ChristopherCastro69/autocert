import { NextRequest, NextResponse } from "next/server";
import { getGmailClient } from "@/lib/gmail";

export async function POST(request: NextRequest) {
  try {
    const { accessToken, refreshToken } = await request.json();

    if (!accessToken || !refreshToken) {
      return NextResponse.json({ error: "Tokens required" }, { status: 400 });
    }

    const gmail = getGmailClient(accessToken, refreshToken);
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
