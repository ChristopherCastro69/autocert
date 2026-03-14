"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { TemplateCard } from "@/components/templates/template-card";
import { TemplateUpload } from "@/components/templates/template-upload";
import { Plus } from "lucide-react";
import type { Template } from "@/types";

export default function TemplatesPage() {
  const { eventId, orgSlug } = useParams<{ eventId: string; orgSlug: string }>();
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);

  const fetchTemplates = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("templates")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });

    setTemplates((data as Template[]) ?? []);
    setLoading(false);
  }, [eventId]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleCardClick = (template: Template) => {
    router.push(
      `/dashboard/${orgSlug}/events/${eventId}/generate?templateId=${template.id}`
    );
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading templates...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Templates</h1>
        <Button onClick={() => setUploadOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Upload Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No templates yet. Upload one to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <TemplateCard key={t.id} template={t} onClick={handleCardClick} />
          ))}
        </div>
      )}

      <TemplateUpload
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        eventId={eventId}
        onUploaded={fetchTemplates}
      />
    </div>
  );
}
