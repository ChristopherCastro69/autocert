"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useOrg } from "@/components/context/OrgContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmailComposer } from "@/components/distribute/email-composer";
import { DeliveryStatus } from "@/components/distribute/delivery-status";
import { EmailConfigForm } from "@/components/distribute/email-config-form";
import { SendProgress } from "@/components/distribute/send-progress";
import { Mail, Settings } from "lucide-react";
import Link from "next/link";
import type { EmailConfig, EmailJob, GeneratedCertificateWithRecipient, Event } from "@/types";

export default function DistributePage() {
  const { eventId, orgSlug } = useParams<{ eventId: string; orgSlug: string }>();
  const { activeOrg } = useOrg();
  const [event, setEvent] = useState<Event | null>(null);
  const [emailConfig, setEmailConfig] = useState<EmailConfig | null>(null);
  const [certificates, setCertificates] = useState<GeneratedCertificateWithRecipient[]>([]);
  const [jobs, setJobs] = useState<EmailJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    if (!activeOrg) return;

    const [eventRes, configRes, certsRes, jobsRes] = await Promise.all([
      supabase.from("events").select("*").eq("id", eventId).single(),
      supabase
        .from("email_configs")
        .select("*")
        .eq("org_id", activeOrg.id)
        .eq("is_active", true)
        .maybeSingle(),
      supabase
        .from("generated_certificates")
        .select("*, recipients(id, first_name, last_name, email)")
        .eq("recipients.event_id", eventId)
        .not("recipients", "is", null),
      supabase
        .from("email_jobs")
        .select("*")
        .eq("org_id", activeOrg.id)
        .order("created_at", { ascending: false }),
    ]);

    if (eventRes.data) setEvent(eventRes.data as Event);
    if (configRes.data) setEmailConfig(configRes.data as EmailConfig);
    if (certsRes.data) {
      setCertificates(certsRes.data as unknown as GeneratedCertificateWithRecipient[]);
    }
    if (jobsRes.data) setJobs(jobsRes.data as EmailJob[]);
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOrg, eventId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refreshJobs = useCallback(async () => {
    if (!activeOrg) return;
    const { data } = await supabase
      .from("email_jobs")
      .select("*")
      .eq("org_id", activeOrg.id)
      .order("created_at", { ascending: false });
    if (data) setJobs(data as EmailJob[]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOrg]);

  const handleSend = async (subject: string, body: string) => {
    if (!activeOrg) return;
    setSending(true);

    const certIds = certificates
      .filter((c) => c.recipients.email)
      .map((c) => c.id);

    if (certIds.length === 0) {
      setSending(false);
      return;
    }

    try {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId: activeOrg.id,
          certificateIds: certIds,
          subject,
          body,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("Send error:", err);
      }

      // Refresh jobs after sending
      await refreshJobs();
    } catch (error) {
      console.error("Send error:", error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  if (!activeOrg || !event) return null;

  const hasConfig = !!emailConfig;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Distribute Certificates</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowConfig(!showConfig)}
        >
          <Settings className="h-4 w-4 mr-2" />
          Email Settings
        </Button>
      </div>

      {showConfig && (
        <EmailConfigForm
          orgId={activeOrg.id}
          config={emailConfig}
          onSaved={() => {
            fetchData();
            setShowConfig(false);
          }}
        />
      )}

      {!hasConfig && !showConfig && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Not Configured
            </CardTitle>
            <CardDescription>
              Set up an email provider to distribute certificates.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button onClick={() => setShowConfig(true)}>
              Configure Email
            </Button>
            <Link href={`/dashboard/${orgSlug}/settings`}>
              <Button variant="outline">Go to Settings</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {hasConfig && (
        <>
          {certificates.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  No generated certificates found. Generate certificates first before distributing.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <EmailComposer
                eventName={event.name}
                certificates={certificates}
                onSend={handleSend}
                sending={sending}
              />
              <SendProgress jobs={jobs} />
              <DeliveryStatus
                jobs={jobs}
                certificates={certificates}
                onRefresh={refreshJobs}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
