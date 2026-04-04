import { FileImage, Users, Award, Send } from "lucide-react";

export const GUEST_STEPS = [
  { key: "template", label: "Template", href: "/guest/template", icon: FileImage },
  { key: "recipients", label: "Recipients", href: "/guest/recipients", icon: Users },
  { key: "generate", label: "Generate", href: "/guest/generate", icon: Award },
  { key: "distribute", label: "Distribute", href: "/guest/distribute", icon: Send },
] as const;

export type GuestStepKey = (typeof GUEST_STEPS)[number]["key"];
