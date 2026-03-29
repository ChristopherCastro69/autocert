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

/** Strip CR/LF to prevent email header injection */
function sanitizeHeader(value: string): string {
  return value.replace(/[\r\n]/g, "").trim();
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
  const from = sanitizeHeader(params.from);
  const to = sanitizeHeader(params.to);
  const subject = sanitizeHeader(params.subject);
  const attachmentName = sanitizeHeader(params.attachmentName);

  if (!to || !from) {
    throw new Error("Invalid email address in From or To field");
  }

  const boundary = `boundary_${Date.now()}`;
  const lines = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    `Content-Type: text/html; charset="UTF-8"`,
    "",
    params.body,
    "",
    `--${boundary}`,
    `Content-Type: ${params.attachmentMimeType}; name="${attachmentName}"`,
    `Content-Disposition: attachment; filename="${attachmentName}"`,
    `Content-Transfer-Encoding: base64`,
    "",
    params.attachmentData.toString("base64"),
    "",
    `--${boundary}--`,
  ];
  return lines.join("\r\n");
}
