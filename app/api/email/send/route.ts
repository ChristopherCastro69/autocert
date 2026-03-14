import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { EMAIL_MAX_ATTEMPTS } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const { orgId, certificateIds, subject, body } = await request.json();

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

    const supabase = await createClient();

    // Verify org has active email config
    const { data: emailConfig } = await supabase
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
      status: "pending" as const,
      attempts: 0,
      max_attempts: EMAIL_MAX_ATTEMPTS,
      scheduled_at: new Date().toISOString(),
    }));

    const { data: createdJobs, error } = await supabase
      .from("email_jobs")
      .insert(jobs)
      .select("id");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Trigger processing
    const processUrl = new URL("/api/email/process", request.url);
    fetch(processUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-cron-secret": process.env.CRON_SECRET ?? "",
      },
    }).catch(() => {
      // Fire and forget - processing will happen async
    });

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
