"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Template } from "@/types";

interface TemplateCardProps {
  template: Template;
  onClick: (template: Template) => void;
}

export function TemplateCard({ template, onClick }: TemplateCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
      onClick={() => onClick(template)}
    >
      <div className="aspect-[4/3] relative bg-muted">
        <img
          src={template.template_url}
          alt={template.name}
          className="object-cover w-full h-full"
        />
      </div>
      <CardContent className="p-4 flex items-center justify-between gap-2">
        <p className="font-medium text-sm truncate">{template.name}</p>
        <Badge variant="secondary" className="capitalize shrink-0">
          {template.type}
        </Badge>
      </CardContent>
    </Card>
  );
}
