"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useOrg } from "@/components/context/OrgContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileImage, Users, Award, Mail } from "lucide-react";
import Link from "next/link";
import type { Event } from "@/types";

interface EventStats {
  templateCount: number;
  recipientCount: number;
  generatedCount: number;
  sentCount: number;
}

export default function EventOverviewPage() {
  const { eventId, orgSlug } = useParams<{ eventId: string; orgSlug: string }>();
  const { activeOrg } = useOrg();
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

      const [templates, recipients] = await Promise.all([
        supabase.from("templates").select("id", { count: "exact" }).eq("event_id", eventId),
        supabase.from("recipients").select("id", { count: "exact" }).eq("event_id", eventId),
      ]);

      setStats({
        templateCount: templates.count ?? 0,
        recipientCount: recipients.count ?? 0,
        generatedCount: 0,
        sentCount: 0,
      });

      setLoading(false);
    };

    fetchData();
  }, [eventId]);

  if (loading || !event || !activeOrg) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  const basePath = `/dashboard/${orgSlug}/events/${eventId}`;

  const sections = [
    {
      href: `${basePath}/templates`,
      icon: FileImage,
      title: "Templates",
      description: "Upload and configure certificate templates",
      count: stats.templateCount,
    },
    {
      href: `${basePath}/recipients`,
      icon: Users,
      title: "Recipients",
      description: "Manage attendee list",
      count: stats.recipientCount,
    },
    {
      href: `${basePath}/generate`,
      icon: Award,
      title: "Generate",
      description: "Generate certificates for all recipients",
      count: stats.generatedCount,
    },
    {
      href: `${basePath}/distribute`,
      icon: Mail,
      title: "Distribute",
      description: "Send certificates via email",
      count: stats.sentCount,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{event.name}</h1>
        {event.description && (
          <p className="text-muted-foreground mt-1">{event.description}</p>
        )}
        {event.event_date && (
          <p className="text-sm text-muted-foreground mt-1">
            {new Date(event.event_date).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <section.icon className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">{section.title}</CardTitle>
                {section.count > 0 && (
                  <span className="ml-auto text-sm text-muted-foreground">
                    {section.count}
                  </span>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{section.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
