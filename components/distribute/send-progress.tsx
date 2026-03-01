"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { EmailJob } from "@/types";

interface SendProgressProps {
  jobs: EmailJob[];
}

export function SendProgress({ jobs }: SendProgressProps) {
  if (jobs.length === 0) return null;

  const total = jobs.length;
  const sent = jobs.filter((j) => j.status === "sent").length;
  const failed = jobs.filter((j) => j.status === "failed").length;
  const percentage = Math.round((sent / total) * 100);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>
              {sent} / {total} sent ({percentage}%)
            </span>
            {failed > 0 && (
              <span className="text-destructive">{failed} failed</span>
            )}
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
