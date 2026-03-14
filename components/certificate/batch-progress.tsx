"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface BatchProgressProps {
  current: number;
  total: number;
  onCancel: () => void;
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.ceil(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.ceil(seconds % 60);
  return `${mins}m ${secs}s`;
}

export function BatchProgress({ current, total, onCancel }: BatchProgressProps) {
  const [startTime] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  const perCert = current > 0 ? elapsed / current : 0;
  const remaining = current > 0 ? perCert * (total - current) : 0;

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          {current} / {total} certificates ({percentage}%)
        </p>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Progress value={percentage} />

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Elapsed: {formatTime(elapsed)}</span>
        {current > 0 && current < total && (
          <span>~{formatTime(remaining)} remaining</span>
        )}
      </div>
    </div>
  );
}
