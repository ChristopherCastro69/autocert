"use client";

import { useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EmailJob, GeneratedCertificateWithRecipient } from "@/types";

interface DeliveryStatusProps {
  jobs: EmailJob[];
  certificates: GeneratedCertificateWithRecipient[];
  onRefresh: () => void;
}

function statusBadge(status: string) {
  switch (status) {
    case "sent":
      return <Badge className="bg-green-600 hover:bg-green-700">Sent</Badge>;
    case "failed":
      return <Badge variant="destructive">Failed</Badge>;
    case "processing":
      return <Badge className="bg-blue-600 hover:bg-blue-700">Processing</Badge>;
    case "retrying":
      return <Badge className="bg-yellow-600 hover:bg-yellow-700">Retrying</Badge>;
    default:
      return <Badge variant="secondary">Pending</Badge>;
  }
}

export function DeliveryStatus({ jobs, certificates, onRefresh }: DeliveryStatusProps) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hasPending = jobs.some(
    (j) => j.status === "pending" || j.status === "processing" || j.status === "retrying"
  );

  useEffect(() => {
    if (hasPending) {
      intervalRef.current = setInterval(onRefresh, 5000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [hasPending, onRefresh]);

  const certMap = new Map(
    certificates.map((c) => [c.id, c])
  );

  if (jobs.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Delivery Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4">Recipient</th>
                <th className="text-left py-2 pr-4">Email</th>
                <th className="text-left py-2 pr-4">Status</th>
                <th className="text-left py-2 pr-4">Attempts</th>
                <th className="text-left py-2">Error</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => {
                const cert = certMap.get(job.generated_certificate_id);
                const recipient = cert?.recipients;
                return (
                  <tr key={job.id} className="border-b last:border-0">
                    <td className="py-2 pr-4">
                      {recipient
                        ? `${recipient.first_name} ${recipient.last_name}`
                        : "Unknown"}
                    </td>
                    <td className="py-2 pr-4 text-muted-foreground">
                      {recipient?.email ?? "-"}
                    </td>
                    <td className="py-2 pr-4">{statusBadge(job.status)}</td>
                    <td className="py-2 pr-4">{job.attempts}/{job.max_attempts}</td>
                    <td className="py-2 text-muted-foreground truncate max-w-[200px]">
                      {job.last_error ?? "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
