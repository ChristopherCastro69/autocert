import { google } from "googleapis";

export function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

export function getGmailClient(accessToken: string, refreshToken: string) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  return google.gmail({ version: "v1", auth: oauth2Client });
}

export function buildMimeMessage(params: {
  to: string;
  from: string;
  subject: string;
  body: string;
  attachmentName: string;
  attachmentData: Buffer;
  attachmentMimeType: string;
}): string {
  const boundary = `boundary_${Date.now()}`;
  const lines = [
    `From: ${params.from}`,
    `To: ${params.to}`,
    `Subject: ${params.subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    `Content-Type: text/html; charset="UTF-8"`,
    "",
    params.body,
    "",
    `--${boundary}`,
    `Content-Type: ${params.attachmentMimeType}; name="${params.attachmentName}"`,
    `Content-Disposition: attachment; filename="${params.attachmentName}"`,
    `Content-Transfer-Encoding: base64`,
    "",
    params.attachmentData.toString("base64"),
    "",
    `--${boundary}--`,
  ];
  return lines.join("\r\n");
}
