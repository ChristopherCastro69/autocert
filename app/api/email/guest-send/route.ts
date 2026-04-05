import { NextRequest, NextResponse } from "next/server";
import { GmailProvider, SmtpProvider, type SmtpConfig } from "@/services/email.service";
import { getResendClient } from "@/lib/resend";
import type { EmailPayload, SendEmailResult } from "@/types";

// ─── Rate Limiting ───

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 15;
const MAX_EMAILS_PER_WINDOW = 500;

interface RateLimitEntry {
  requests: number;
  emails: number;
  windowStart: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkRateLimit(ip: string, emailCount: number): { allowed: boolean; error?: string } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { requests: 1, emails: emailCount, windowStart: now });
    return { allowed: true };
  }

  if (entry.requests + 1 > MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, error: `Rate limit exceeded. Max ${MAX_REQUESTS_PER_WINDOW} requests per hour.` };
  }

  if (entry.emails + emailCount > MAX_EMAILS_PER_WINDOW) {
    return { allowed: false, error: `Email limit exceeded. Max ${MAX_EMAILS_PER_WINDOW} emails per hour.` };
  }

  entry.requests++;
  entry.emails += emailCount;
  return { allowed: true };
}

// Clean up stale entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  rateLimitMap.forEach((entry, ip) => {
    if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
      rateLimitMap.delete(ip);
    }
  });
}, 10 * 60 * 1000);

// ─── Types ───

interface GuestRecipient {
  firstName: string;
  lastName: string;
  email: string;
  certificateBlob: string; // base64-encoded certificate image
  certificateMimeType: string;
}

interface GuestSendRequest {
  provider: "gmail" | "resend" | "smtp";
  subject: string;
  body: string;
  fromEmail: string;
  eventName: string;
  recipients: GuestRecipient[];

  // Gmail credentials (in-memory, not from DB)
  gmailAccessToken?: string;
  gmailRefreshToken?: string;

  // Resend credentials
  resendApiKey?: string;

  // SMTP credentials
  smtpConfig?: SmtpConfig;
}

function htmlEscape(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function replaceTemplateVars(
  text: string,
  recipient: GuestRecipient,
  eventName: string
): string {
  return text
    .replace(/\{\{firstName\}\}/g, htmlEscape(recipient.firstName))
    .replace(/\{\{lastName\}\}/g, htmlEscape(recipient.lastName))
    .replace(/\{\{eventName\}\}/g, htmlEscape(eventName));
}

export async function POST(request: NextRequest) {
  try {
    const body: GuestSendRequest = await request.json();

    if (!body.recipients || body.recipients.length === 0) {
      return NextResponse.json({ error: "No recipients" }, { status: 400 });
    }

    if (!body.subject || !body.body) {
      return NextResponse.json({ error: "Subject and body are required" }, { status: 400 });
    }

    // Cap at 50 recipients per request for guest mode
    if (body.recipients.length > 50) {
      return NextResponse.json(
        { error: "Guest mode supports up to 50 emails per batch" },
        { status: 400 }
      );
    }

    // Rate limiting
    const ip = getClientIp(request);
    const rateCheck = checkRateLimit(ip, body.recipients.length);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: rateCheck.error }, { status: 429 });
    }

    // Create provider from in-memory credentials
    let provider: { send(payload: EmailPayload): Promise<SendEmailResult> };

    if (body.provider === "gmail") {
      if (!body.gmailAccessToken || !body.gmailRefreshToken) {
        return NextResponse.json({ error: "Gmail tokens required" }, { status: 400 });
      }
      provider = new GmailProvider(body.gmailAccessToken, body.gmailRefreshToken, body.fromEmail);
    } else if (body.provider === "resend") {
      if (!body.resendApiKey) {
        return NextResponse.json({ error: "Resend API key required" }, { status: 400 });
      }
      const resend = getResendClient(body.resendApiKey);
      // Use resend directly through a simple wrapper
      provider = {
        async send(payload: EmailPayload): Promise<SendEmailResult> {
          try {
            await resend.emails.send({
              from: payload.from,
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
            return { success: false, error: `Resend: ${message}` };
          }
        },
      };
    } else if (body.provider === "smtp") {
      if (!body.smtpConfig) {
        return NextResponse.json({ error: "SMTP configuration required" }, { status: 400 });
      }
      provider = new SmtpProvider(body.smtpConfig);
    } else {
      return NextResponse.json({ error: "Unsupported provider" }, { status: 400 });
    }

    // Send emails synchronously
    const results: { email: string; name: string; success: boolean; error?: string }[] = [];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    for (const recipient of body.recipients) {
      if (!recipient.email || !emailRegex.test(recipient.email)) {
        results.push({ email: recipient.email || "", name: `${recipient.firstName} ${recipient.lastName}`, success: false, error: "Invalid email address" });
        continue;
      }

      const personalizedSubject = replaceTemplateVars(body.subject, recipient, body.eventName);
      const personalizedBody = replaceTemplateVars(body.body, recipient, body.eventName);

      const certBuffer = Buffer.from(recipient.certificateBlob, "base64");
      const safeName = `${recipient.firstName}_${recipient.lastName}`.replace(/[^a-zA-Z0-9_-]/g, "_");
      const ext = recipient.certificateMimeType.includes("jpeg") ? "jpg" : "png";

      const result = await provider.send({
        to: recipient.email,
        from: body.fromEmail,
        subject: personalizedSubject,
        body: personalizedBody,
        attachmentName: `${safeName}_certificate.${ext}`,
        attachmentData: certBuffer,
        attachmentMimeType: recipient.certificateMimeType,
      });

      results.push({
        email: recipient.email,
        name: `${recipient.firstName} ${recipient.lastName}`,
        success: result.success,
        error: result.error,
      });
    }

    const sent = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return NextResponse.json({ sent, failed, results });
  } catch (error) {
    console.error("Guest email send error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
