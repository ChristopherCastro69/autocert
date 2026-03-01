"use client";

import { useEffect, useState } from "react";
import { useOrg } from "@/components/context/OrgContext";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { CalendarDays, Plus } from "lucide-react";
import Link from "next/link";
import type { Event } from "@/types";

export default function OrgDashboardPage() {
  const { activeOrg } = useOrg();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeOrg) return;

    const fetchEvents = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("org_id", activeOrg.id)
        .order("created_at", { ascending: false });

      setEvents(data ?? []);
      setLoading(false);
    };

    fetchEvents();
  }, [activeOrg]);

  if (!activeOrg) return null;

  if (loading) {
    return <p className="text-muted-foreground">Loading events...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{activeOrg.name}</h1>
        <Button asChild>
          <Link href={`/dashboard/${activeOrg.slug}/events/new`}>
            <Plus className="h-4 w-4 mr-2" />
            New Event
          </Link>
        </Button>
      </div>

      {events.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No events yet"
          description="Create your first event to start managing certificates."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/dashboard/${activeOrg.slug}/events/${event.id}`}
            >
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">{event.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
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
  );
}
