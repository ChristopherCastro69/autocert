"use client";

import { useState, useMemo, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Send,
  Eye,
  Code,
  User,
  Calendar,
  Users,
  FlaskConical,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { GeneratedCertificateWithRecipient } from "@/types";

type SendMode = "all" | "test" | "custom";

export interface GmailAlias {
  email: string;
  displayName: string;
  isPrimary: boolean;
}

interface EmailComposerProps {
  eventName: string;
  certificates: GeneratedCertificateWithRecipient[];
  aliases: GmailAlias[];
  onSend: (subject: string, body: string, certIds: string[], fromEmail: string) => void;
  sending: boolean;
}

const TEMPLATE_VARS = [
  { label: "First Name", value: "{{firstName}}", icon: User },
  { label: "Last Name", value: "{{lastName}}", icon: User },
  { label: "Event Name", value: "{{eventName}}", icon: Calendar },
];

export function EmailComposer({
  eventName,
  certificates,
  aliases,
  onSend,
  sending,
}: EmailComposerProps) {
  const [subject, setSubject] = useState(
    `Your Certificate for ${eventName}`
  );
  const [body, setBody] = useState(
    `<p>Hi {{firstName}},</p>\n<p>Thank you for participating in <strong>{{eventName}}</strong>. Please find your certificate attached.</p>\n<p>Best regards</p>`
  );
  const [showPreview, setShowPreview] = useState(true);
  const [fromEmail, setFromEmail] = useState(
    aliases.find((a) => a.isPrimary)?.email ?? aliases[0]?.email ?? ""
  );
  const [sendMode, setSendMode] = useState<SendMode>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [recipientSearch, setRecipientSearch] = useState("");
  const [showRecipientList, setShowRecipientList] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const validCerts = certificates.filter((c) => c.recipients.email);

  // Determine which certs will be sent based on mode
  const targetCerts = useMemo(() => {
    switch (sendMode) {
      case "test":
        return validCerts.slice(0, 1);
      case "custom":
        return validCerts.filter((c) => selectedIds.has(c.id));
      default:
        return validCerts;
    }
  }, [sendMode, validCerts, selectedIds]);

  const filteredCerts = useMemo(() => {
    if (!recipientSearch) return validCerts;
    const q = recipientSearch.toLowerCase();
    return validCerts.filter((c) => {
      const name = `${c.recipients.first_name} ${c.recipients.last_name}`.toLowerCase();
      const email = c.recipients.email?.toLowerCase() ?? "";
      return name.includes(q) || email.includes(q);
    });
  }, [validCerts, recipientSearch]);

  const preview = useMemo(() => {
    const first = certificates[0]?.recipients;
    if (!first) return body;
    return body
      .replace(/\{\{firstName\}\}/g, first.first_name)
      .replace(/\{\{lastName\}\}/g, first.last_name)
      .replace(/\{\{eventName\}\}/g, eventName);
  }, [body, certificates, eventName]);

  const previewSubject = useMemo(() => {
    const first = certificates[0]?.recipients;
    if (!first) return subject;
    return subject
      .replace(/\{\{firstName\}\}/g, first.first_name)
      .replace(/\{\{lastName\}\}/g, first.last_name)
      .replace(/\{\{eventName\}\}/g, eventName);
  }, [subject, certificates, eventName]);

  const insertVariable = (variable: string) => {
    const textarea = bodyRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newBody = body.slice(0, start) + variable + body.slice(end);
      setBody(newBody);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd =
          start + variable.length;
        textarea.focus();
      }, 0);
    } else {
      setBody((prev) => prev + variable);
    }
  };

  const toggleRecipient = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === validCerts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(validCerts.map((c) => c.id)));
    }
  };

  const handleSend = () => {
    if (!subject.trim()) {
      toast.error("Subject is required");
      return;
    }
    if (!body.trim()) {
      toast.error("Email body is required");
      return;
    }
    if (targetCerts.length === 0) {
      toast.error("No recipients selected");
      return;
    }
    if (!fromEmail) {
      toast.error("Select a sender address");
      return;
    }
    // Format as "Display Name <email>" if alias has a display name
    const formattedFrom = selectedAlias?.displayName
      ? `${selectedAlias.displayName} <${fromEmail}>`
      : fromEmail;

    onSend(
      subject,
      body,
      targetCerts.map((c) => c.id),
      formattedFrom
    );
  };

  const selectedAlias = aliases.find((a) => a.email === fromEmail);

  return (
    <div className="space-y-4">
      {/* Email composer card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Compose Email</CardTitle>
              <CardDescription>
                Each recipient will receive a personalized email with their
                certificate attached.
              </CardDescription>
            </div>
            <Button
              variant={showPreview ? "default" : "outline"}
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? (
                <Code className="h-3.5 w-3.5 mr-1.5" />
              ) : (
                <Eye className="h-3.5 w-3.5 mr-1.5" />
              )}
              {showPreview ? "Edit" : "Preview"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!showPreview ? (
            <div className="space-y-4">
              {aliases.length > 1 && (
                <div className="space-y-2">
                  <Label>From</Label>
                  <Select value={fromEmail} onValueChange={setFromEmail}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {aliases.map((a) => (
                        <SelectItem key={a.email} value={a.email}>
                          {a.displayName ? `${a.displayName} <${a.email}>` : a.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="body">Body (HTML)</Label>
                  <div className="flex gap-1.5">
                    {TEMPLATE_VARS.map((v) => (
                      <Button
                        key={v.value}
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1 text-muted-foreground"
                        type="button"
                        onClick={() => insertVariable(v.value)}
                      >
                        <v.icon className="h-3 w-3" />
                        {v.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <Textarea
                  id="body"
                  ref={bodyRef}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                  placeholder="Email body..."
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-lg border bg-background p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground font-medium w-16">
                    From:
                  </span>
                  {aliases.length > 1 ? (
                    <Select value={fromEmail} onValueChange={setFromEmail}>
                      <SelectTrigger className="h-7 w-auto border-0 shadow-none p-0 text-sm font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {aliases.map((a) => (
                          <SelectItem key={a.email} value={a.email}>
                            {a.displayName ? `${a.displayName} <${a.email}>` : a.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="font-medium">
                      {selectedAlias?.displayName
                        ? `${selectedAlias.displayName} <${fromEmail}>`
                        : fromEmail}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground font-medium w-16">
                    To:
                  </span>
                  <span>
                    {certificates[0]?.recipients
                      ? `${certificates[0].recipients.first_name} ${certificates[0].recipients.last_name} <${certificates[0].recipients.email}>`
                      : "recipient@example.com"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground font-medium w-16">
                    Subject:
                  </span>
                  <span className="font-medium">{previewSubject}</span>
                </div>
                <div className="border-t pt-3">
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: preview }}
                  />
                  <div className="mt-4 flex items-center gap-2 rounded-md bg-muted/50 p-3">
                    <div className="h-8 w-8 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                      PNG
                    </div>
                    <div className="text-xs">
                      <p className="font-medium">
                        {certificates[0]?.recipients
                          ? `${certificates[0].recipients.first_name}_${certificates[0].recipients.last_name}_certificate.png`
                          : "certificate.png"}
                      </p>
                      <p className="text-muted-foreground">
                        Certificate attachment
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {certificates[0]?.recipients && (
                <p className="text-xs text-muted-foreground text-center">
                  Previewing for {certificates[0].recipients.first_name}{" "}
                  {certificates[0].recipients.last_name}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recipients selector */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Recipients</CardTitle>
            {certificates.length - validCerts.length > 0 && (
              <Badge variant="outline" className="text-xs text-yellow-600">
                {certificates.length - validCerts.length} skipped (no email)
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Mode selector */}
          <div className="flex gap-2">
            <Button
              variant={sendMode === "all" ? "default" : "outline"}
              size="sm"
              className="gap-1.5"
              onClick={() => {
                setSendMode("all");
                setShowRecipientList(false);
              }}
            >
              <Users className="h-3.5 w-3.5" />
              All ({validCerts.length})
            </Button>
            <Button
              variant={sendMode === "test" ? "default" : "outline"}
              size="sm"
              className="gap-1.5"
              onClick={() => {
                setSendMode("test");
                setShowRecipientList(false);
              }}
            >
              <FlaskConical className="h-3.5 w-3.5" />
              Test (1st)
            </Button>
            <Button
              variant={sendMode === "custom" ? "default" : "outline"}
              size="sm"
              className="gap-1.5"
              onClick={() => {
                setSendMode("custom");
                setShowRecipientList(true);
                if (selectedIds.size === 0) {
                  setSelectedIds(new Set(validCerts.map((c) => c.id)));
                }
              }}
            >
              <Search className="h-3.5 w-3.5" />
              Custom
            </Button>
          </div>

          {/* Mode description */}
          {sendMode === "test" && (
            <p className="text-xs text-muted-foreground">
              Send to{" "}
              <span className="font-medium text-foreground">
                {validCerts[0]?.recipients.first_name}{" "}
                {validCerts[0]?.recipients.last_name}
              </span>{" "}
              only — great for testing before sending to everyone.
            </p>
          )}

          {/* Custom recipient list */}
          {sendMode === "custom" && (
            <>
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={toggleAll}
                >
                  {selectedIds.size === validCerts.length
                    ? "Deselect all"
                    : "Select all"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => setShowRecipientList(!showRecipientList)}
                >
                  {selectedIds.size} selected
                  {showRecipientList ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </Button>
              </div>

              {showRecipientList && (
                <>
                  {validCerts.length > 10 && (
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Search recipients..."
                        value={recipientSearch}
                        onChange={(e) => setRecipientSearch(e.target.value)}
                        className="pl-9 h-8 text-sm"
                      />
                    </div>
                  )}
                  <div className="max-h-[200px] overflow-y-auto rounded-md border divide-y">
                    {filteredCerts.map((cert) => (
                      <label
                        key={cert.id}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-accent/50 transition-colors",
                          selectedIds.has(cert.id) && "bg-accent/30"
                        )}
                      >
                        <Checkbox
                          checked={selectedIds.has(cert.id)}
                          onCheckedChange={() => toggleRecipient(cert.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium">
                            {cert.recipients.first_name}{" "}
                            {cert.recipients.last_name}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground truncate">
                          {cert.recipients.email}
                        </span>
                      </label>
                    ))}
                    {filteredCerts.length === 0 && (
                      <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                        No matching recipients
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Send button */}
      <div className="flex items-center justify-end">
        <Button
          onClick={handleSend}
          disabled={sending || targetCerts.length === 0}
          size="default"
        >
          {sending ? (
            "Sending..."
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              {sendMode === "test"
                ? "Send test email"
                : `Send to ${targetCerts.length} recipient${targetCerts.length !== 1 ? "s" : ""}`}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
