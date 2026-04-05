"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useGuest } from "@/components/context/guest-context";
import type { GuestEmailConfig, GuestEmailProvider } from "@/components/context/guest-context";
import { SaveWorkCard } from "@/components/guest/save-work-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import DOMPurify from "dompurify";
import {
  AlertCircle,
  Mail,
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
  CheckCircle2,
  Loader2,
} from "lucide-react";

// ─── Provider Config ───

function GuestEmailSetup({
  emailConfig,
  onConfigChange,
}: {
  emailConfig: GuestEmailConfig | null;
  onConfigChange: (config: GuestEmailConfig | null) => void;
}) {
  const [provider, setProvider] = useState<GuestEmailProvider>(
    emailConfig?.provider ?? "gmail"
  );

  // Resend fields
  const [resendApiKey, setResendApiKey] = useState(emailConfig?.resendApiKey ?? "");
  const [resendFromEmail, setResendFromEmail] = useState(emailConfig?.fromEmail ?? "");

  // SMTP fields
  const [smtpHost, setSmtpHost] = useState(emailConfig?.smtpHost ?? "");
  const [smtpPort, setSmtpPort] = useState(emailConfig?.smtpPort?.toString() ?? "465");
  const [smtpSecure, setSmtpSecure] = useState(emailConfig?.smtpSecure ?? true);
  const [smtpUsername, setSmtpUsername] = useState(emailConfig?.smtpUsername ?? "");
  const [smtpPassword, setSmtpPassword] = useState(emailConfig?.smtpPassword ?? "");
  const [smtpFromEmail, setSmtpFromEmail] = useState(emailConfig?.fromEmail ?? "");

  const handleGmailConnect = () => {
    // Open Gmail OAuth in a popup so we don't lose React state
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    window.open(
      "/api/auth/gmail/guest-authorize?returnTo=/guest/gmail-callback",
      "gmail-oauth",
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  const handleResendSave = () => {
    if (!resendApiKey.trim() || !resendFromEmail.trim()) {
      toast.error("API key and from email are required");
      return;
    }
    onConfigChange({
      provider: "resend",
      fromEmail: resendFromEmail.trim(),
      resendApiKey: resendApiKey.trim(),
    });
    toast.success("Resend configured");
  };

  const handleSmtpSave = () => {
    if (!smtpHost.trim() || !smtpUsername.trim() || !smtpPassword.trim() || !smtpFromEmail.trim()) {
      toast.error("All SMTP fields are required");
      return;
    }
    onConfigChange({
      provider: "smtp",
      fromEmail: smtpFromEmail.trim(),
      smtpHost: smtpHost.trim(),
      smtpPort: parseInt(smtpPort) || 465,
      smtpSecure: smtpSecure,
      smtpUsername: smtpUsername.trim(),
      smtpPassword: smtpPassword.trim(),
    });
    toast.success("SMTP configured");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Email Provider
        </CardTitle>
        <CardDescription>
          Connect your email account to send certificates. Credentials stay in your browser.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          {(["gmail", "resend", "smtp"] as const).map((p) => (
            <Button
              key={p}
              variant={provider === p ? "default" : "outline"}
              size="sm"
              onClick={() => setProvider(p)}
              className="capitalize"
            >
              {p === "smtp" ? "SMTP" : p === "gmail" ? "Gmail" : "Resend"}
            </Button>
          ))}
        </div>

        {provider === "gmail" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Sign in with your Google account to send emails via Gmail. No data is stored on our servers.
            </p>
            {emailConfig?.provider === "gmail" ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">
                  Connected as {emailConfig.fromEmail}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onConfigChange(null)}
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button onClick={handleGmailConnect}>
                <Mail className="mr-2 h-4 w-4" />
                Connect Gmail
              </Button>
            )}
          </div>
        )}

        {provider === "resend" && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Resend API Key</Label>
              <Input
                type="password"
                value={resendApiKey}
                onChange={(e) => setResendApiKey(e.target.value)}
                placeholder="re_..."
              />
            </div>
            <div className="space-y-2">
              <Label>From Email</Label>
              <Input
                type="email"
                value={resendFromEmail}
                onChange={(e) => setResendFromEmail(e.target.value)}
                placeholder="noreply@yourdomain.com"
              />
            </div>
            <Button onClick={handleResendSave} size="sm">
              Save Resend Config
            </Button>
          </div>
        )}

        {provider === "smtp" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>SMTP Host</Label>
                <Input
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Port</Label>
                <Input
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value)}
                  placeholder="465"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Username</Label>
                <Input
                  value={smtpUsername}
                  onChange={(e) => setSmtpUsername(e.target.value)}
                  placeholder="user@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  value={smtpPassword}
                  onChange={(e) => setSmtpPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>From Email</Label>
              <Input
                type="email"
                value={smtpFromEmail}
                onChange={(e) => setSmtpFromEmail(e.target.value)}
                placeholder="noreply@example.com"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="smtp-secure"
                checked={smtpSecure}
                onCheckedChange={(v) => setSmtpSecure(v === true)}
              />
              <Label htmlFor="smtp-secure" className="text-sm">
                Use SSL/TLS (port 465)
              </Label>
            </div>
            <Button onClick={handleSmtpSave} size="sm">
              Save SMTP Config
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Email Composer (adapted for guest mode) ───

const TEMPLATE_VARS = [
  { label: "First Name", value: "{{firstName}}", icon: User },
  { label: "Last Name", value: "{{lastName}}", icon: User },
  { label: "Event Name", value: "{{eventName}}", icon: Calendar },
];

type SendMode = "all" | "test" | "custom";

interface GuestCertRecipient {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  blob: Blob;
}

function GuestEmailComposer({
  eventName,
  certRecipients,
  fromEmail,
  onSend,
  sending,
}: {
  eventName: string;
  certRecipients: GuestCertRecipient[];
  fromEmail: string;
  onSend: (subject: string, body: string, recipientIds: string[]) => void;
  sending: boolean;
}) {
  const [subject, setSubject] = useState(`Your Certificate for ${eventName}`);
  const [body, setBody] = useState(
    `<p>Hi {{firstName}},</p>\n<p>Thank you for participating in <strong>{{eventName}}</strong>. Please find your certificate attached.</p>\n<p>Best regards</p>`
  );
  const [showPreview, setShowPreview] = useState(true);
  const [sendMode, setSendMode] = useState<SendMode>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [recipientSearch, setRecipientSearch] = useState("");
  const [showRecipientList, setShowRecipientList] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const validCerts = certRecipients.filter((c) => c.email);

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
      const name = `${c.firstName} ${c.lastName}`.toLowerCase();
      const email = c.email?.toLowerCase() ?? "";
      return name.includes(q) || email.includes(q);
    });
  }, [validCerts, recipientSearch]);

  const preview = useMemo(() => {
    const first = certRecipients[0];
    if (!first) return body;
    return body
      .replace(/\{\{firstName\}\}/g, first.firstName)
      .replace(/\{\{lastName\}\}/g, first.lastName)
      .replace(/\{\{eventName\}\}/g, eventName);
  }, [body, certRecipients, eventName]);

  const previewSubject = useMemo(() => {
    const first = certRecipients[0];
    if (!first) return subject;
    return subject
      .replace(/\{\{firstName\}\}/g, first.firstName)
      .replace(/\{\{lastName\}\}/g, first.lastName)
      .replace(/\{\{eventName\}\}/g, eventName);
  }, [subject, certRecipients, eventName]);

  const insertVariable = (variable: string) => {
    const textarea = bodyRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newBody = body.slice(0, start) + variable + body.slice(end);
      setBody(newBody);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + variable.length;
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
    if (!subject.trim()) { toast.error("Subject is required"); return; }
    if (!body.trim()) { toast.error("Email body is required"); return; }
    if (targetCerts.length === 0) { toast.error("No recipients selected"); return; }

    onSend(subject, body, targetCerts.map((c) => c.id));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Compose Email</CardTitle>
              <CardDescription>
                Each recipient receives a personalized email with their certificate attached.
              </CardDescription>
            </div>
            <Button
              variant={showPreview ? "default" : "outline"}
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? <Code className="h-3.5 w-3.5 mr-1.5" /> : <Eye className="h-3.5 w-3.5 mr-1.5" />}
              {showPreview ? "Edit" : "Preview"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!showPreview ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>From</Label>
                <Input value={fromEmail} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Email subject..." />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="body">Body (HTML)</Label>
                  <div className="flex gap-1.5">
                    {TEMPLATE_VARS.map((v) => (
                      <Button key={v.value} variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground" type="button" onClick={() => insertVariable(v.value)}>
                        <v.icon className="h-3 w-3" />
                        {v.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <Textarea id="body" ref={bodyRef} value={body} onChange={(e) => setBody(e.target.value)} rows={10} className="font-mono text-sm" />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-lg border bg-background p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground font-medium w-16">From:</span>
                  <span className="font-medium">{fromEmail}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground font-medium w-16">To:</span>
                  <span>
                    {certRecipients[0]
                      ? `${certRecipients[0].firstName} ${certRecipients[0].lastName} <${certRecipients[0].email}>`
                      : "recipient@example.com"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground font-medium w-16">Subject:</span>
                  <span className="font-medium">{previewSubject}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(preview) }} />
                  <div className="mt-4 flex items-center gap-2 rounded-md bg-muted/50 p-3">
                    <div className="h-8 w-8 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">PNG</div>
                    <div className="text-xs">
                      <p className="font-medium">
                        {certRecipients[0] ? `${certRecipients[0].firstName}_${certRecipients[0].lastName}_certificate.png` : "certificate.png"}
                      </p>
                      <p className="text-muted-foreground">Certificate attachment</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recipients */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Recipients</CardTitle>
            {certRecipients.length - validCerts.length > 0 && (
              <Badge variant="outline" className="text-xs text-yellow-600">
                {certRecipients.length - validCerts.length} skipped (no email)
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Button variant={sendMode === "all" ? "default" : "outline"} size="sm" className="gap-1.5" onClick={() => { setSendMode("all"); setShowRecipientList(false); }}>
              <Users className="h-3.5 w-3.5" />All ({validCerts.length})
            </Button>
            <Button variant={sendMode === "test" ? "default" : "outline"} size="sm" className="gap-1.5" onClick={() => { setSendMode("test"); setShowRecipientList(false); }}>
              <FlaskConical className="h-3.5 w-3.5" />Test (1st)
            </Button>
            <Button variant={sendMode === "custom" ? "default" : "outline"} size="sm" className="gap-1.5" onClick={() => { setSendMode("custom"); setShowRecipientList(true); if (selectedIds.size === 0) setSelectedIds(new Set(validCerts.map((c) => c.id))); }}>
              <Search className="h-3.5 w-3.5" />Custom
            </Button>
          </div>

          {sendMode === "test" && validCerts[0] && (
            <p className="text-xs text-muted-foreground">
              Send to <span className="font-medium text-foreground">{validCerts[0].firstName} {validCerts[0].lastName}</span> only.
            </p>
          )}

          {sendMode === "custom" && (
            <>
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={toggleAll}>
                  {selectedIds.size === validCerts.length ? "Deselect all" : "Select all"}
                </Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setShowRecipientList(!showRecipientList)}>
                  {selectedIds.size} selected
                  {showRecipientList ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </Button>
              </div>
              {showRecipientList && (
                <>
                  {validCerts.length > 10 && (
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input placeholder="Search recipients..." value={recipientSearch} onChange={(e) => setRecipientSearch(e.target.value)} className="pl-9 h-8 text-sm" />
                    </div>
                  )}
                  <div className="max-h-[200px] overflow-y-auto rounded-md border divide-y">
                    {filteredCerts.map((cert) => (
                      <label key={cert.id} className={cn("flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-accent/50 transition-colors", selectedIds.has(cert.id) && "bg-accent/30")}>
                        <Checkbox checked={selectedIds.has(cert.id)} onCheckedChange={() => toggleRecipient(cert.id)} />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium">{cert.firstName} {cert.lastName}</span>
                        </div>
                        <span className="text-xs text-muted-foreground truncate">{cert.email}</span>
                      </label>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-end">
        <Button onClick={handleSend} disabled={sending || targetCerts.length === 0}>
          {sending ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending...</>
          ) : (
            <><Send className="h-4 w-4 mr-2" />{sendMode === "test" ? "Send test email" : `Send to ${targetCerts.length} recipient${targetCerts.length !== 1 ? "s" : ""}`}</>
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Main Page ───

async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export default function GuestDistributePage() {
  const router = useRouter();
  const {
    generatedCerts,
    recipients,
    templateName,
    emailConfig,
    setEmailConfig,
  } = useGuest();

  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ sent: number; failed: number } | null>(null);

  // Listen for Gmail tokens from OAuth popup via postMessage
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "gmail-oauth-callback") return;

      const { gmail_connected, gmail_access_token, gmail_refresh_token, gmail_email, gmail_error } = event.data;

      if (gmail_error) {
        toast.error(gmail_error);
        return;
      }

      if (gmail_connected && gmail_access_token && gmail_refresh_token) {
        setEmailConfig({
          provider: "gmail",
          fromEmail: gmail_email || "",
          gmailAccessToken: gmail_access_token,
          gmailRefreshToken: gmail_refresh_token,
        });
        toast.success(`Gmail connected${gmail_email ? ` as ${gmail_email}` : ""}`);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [setEmailConfig]);

  // Build cert-recipient pairs
  const certRecipients: GuestCertRecipient[] = useMemo(() => {
    return generatedCerts.map((cert, i) => {
      const recipient = recipients[i];
      return {
        id: `guest-${i}`,
        firstName: recipient?.firstName ?? "",
        lastName: recipient?.lastName ?? "",
        email: recipient?.email ?? null,
        blob: cert.blob,
      };
    });
  }, [generatedCerts, recipients]);

  const handleSend = useCallback(async (subject: string, body: string, recipientIds: string[]) => {
    if (!emailConfig) {
      toast.error("Configure an email provider first");
      return;
    }

    setSending(true);
    setSendResult(null);

    try {
      // Build recipients payload with base64 certificate blobs
      const selectedRecipients = certRecipients.filter((r) => recipientIds.includes(r.id));

      const recipientsPayload = await Promise.all(
        selectedRecipients.map(async (r) => ({
          firstName: r.firstName,
          lastName: r.lastName,
          email: r.email!,
          certificateBlob: await blobToBase64(r.blob),
          certificateMimeType: r.blob.type,
        }))
      );

      const requestBody: Record<string, unknown> = {
        provider: emailConfig.provider,
        subject,
        body,
        fromEmail: emailConfig.fromEmail,
        eventName: templateName || "Certificate",
        recipients: recipientsPayload,
      };

      if (emailConfig.provider === "gmail") {
        requestBody.gmailAccessToken = emailConfig.gmailAccessToken;
        requestBody.gmailRefreshToken = emailConfig.gmailRefreshToken;
      } else if (emailConfig.provider === "resend") {
        requestBody.resendApiKey = emailConfig.resendApiKey;
      } else if (emailConfig.provider === "smtp") {
        requestBody.smtpConfig = {
          host: emailConfig.smtpHost,
          port: emailConfig.smtpPort,
          secure: emailConfig.smtpSecure,
          username: emailConfig.smtpUsername,
          password: emailConfig.smtpPassword,
          fromEmail: emailConfig.fromEmail,
        };
      }

      const res = await fetch("/api/email/guest-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to send emails");
        return;
      }

      setSendResult({ sent: data.sent, failed: data.failed });

      if (data.failed === 0) {
        toast.success(`${data.sent} email${data.sent !== 1 ? "s" : ""} sent successfully`);
      } else {
        toast.warning(`${data.sent} sent, ${data.failed} failed`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send emails");
    } finally {
      setSending(false);
    }
  }, [emailConfig, certRecipients, templateName]);

  if (generatedCerts.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="mt-12">
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <AlertCircle className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Generate certificates first</p>
            <Button variant="outline" onClick={() => router.push("/guest/generate")}>
              Go to Generate
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Distribute Certificates</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Send certificates via email. Connect your own email account — credentials stay in your browser.
        </p>
      </div>

      {sendResult && (
        <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium">
            {sendResult.sent} sent{sendResult.failed > 0 ? `, ${sendResult.failed} failed` : ""}
          </span>
        </div>
      )}

      <GuestEmailSetup emailConfig={emailConfig} onConfigChange={setEmailConfig} />

      {emailConfig && (
        <GuestEmailComposer
          eventName={templateName || "Certificate"}
          certRecipients={certRecipients}
          fromEmail={emailConfig.fromEmail}
          onSend={handleSend}
          sending={sending}
        />
      )}

      <SaveWorkCard />
    </div>
  );
}
