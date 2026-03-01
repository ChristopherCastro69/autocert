"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GeneratedCertificateWithRecipient } from "@/types";

interface EmailComposerProps {
  eventName: string;
  certificates: GeneratedCertificateWithRecipient[];
  onSend: (subject: string, body: string) => void;
  sending: boolean;
}

const TEMPLATE_VARS = [
  { label: "First Name", value: "{{firstName}}" },
  { label: "Last Name", value: "{{lastName}}" },
  { label: "Event Name", value: "{{eventName}}" },
];

export function EmailComposer({
  eventName,
  certificates,
  onSend,
  sending,
}: EmailComposerProps) {
  const [subject, setSubject] = useState(
    `Your Certificate for ${eventName}`
  );
  const [body, setBody] = useState(
    `<p>Hi {{firstName}},</p>\n<p>Thank you for participating in {{eventName}}. Please find your certificate attached.</p>\n<p>Best regards</p>`
  );

  const preview = useMemo(() => {
    const first = certificates[0]?.recipients;
    if (!first) return body;
    return body
      .replace(/\{\{firstName\}\}/g, first.first_name)
      .replace(/\{\{lastName\}\}/g, first.last_name)
      .replace(/\{\{eventName\}\}/g, eventName);
  }, [body, certificates, eventName]);

  const insertVariable = (variable: string) => {
    setBody((prev) => prev + variable);
  };

  const handleSend = () => {
    if (!subject.trim() || !body.trim()) return;
    onSend(subject, body);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Compose Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Body (HTML)</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              placeholder="Email body..."
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {TEMPLATE_VARS.map((v) => (
              <Button
                key={v.value}
                variant="outline"
                size="sm"
                type="button"
                onClick={() => insertVariable(v.value)}
              >
                + {v.label}
              </Button>
            ))}
          </div>
          <Button
            onClick={handleSend}
            disabled={sending || certificates.length === 0}
            className="w-full"
          >
            {sending ? "Sending..." : `Send to ${certificates.length} recipients`}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Subject: {subject}
            </p>
            <div
              className="prose prose-sm dark:prose-invert border rounded-md p-3 min-h-[120px]"
              dangerouslySetInnerHTML={{ __html: preview }}
            />
            {certificates[0]?.recipients && (
              <p className="text-xs text-muted-foreground">
                Previewing for: {certificates[0].recipients.first_name}{" "}
                {certificates[0].recipients.last_name}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
