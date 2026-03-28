export type EmailProviderType = "gmail" | "resend";
export type EmailJobStatus = "pending" | "processing" | "sent" | "failed" | "retrying";

export interface EmailConfig {
  id: string;
  org_id: string;
  provider: EmailProviderType;
  gmail_access_token: string | null;
  gmail_refresh_token: string | null;
  gmail_token_expiry: string | null;
  gmail_email: string | null;
  resend_api_key: string | null;
  resend_domain: string | null;
  resend_from_email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailJob {
  id: string;
  org_id: string;
  generated_certificate_id: string;
  subject: string | null;
  body: string | null;
  status: EmailJobStatus;
  attempts: number;
  max_attempts: number;
  last_error: string | null;
  scheduled_at: string;
  processed_at: string | null;
  created_at: string;
}

export interface EmailPayload {
  to: string;
  from: string;
  subject: string;
  body: string;
  attachmentName: string;
  attachmentData: Buffer;
  attachmentMimeType: string;
}

export interface SendEmailResult {
  success: boolean;
  error?: string;
}

export interface EmailProvider {
  send(payload: EmailPayload): Promise<SendEmailResult>;
}
