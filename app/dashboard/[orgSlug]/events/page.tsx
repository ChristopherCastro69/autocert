"use client";

import { useEffect, useState } from "react";
import { useOrg } from "@/components/context/OrgContext";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CalendarDays, Plus, Search } from "lucide-react";
import Link from "next/link";
import type { Event } from "@/types";

export default function EventsPage() {
  const { activeOrg } = useOrg();
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState("");
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

  const filtered = search
    ? events.filter(
        (e) =>
          e.name.toLowerCase().includes(search.toLowerCase()) ||
          e.description?.toLowerCase().includes(search.toLowerCase())
      )
    : events;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Events</h1>
          <p className="text-sm text-muted-foreground">
            {events.length} event{events.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild>
          <Link href={`/dashboard/${activeOrg.slug}/events/new`}>
            <Plus className="h-4 w-4 mr-2" />
            New Event
          </Link>
        </Button>
      </div>

      {events.length > 3 && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-10">
            <CalendarDays className="h-8 w-8 text-muted-foreground/50" />
            <div className="text-center">
              <p className="font-medium text-sm">
                {search ? "No matching events" : "No events yet"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {search
                  ? "Try a different search term."
                  : "Create your first event to start managing certificates."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event) => (
            <Link
              key={event.id}
              href={`/dashboard/${activeOrg.slug}/events/${event.id}`}
              className="group"
            >
              <Card className="transition-all hover:shadow-md hover:border-primary/30 h-full">
                <CardContent className="pt-5 pb-4">
                  <h3 className="font-medium truncate group-hover:text-primary transition-colors">
                    {event.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {event.description ?? "No description"}
                  </p>
                  {event.event_date && (
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
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
