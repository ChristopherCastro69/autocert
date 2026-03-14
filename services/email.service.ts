import {
  EmailPayload,
  SendEmailResult,
  EmailProvider,
  EmailConfig,
} from "@/types";
import { getGmailClient, buildMimeMessage } from "@/lib/gmail";
import { getResendClient } from "@/lib/resend";

class GmailProvider implements EmailProvider {
  private accessToken: string;
  private refreshToken: string;
  private fromEmail: string;

  constructor(accessToken: string, refreshToken: string, fromEmail: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.fromEmail = fromEmail;
  }

  async send(payload: EmailPayload): Promise<SendEmailResult> {
    try {
      const gmail = getGmailClient(this.accessToken, this.refreshToken);
      const mimeMessage = buildMimeMessage({
        to: payload.to,
        from: payload.from || this.fromEmail,
        subject: payload.subject,
        body: payload.body,
        attachmentName: payload.attachmentName,
        attachmentData: payload.attachmentData,
        attachmentMimeType: payload.attachmentMimeType,
      });

      const encodedMessage = Buffer.from(mimeMessage)
        .toString("base64url");

      await gmail.users.messages.send({
        userId: "me",
        requestBody: { raw: encodedMessage },
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gmail send failed",
      };
    }
  }
}

class ResendProvider implements EmailProvider {
  private apiKey: string;
  private fromEmail: string;

  constructor(apiKey: string, fromEmail: string) {
    this.apiKey = apiKey;
    this.fromEmail = fromEmail;
  }

  async send(payload: EmailPayload): Promise<SendEmailResult> {
    try {
      const resend = getResendClient(this.apiKey);
      await resend.emails.send({
        from: payload.from || this.fromEmail,
        to: payload.to,
        subject: payload.subject,
        html: payload.body,
        attachments: [
          {
            filename: payload.attachmentName,
            content: payload.attachmentData,
          },
        ],
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Resend send failed",
      };
    }
  }
}

export function createEmailProvider(config: EmailConfig): EmailProvider {
  if (config.provider === "gmail") {
    if (!config.gmail_access_token || !config.gmail_refresh_token || !config.gmail_email) {
      throw new Error("Gmail configuration is incomplete");
    }
    return new GmailProvider(
      config.gmail_access_token,
      config.gmail_refresh_token,
      config.gmail_email
    );
  }

  if (config.provider === "resend") {
    if (!config.resend_api_key || !config.resend_from_email) {
      throw new Error("Resend configuration is incomplete");
    }
    return new ResendProvider(config.resend_api_key, config.resend_from_email);
  }

  throw new Error(`Unsupported email provider: ${config.provider}`);
}
