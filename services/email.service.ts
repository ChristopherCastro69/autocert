import {
  EmailPayload,
  SendEmailResult,
  EmailProvider,
  EmailConfig,
} from "@/types";
import { getGmailClient, buildMimeMessage } from "@/lib/gmail";
import { getResendClient } from "@/lib/resend";
import nodemailer from "nodemailer";

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromEmail: string;
}

export class GmailProvider implements EmailProvider {
  private accessToken: string;
  private refreshToken: string;
  private fromEmail: string;

  constructor(accessToken: string, refreshToken: string, fromEmail: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.fromEmail = fromEmail;
  }

  async send(payload: EmailPayload): Promise<SendEmailResult> {
    const from = payload.from || this.fromEmail;
    if (!from) {
      return {
        success: false,
        error: "No sender email address — select a From address or reconnect Gmail in Email Settings",
      };
    }

    try {
      const gmail = getGmailClient(this.accessToken, this.refreshToken);
      const mimeMessage = buildMimeMessage({
        to: payload.to,
        from,
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
      const message = error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        error: `Gmail: ${message}`,
      };
    }
  }
}

export class ResendProvider implements EmailProvider {
  private apiKey: string;
  private fromEmail: string;

  constructor(apiKey: string, fromEmail: string) {
    this.apiKey = apiKey;
    this.fromEmail = fromEmail;
  }

  async send(payload: EmailPayload): Promise<SendEmailResult> {
    const from = payload.from || this.fromEmail;
    if (!from) {
      return {
        success: false,
        error: "No sender email address — configure a From Email in Resend settings",
      };
    }

    try {
      const resend = getResendClient(this.apiKey);
      await resend.emails.send({
        from,
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
      const message = error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        error: `Resend: ${message}`,
      };
    }
  }
}

export class SmtpProvider implements EmailProvider {
  private config: SmtpConfig;

  constructor(config: SmtpConfig) {
    this.config = config;
  }

  async send(payload: EmailPayload): Promise<SendEmailResult> {
    const from = payload.from || this.config.fromEmail;
    if (!from) {
      return { success: false, error: "No sender email address" };
    }

    try {
      const transport = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        auth: {
          user: this.config.username,
          pass: this.config.password,
        },
      });

      await transport.sendMail({
        from,
        to: payload.to,
        subject: payload.subject,
        html: payload.body,
        attachments: [
          {
            filename: payload.attachmentName,
            content: payload.attachmentData,
            contentType: payload.attachmentMimeType,
          },
        ],
      });

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return { success: false, error: `SMTP: ${message}` };
    }
  }
}

export function createEmailProvider(config: EmailConfig): EmailProvider {
  if (config.provider === "gmail") {
    if (!config.gmail_access_token || !config.gmail_refresh_token) {
      throw new Error("Gmail configuration is incomplete — missing tokens");
    }
    return new GmailProvider(
      config.gmail_access_token,
      config.gmail_refresh_token,
      config.gmail_email ?? ""
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
