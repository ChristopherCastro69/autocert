import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyOrgMembership, isAuthError } from "@/lib/auth";
import { EMAIL_MAX_ATTEMPTS } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const { orgId, certificateIds, subject, body, fromEmail } = await request.json();

    // Validate fromEmail format if provided
    if (fromEmail && typeof fromEmail === "string") {
      // Extract email from "Display Name <email>" format
      const emailMatch = fromEmail.match(/<([^>]+)>/) ?? [null, fromEmail];
      const email = emailMatch[1] ?? fromEmail;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json(
          { error: "Invalid sender email address" },
          { status: 400 }
        );
      }
    }

    if (!orgId || !Array.isArray(certificateIds) || certificateIds.length === 0) {
      return NextResponse.json(
        { error: "orgId and certificateIds are required" },
        { status: 400 }
      );
    }

    if (!subject || !body) {
      return NextResponse.json(
        { error: "subject and body are required" },
        { status: 400 }
      );
    }

    // Verify user is authenticated AND a member of this org
    const auth = await verifyOrgMembership(orgId);
    if (isAuthError(auth)) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const adminDb = createAdminClient();

    // Verify org has active email config
    const { data: emailConfig } = await adminDb
      .from("email_configs")
      .select("id")
      .eq("org_id", orgId)
      .eq("is_active", true)
      .maybeSingle();

    if (!emailConfig) {
      return NextResponse.json(
        { error: "No active email configuration found" },
        { status: 400 }
      );
    }

    // Create email jobs
    const jobs = certificateIds.map((certId: string) => ({
      org_id: orgId,
      generated_certificate_id: certId,
      subject,
      body,
      from_email: fromEmail || null,
      status: "pending" as const,
      attempts: 0,
      max_attempts: EMAIL_MAX_ATTEMPTS,
      scheduled_at: new Date().toISOString(),
    }));

    const { data: createdJobs, error } = await adminDb
      .from("email_jobs")
      .insert(jobs)
      .select("id");

    if (error) {
      console.error("Email job creation error:", error.message);
      return NextResponse.json({ error: "Failed to create email jobs" }, { status: 500 });
    }

    // Trigger processing (fire and forget)
    const processUrl = new URL("/api/email/process", request.url);
    fetch(processUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-cron-secret": process.env.CRON_SECRET ?? "",
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      jobCount: createdJobs?.length ?? 0,
    });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json(
      { error: "Failed to create email jobs" },
      { status: 500 }
    );
  }
}
