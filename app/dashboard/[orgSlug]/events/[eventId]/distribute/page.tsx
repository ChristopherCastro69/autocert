"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useOrg } from "@/components/context/OrgContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmailComposer } from "@/components/distribute/email-composer";
import type { GmailAlias } from "@/components/distribute/email-composer";
import { DeliveryStatus } from "@/components/distribute/delivery-status";
import { EmailConfigForm } from "@/components/distribute/email-config-form";
import { SendProgress } from "@/components/distribute/send-progress";
import {
  Mail,
  Settings,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import type {
  EmailConfig,
  EmailJob,
  GeneratedCertificateWithRecipient,
  Event,
} from "@/types";

export default function DistributePage() {
  const { eventId, orgSlug } = useParams<{
    eventId: string;
    orgSlug: string;
  }>();
  const { activeOrg } = useOrg();
  const [event, setEvent] = useState<Event | null>(null);
  const [emailConfig, setEmailConfig] = useState<EmailConfig | null>(null);
  const [certificates, setCertificates] =
    useState<GeneratedCertificateWithRecipient[]>([]);
  const [jobs, setJobs] = useState<EmailJob[]>([]);
  const [aliases, setAliases] = useState<GmailAlias[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    if (!activeOrg) return;

    const [eventRes, configRes, certsRes] = await Promise.all([
      supabase.from("events").select("*").eq("id", eventId).single(),
      supabase
        .from("email_configs")
        .select("*")
        .eq("org_id", activeOrg.id)
        .eq("is_active", true)
        .maybeSingle(),
      supabase
        .from("generated_certificates")
        .select("*, recipients(id, first_name, last_name, email, event_id)")
        .eq("recipients.event_id", eventId)
        .not("recipients", "is", null),
    ]);

    // Fetch jobs scoped to this event's certificates
    const certIds = (certsRes.data ?? []).map((c: { id: string }) => c.id);
    const jobsRes = certIds.length > 0
      ? await supabase
          .from("email_jobs")
          .select("*")
          .in("generated_certificate_id", certIds)
          .order("created_at", { ascending: false })
      : { data: [] };

    if (eventRes.data) setEvent(eventRes.data as Event);
    if (configRes.data) {
      setEmailConfig(configRes.data as EmailConfig);
      // Fetch Gmail aliases if gmail provider
      if ((configRes.data as EmailConfig).provider === "gmail") {
        try {
          const aliasRes = await fetch(`/api/auth/gmail/aliases?orgId=${activeOrg.id}`);
          if (aliasRes.ok) {
            const { aliases: fetchedAliases } = await aliasRes.json();
            setAliases(fetchedAliases ?? []);
          } else {
            const err = await aliasRes.json().catch(() => null);
            toast.error(err?.error ?? "Could not load sender aliases");
          }
        } catch {
          toast.error("Could not load sender aliases — check your connection");
        }
      }
    }
    if (certsRes.data) {
      setCertificates(
        certsRes.data as unknown as GeneratedCertificateWithRecipient[]
      );
    }
    if (jobsRes.data) setJobs(jobsRes.data as EmailJob[]);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOrg, eventId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refreshJobs = useCallback(async () => {
    if (certificates.length === 0) return;
    const certIds = certificates.map((c) => c.id);
    const { data } = await supabase
      .from("email_jobs")
      .select("*")
      .in("generated_certificate_id", certIds)
      .order("created_at", { ascending: false });
    if (data) setJobs(data as EmailJob[]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [certificates]);

  const handleSend = async (subject: string, body: string, certIds: string[], fromEmail: string) => {
    if (!activeOrg || certIds.length === 0) return;
    setSending(true);
    setSendError(null);

    try {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId: activeOrg.id,
          certificateIds: certIds,
          subject,
          body,
          fromEmail,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        const msg = err?.error ?? "Failed to send emails";
        setSendError(msg);
        toast.error(msg);
      } else {
        const data = await res.json();
        toast.success(`${data.jobCount} email${data.jobCount !== 1 ? "s" : ""} queued for delivery`);
      }

      await refreshJobs();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to send emails";
      setSendError(msg);
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!activeOrg || !event) return null;

  const hasConfig = !!emailConfig;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Distribute Certificates</h1>
          <p className="text-sm text-muted-foreground">
            Send certificates to recipients via email
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasConfig && (
            <Badge
              variant="outline"
              className="gap-1.5 text-green-600 border-green-600/20"
            >
              <CheckCircle2 className="h-3 w-3" />
              {emailConfig.provider === "gmail"
                ? emailConfig.gmail_email
                : emailConfig.resend_from_email}
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfig(!showConfig)}
          >
            <Settings className="h-4 w-4 mr-2" />
            {showConfig ? "Close" : "Email Settings"}
          </Button>
        </div>
      </div>

      {/* Config form (toggled) */}
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

      {/* No config state */}
      {!hasConfig && !showConfig && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-10">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <Mail className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-center">
              <CardTitle className="text-base">
                Email Not Configured
              </CardTitle>
              <CardDescription className="mt-1">
                Connect Gmail or Resend to start sending certificates.
              </CardDescription>
            </div>
            <Button onClick={() => setShowConfig(true)} className="mt-2">
              Configure Email
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Main content when config exists */}
      {hasConfig && (
        <>
          {certificates.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center gap-3 py-10">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="font-medium">No certificates generated</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Generate certificates first before distributing them.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Error banner */}
              {sendError && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {sendError}
                </div>
              )}

              {/* Email composer */}
              <EmailComposer
                eventName={event.name}
                certificates={certificates}
                aliases={aliases}
                onSend={handleSend}
                sending={sending}
              />

              {/* Progress + delivery log */}
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
