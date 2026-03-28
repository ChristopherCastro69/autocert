import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createEmailProvider } from "@/services/email.service";
import { EMAIL_BATCH_SIZE } from "@/lib/constants";
import type { EmailConfig, GeneratedCertificateWithRecipient } from "@/types";

export async function POST(request: NextRequest) {
  const cronSecret = request.headers.get("x-cron-secret");
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Fetch pending jobs
  const { data: jobs, error: jobsError } = await supabase
    .from("email_jobs")
    .select("*")
    .in("status", ["pending", "retrying"])
    .order("scheduled_at", { ascending: true })
    .limit(EMAIL_BATCH_SIZE);

  if (jobsError || !jobs || jobs.length === 0) {
    return NextResponse.json({ processed: 0, message: "No pending jobs" });
  }

  let sent = 0;
  let failed = 0;

  for (const job of jobs) {
    // Exponential backoff check for retrying jobs
    if (job.status === "retrying" && job.attempts > 0) {
      const delayMs = job.attempts * 5000;
      const scheduledTime = new Date(job.scheduled_at).getTime();
      if (Date.now() < scheduledTime + delayMs) {
        continue;
      }
    }

    // Mark as processing
    await supabase
      .from("email_jobs")
      .update({ status: "processing" })
      .eq("id", job.id);

    try {
      // Get certificate + recipient
      const { data: cert } = await supabase
        .from("generated_certificates")
        .select("*, recipients(id, first_name, last_name, email, event_id)")
        .eq("id", job.generated_certificate_id)
        .single();

      if (!cert || !cert.recipients) {
        throw new Error("Certificate or recipient not found");
      }

      const typedCert = cert as unknown as GeneratedCertificateWithRecipient;

      if (!typedCert.recipients.email) {
        throw new Error("Recipient has no email address");
      }

      // Get email config
      const { data: emailConfig } = await supabase
        .from("email_configs")
        .select("*")
        .eq("org_id", job.org_id)
        .eq("is_active", true)
        .single();

      if (!emailConfig) {
        throw new Error("No active email config");
      }

      const config = emailConfig as EmailConfig;
      const provider = createEmailProvider(config);

      // Download certificate image
      const imageResponse = await fetch(typedCert.image_url);
      if (!imageResponse.ok) {
        throw new Error("Failed to download certificate image");
      }
      const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

      // Fetch event name for template variable
      const { data: event } = await supabase
        .from("events")
        .select("name")
        .eq("id", typedCert.recipients.event_id)
        .single();

      // Replace template vars in subject and body
      const recipientFirstName = typedCert.recipients.first_name;
      const recipientLastName = typedCert.recipients.last_name;
      const eventName = event?.name ?? "";

      const resolveVars = (text: string) =>
        text
          .replace(/\{\{firstName\}\}/g, recipientFirstName)
          .replace(/\{\{lastName\}\}/g, recipientLastName)
          .replace(/\{\{eventName\}\}/g, eventName);

      const resolvedSubject = resolveVars(job.subject ?? "Your Certificate");
      const resolvedBody = resolveVars(job.body ?? "");

      const result = await provider.send({
        to: typedCert.recipients.email,
        from: config.gmail_email ?? config.resend_from_email ?? "",
        subject: resolvedSubject,
        body: resolvedBody,
        attachmentName: `${recipientFirstName}_${recipientLastName}_certificate.png`,
        attachmentData: imageBuffer,
        attachmentMimeType: "image/png",
      });

      if (result.success) {
        await supabase
          .from("email_jobs")
          .update({
            status: "sent",
            processed_at: new Date().toISOString(),
            attempts: job.attempts + 1,
          })
          .eq("id", job.id);

        await supabase
          .from("generated_certificates")
          .update({ status: "sent", sent_at: new Date().toISOString() })
          .eq("id", job.generated_certificate_id);

        sent++;
      } else {
        throw new Error(result.error ?? "Send failed");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      const newAttempts = job.attempts + 1;
      const isFinalAttempt = newAttempts >= job.max_attempts;

      await supabase
        .from("email_jobs")
        .update({
          status: isFinalAttempt ? "failed" : "retrying",
          last_error: errorMessage,
          attempts: newAttempts,
          scheduled_at: isFinalAttempt
            ? job.scheduled_at
            : new Date().toISOString(),
        })
        .eq("id", job.id);

      if (isFinalAttempt) {
        await supabase
          .from("generated_certificates")
          .update({ status: "failed", error_message: errorMessage })
          .eq("id", job.generated_certificate_id);
      }

      failed++;
    }
  }

  // Check if more jobs remain
  const { count } = await supabase
    .from("email_jobs")
    .select("id", { count: "exact", head: true })
    .in("status", ["pending", "retrying"]);

  if (count && count > 0) {
    const processUrl = new URL("/api/email/process", request.url);
    fetch(processUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-cron-secret": process.env.CRON_SECRET ?? "",
      },
    }).catch(() => {});
  }

  return NextResponse.json({ processed: jobs.length, sent, failed, remaining: count ?? 0 });
}
