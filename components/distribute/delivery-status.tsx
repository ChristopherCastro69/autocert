"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RefreshCw, Search, ChevronDown, ChevronUp } from "lucide-react";
import type { EmailJob, GeneratedCertificateWithRecipient } from "@/types";

interface DeliveryStatusProps {
  jobs: EmailJob[];
  certificates: GeneratedCertificateWithRecipient[];
  onRefresh: () => void;
}

function statusBadge(status: string) {
  switch (status) {
    case "sent":
      return (
        <Badge className="bg-green-600/10 text-green-600 hover:bg-green-600/20 border-0 shadow-none">
          Sent
        </Badge>
      );
    case "failed":
      return (
        <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-0 shadow-none">
          Failed
        </Badge>
      );
    case "processing":
      return (
        <Badge className="bg-blue-600/10 text-blue-600 hover:bg-blue-600/20 border-0 shadow-none">
          Sending
        </Badge>
      );
    case "retrying":
      return (
        <Badge className="bg-yellow-600/10 text-yellow-600 hover:bg-yellow-600/20 border-0 shadow-none">
          Retrying
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="shadow-none">
          Queued
        </Badge>
      );
  }
}

export function DeliveryStatus({
  jobs,
  certificates,
  onRefresh,
}: DeliveryStatusProps) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(true);

  const hasPending = jobs.some(
    (j) =>
      j.status === "pending" ||
      j.status === "processing" ||
      j.status === "retrying"
  );

  useEffect(() => {
    if (hasPending) {
      intervalRef.current = setInterval(onRefresh, 5000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [hasPending, onRefresh]);

  const certMap = new Map(certificates.map((c) => [c.id, c]));

  if (jobs.length === 0) return null;

  const filtered = search
    ? jobs.filter((job) => {
        const cert = certMap.get(job.generated_certificate_id);
        const name = cert?.recipients
          ? `${cert.recipients.first_name} ${cert.recipients.last_name}`.toLowerCase()
          : "";
        const email = cert?.recipients?.email?.toLowerCase() ?? "";
        const q = search.toLowerCase();
        return name.includes(q) || email.includes(q) || job.status.includes(q);
      })
    : jobs;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <CardTitle className="text-base">Delivery Log</CardTitle>
              <CardDescription>
                {jobs.length} email{jobs.length !== 1 ? "s" : ""}
                {hasPending && " — auto-refreshing"}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onRefresh}
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${hasPending ? "animate-spin" : ""}`}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0">
          {jobs.length > 5 && (
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or status..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-8 text-sm"
              />
            </div>
          )}

          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 font-medium text-muted-foreground">
                    Recipient
                  </th>
                  <th className="text-left py-2 pr-4 font-medium text-muted-foreground">
                    Email
                  </th>
                  <th className="text-left py-2 pr-4 font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left py-2 pr-4 font-medium text-muted-foreground">
                    Attempts
                  </th>
                  <th className="text-left py-2 font-medium text-muted-foreground">
                    Error
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((job) => {
                  const cert = certMap.get(job.generated_certificate_id);
                  const recipient = cert?.recipients;
                  return (
                    <tr key={job.id} className="border-b last:border-0">
                      <td className="py-2.5 pr-4 font-medium">
                        {recipient
                          ? `${recipient.first_name} ${recipient.last_name}`
                          : "Unknown"}
                      </td>
                      <td className="py-2.5 pr-4 text-muted-foreground">
                        {recipient?.email ?? "-"}
                      </td>
                      <td className="py-2.5 pr-4">{statusBadge(job.status)}</td>
                      <td className="py-2.5 pr-4 tabular-nums text-muted-foreground">
                        {job.attempts}/{job.max_attempts}
                      </td>
                      <td className="py-2.5 text-muted-foreground text-xs truncate max-w-[200px]">
                        {job.last_error ?? "-"}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No matching results
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
