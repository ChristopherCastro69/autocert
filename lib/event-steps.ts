import { FileImage, Users, Award, Mail } from "lucide-react";

export interface EventStats {
  templateCount: number;
  recipientCount: number;
  generatedCount: number;
  sentCount: number;
}

export const steps = [
  {
    key: "templates",
    label: "Templates",
    description: "Upload and configure your certificate template",
    icon: FileImage,
  },
  {
    key: "recipients",
    label: "Recipients",
    description: "Import your attendee list via CSV or XLSX",
    icon: Users,
  },
  {
    key: "generate",
    label: "Generate",
    description: "Preview and batch-generate all certificates",
    icon: Award,
  },
  {
    key: "distribute",
    label: "Distribute",
    description: "Send certificates to recipients via email",
    icon: Mail,
  },
] as const;

export type StepKey = (typeof steps)[number]["key"];

export function getStepStatus(
  stepKey: string,
  stats: EventStats
): "complete" | "ready" | "locked" {
  switch (stepKey) {
    case "templates":
      return stats.templateCount > 0 ? "complete" : "ready";
    case "recipients":
      return stats.recipientCount > 0
        ? "complete"
        : stats.templateCount > 0
          ? "ready"
          : "locked";
    case "generate":
      return stats.generatedCount > 0
        ? "complete"
        : stats.templateCount > 0 && stats.recipientCount > 0
          ? "ready"
          : "locked";
    case "distribute":
      return stats.sentCount > 0
        ? "complete"
        : stats.generatedCount > 0
          ? "ready"
          : "locked";
    default:
      return "locked";
  }
}

export function getStepCount(stepKey: string, stats: EventStats): number | null {
  switch (stepKey) {
    case "templates":
      return stats.templateCount || null;
    case "recipients":
      return stats.recipientCount || null;
    case "generate":
      return stats.generatedCount || null;
    case "distribute":
      return stats.sentCount || null;
    default:
      return null;
  }
}
