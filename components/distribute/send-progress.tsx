"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import type { EmailJob } from "@/types";

interface SendProgressProps {
  jobs: EmailJob[];
}

export function SendProgress({ jobs }: SendProgressProps) {
  if (jobs.length === 0) return null;

  const total = jobs.length;
  const sent = jobs.filter((j) => j.status === "sent").length;
  const failed = jobs.filter((j) => j.status === "failed").length;
  const processing = jobs.filter(
    (j) => j.status === "processing" || j.status === "retrying"
  ).length;
  const pending = jobs.filter((j) => j.status === "pending").length;
  const percentage = Math.round((sent / total) * 100);
  const isActive = processing > 0 || pending > 0;

  return (
    <Card>
      <CardContent className="pt-5 pb-5">
        <div className="space-y-3">
          {/* Progress bar */}
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${Math.max(percentage, failed > 0 && sent === 0 ? 100 : 0)}%`,
                background:
                  failed > 0 && sent === 0
                    ? "hsl(var(--destructive))"
                    : "hsl(var(--primary))",
              }}
            />
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              {sent > 0 && (
                <span className="flex items-center gap-1.5 text-green-600">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {sent} sent
                </span>
              )}
              {failed > 0 && (
                <span className="flex items-center gap-1.5 text-destructive">
                  <XCircle className="h-3.5 w-3.5" />
                  {failed} failed
                </span>
              )}
              {processing > 0 && (
                <span className="flex items-center gap-1.5 text-blue-600">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {processing} processing
                </span>
              )}
              {pending > 0 && (
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {pending} queued
                </span>
              )}
            </div>
            <span className="text-muted-foreground tabular-nums">
              {sent}/{total} ({percentage}%)
              {isActive && " — sending..."}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
