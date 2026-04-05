"use client";

import { useEffect, useState } from "react";
import { useOrg } from "@/components/context/OrgContext";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import {
  CalendarDays,
  Award,
  Mail,
  Users,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import type { Event } from "@/types";

interface OrgStats {
  events: number;
  recipients: number;
  certificates: number;
  emailsSent: number;
}

export default function OrgDashboardPage() {
  const { activeOrg } = useOrg();
  const [stats, setStats] = useState<OrgStats>({
    events: 0,
    recipients: 0,
    certificates: 0,
    emailsSent: 0,
  });
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeOrg) return;

    const fetchData = async () => {
      const supabase = createClient();

      const [eventsRes, events] = await Promise.all([
        supabase
          .from("events")
          .select("id", { count: "exact", head: true })
          .eq("org_id", activeOrg.id),
        supabase
          .from("events")
          .select("*")
          .eq("org_id", activeOrg.id)
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      const eventIds = (events.data ?? []).map((e: Event) => e.id);
      // Also get all event IDs for full stats
      const { data: allEvents } = await supabase
        .from("events")
        .select("id")
        .eq("org_id", activeOrg.id);
      const allEventIds = (allEvents ?? []).map((e: { id: string }) => e.id);

      let recipientCount = 0;
      let certCount = 0;
      let sentCount = 0;

      if (allEventIds.length > 0) {
        const [recipientsRes, certsRes, sentRes] = await Promise.all([
          supabase
            .from("recipients")
            .select("id", { count: "exact", head: true })
            .in("event_id", allEventIds),
          supabase
            .from("generated_certificates")
            .select("id, recipients!inner(event_id)", { count: "exact", head: true })
            .in("recipients.event_id", allEventIds),
          supabase
            .from("generated_certificates")
            .select("id, recipients!inner(event_id)", { count: "exact", head: true })
            .in("recipients.event_id", allEventIds)
            .eq("status", "sent"),
        ]);
        recipientCount = recipientsRes.count ?? 0;
        certCount = certsRes.count ?? 0;
        sentCount = sentRes.count ?? 0;
      }

      setStats({
        events: eventsRes.count ?? 0,
        recipients: recipientCount,
        certificates: certCount,
        emailsSent: sentCount,
      });
      setRecentEvents(events.data ?? []);
      setLoading(false);
    };

    fetchData();
  }, [activeOrg]);

  if (!activeOrg) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const statCards = [
    {
      label: "Events",
      value: stats.events,
      icon: CalendarDays,
      href: `/dashboard/${activeOrg.slug}/events`,
    },
    {
      label: "Recipients",
      value: stats.recipients,
      icon: Users,
    },
    {
      label: "Certificates",
      value: stats.certificates,
      icon: Award,
    },
    {
      label: "Emails Sent",
      value: stats.emailsSent,
      icon: Mail,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">{activeOrg.name}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Organization overview
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {stat.label}
                </span>
                <stat.icon className="h-4 w-4 text-muted-foreground/50" />
              </div>
              <p className="text-2xl font-semibold tabular-nums">
                {stat.value.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent events */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">Recent Events</h2>
          {stats.events > 5 && (
            <Link
              href={`/dashboard/${activeOrg.slug}/events`}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
        {recentEvents.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-3 py-10">
              <CalendarDays className="h-8 w-8 text-muted-foreground/50" />
              <div className="text-center">
                <p className="font-medium text-sm">No events yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Create your first event to start generating certificates.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {recentEvents.map((event) => (
              <Link
                key={event.id}
                href={`/dashboard/${activeOrg.slug}/events/${event.id}`}
                className="group"
              >
                <Card className="transition-all hover:shadow-md hover:border-primary/30">
                  <CardContent className="pt-5 pb-4">
                    <h3 className="font-medium truncate group-hover:text-primary transition-colors">
                      {event.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {event.description ?? "No description"}
                    </p>
                    {event.event_date && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(event.event_date).toLocaleDateString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
