"use client";

import { useEffect, useState } from "react";
import { useParams, useSelectedLayoutSegment } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { steps, getStepStatus, getStepCount } from "@/lib/event-steps";
import type { EventStats } from "@/lib/event-steps";
import type { Event } from "@/types";
import Link from "next/link";
import {
  Check,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EventDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { eventId, orgSlug } = useParams<{
    eventId: string;
    orgSlug: string;
  }>();
  const segment = useSelectedLayoutSegment();

  const [event, setEvent] = useState<Event | null>(null);
  const [stats, setStats] = useState<EventStats>({
    templateCount: 0,
    recipientCount: 0,
    generatedCount: 0,
    sentCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      const { data: eventData } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (eventData) setEvent(eventData as Event);

      const [templates, recipients, generated] = await Promise.all([
        supabase
          .from("templates")
          .select("id", { count: "exact" })
          .eq("event_id", eventId),
        supabase
          .from("recipients")
          .select("id", { count: "exact" })
          .eq("event_id", eventId),
        supabase
          .from("generated_certificates")
          .select("id, recipients!inner(event_id)", { count: "exact" })
          .eq("recipients.event_id", eventId),
      ]);

      // Count sent certificates by checking status on generated_certificates
      const sent = await supabase
        .from("generated_certificates")
        .select("id, recipients!inner(event_id)", { count: "exact" })
        .eq("recipients.event_id", eventId)
        .eq("status", "sent");

      setStats({
        templateCount: templates.count ?? 0,
        recipientCount: recipients.count ?? 0,
        generatedCount: generated.count ?? 0,
        sentCount: sent.count ?? 0,
      });

      setLoading(false);
    };

    fetchData();
  }, [eventId]);

  const activeIndex = steps.findIndex((s) => s.key === segment);
  const basePath = `/dashboard/${orgSlug}/events/${eventId}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // If segment is null (overview page / redirect), just render children (the redirect)
  if (activeIndex === -1) {
    return <>{children}</>;
  }

  const prevStep = activeIndex > 0 ? steps[activeIndex - 1] : null;
  const nextStep = activeIndex < steps.length - 1 ? steps[activeIndex + 1] : null;

  return (
    <div className="flex flex-col h-[calc(100vh-2.5rem)] -m-6">
      {/* Top bar */}
      <div className="shrink-0 border-b">
        <div className="px-5 flex items-end h-12 gap-5">
          <Link
            href={`/dashboard/${orgSlug}/events`}
            className="p-1.5 mb-2.5 rounded-md hover:bg-accent transition-colors shrink-0"
          >
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          </Link>
          <span className="mb-2.5 text-sm font-semibold truncate">
            {event?.name}
          </span>

          {/* Step tabs — bottom-aligned with underline */}
          <nav className="flex items-end gap-1 ml-2">
            {steps.map((step, index) => {
              const status = getStepStatus(step.key, stats);
              const count = getStepCount(step.key, stats);
              const isActive = index === activeIndex;

              return (
                <Link
                  key={step.key}
                  href={`${basePath}/${step.key}`}
                  className={cn(
                    "relative px-3 pb-2.5 text-[13px] transition-colors",
                    isActive
                      ? "text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    {status === "complete" && !isActive && (
                      <Check className="h-3 w-3" strokeWidth={2.5} />
                    )}
                    {step.label}
                    {count !== null && (
                      <span className="text-[11px] text-muted-foreground">
                        {count}
                      </span>
                    )}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-foreground rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-5">{children}</div>
      </div>

      {/* Bottom pagination */}
      <div className="shrink-0 border-t">
        <div className="px-5 flex items-center justify-between h-11">
          {prevStep ? (
            <Button variant="ghost" size="sm" className="h-8 text-[13px]" asChild>
              <Link href={`${basePath}/${prevStep.key}`}>
                <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                {prevStep.label}
              </Link>
            </Button>
          ) : (
            <div />
          )}

          <span className="text-[13px] text-muted-foreground">
            Step {activeIndex + 1} of {steps.length}
          </span>

          {nextStep ? (
            <Button variant="ghost" size="sm" className="h-8 text-[13px]" asChild>
              <Link href={`${basePath}/${nextStep.key}`}>
                {nextStep.label}
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
}
