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
    <div className="flex flex-col h-screen -m-6">
      {/* Top bar: back + name */}
      <div className="shrink-0 border-b">
        <div className="px-5 flex items-center h-11 gap-3">
          <Link
            href={`/dashboard/${orgSlug}/events`}
            className="p-1.5 rounded-md hover:bg-accent transition-colors shrink-0"
          >
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          </Link>
          <span className="text-sm font-semibold truncate">
            {event?.name}
          </span>
        </div>
      </div>

      {/* Stepper bar */}
      <div className="shrink-0 border-b py-3">
        <div className="flex items-center justify-center max-w-md mx-auto px-6">
          {steps.map((step, index) => {
            const status = getStepStatus(step.key, stats);
            const count = getStepCount(step.key, stats);
            const isActive = index === activeIndex;

            return (
              <div key={step.key} className="flex items-center flex-1 last:flex-none">
                <Link
                  href={`${basePath}/${step.key}`}
                  className="flex flex-col items-center group"
                >
                  <div
                    className={cn(
                      "h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all",
                      isActive &&
                        "bg-primary text-primary-foreground ring-[3px] ring-primary/20",
                      status === "complete" &&
                        !isActive &&
                        "bg-primary text-primary-foreground",
                      status === "ready" &&
                        !isActive &&
                        "border-2 border-border text-muted-foreground group-hover:border-primary/50",
                      status === "locked" &&
                        !isActive &&
                        "border-2 border-border text-muted-foreground/50"
                    )}
                  >
                    {status === "complete" && !isActive ? (
                      <Check className="h-3 w-3" strokeWidth={3} />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span
                    className={cn(
                      "mt-1 text-[11px] leading-none whitespace-nowrap",
                      isActive
                        ? "text-foreground font-semibold"
                        : "text-muted-foreground font-medium"
                    )}
                  >
                    {step.label}
                  </span>
                  {count !== null && (
                    <span className="text-[10px] text-muted-foreground leading-none mt-0.5">
                      {count}
                    </span>
                  )}
                </Link>
                {index < steps.length - 1 && (
                  <div className="flex-1 mx-2 h-px border-t-[1.5px] border-dashed border-border self-start mt-3.5" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-5">{children}</div>
      </div>

      {/* Bottom navigation */}
      <div className="shrink-0 border-t bg-card/50">
        <div className="px-5 flex items-center justify-between h-12">
          {prevStep ? (
            <Button variant="ghost" size="sm" className="text-[13px] gap-1.5" asChild>
              <Link href={`${basePath}/${prevStep.key}`}>
                <ChevronLeft className="h-3.5 w-3.5" />
                {prevStep.label}
              </Link>
            </Button>
          ) : (
            <div />
          )}

          {/* Step dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((step, index) => (
              <div
                key={step.key}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  index === activeIndex
                    ? "w-5 bg-primary"
                    : getStepStatus(step.key, stats) === "complete"
                      ? "w-1.5 bg-primary/50"
                      : "w-1.5 bg-muted-foreground/20"
                )}
              />
            ))}
          </div>

          {nextStep ? (
            <Button variant="ghost" size="sm" className="text-[13px] gap-1.5" asChild>
              <Link href={`${basePath}/${nextStep.key}`}>
                {nextStep.label}
                <ChevronRight className="h-3.5 w-3.5" />
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
