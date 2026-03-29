"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { EmailConfig } from "@/types";

interface EmailConfigFormProps {
  orgId: string;
  config: EmailConfig | null;
  onSaved: () => void;
}

export function EmailConfigForm({ orgId, config, onSaved }: EmailConfigFormProps) {
  const [activeTab, setActiveTab] = useState<"gmail" | "resend">(
    config?.provider ?? "gmail"
  );
  const [resendApiKey, setResendApiKey] = useState(config?.resend_api_key ?? "");
  const [resendDomain, setResendDomain] = useState(config?.resend_domain ?? "");
  const [resendFromEmail, setResendFromEmail] = useState(config?.resend_from_email ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const isGmailConnected = config?.provider === "gmail" && !!config.gmail_access_token;
  const isResendConnected = config?.provider === "resend" && !!config.resend_api_key;

  const handleConnectGmail = () => {
    const returnTo = encodeURIComponent(window.location.pathname);
    window.location.href = `/api/auth/gmail/authorize?orgId=${orgId}&returnTo=${returnTo}`;
  };

  const handleSaveResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const supabase = createClient();
    const payload = {
      org_id: orgId,
      provider: "resend" as const,
      resend_api_key: resendApiKey.trim(),
      resend_domain: resendDomain.trim() || null,
      resend_from_email: resendFromEmail.trim(),
      is_active: true,
      updated_at: new Date().toISOString(),
    };

    const { error } = config
      ? await supabase.from("email_configs").update(payload).eq("id", config.id)
      : await supabase.from("email_configs").insert(payload);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Resend configuration saved.");
      onSaved();
    }
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Email Provider</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant={activeTab === "gmail" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("gmail")}
          >
            Gmail
          </Button>
          <Button
            variant={activeTab === "resend" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("resend")}
          >
            Resend
          </Button>
        </div>

        {activeTab === "gmail" && (
          <div className="space-y-3">
            {isGmailConnected ? (
              <div className="flex items-center gap-2">
                <Badge className="bg-green-600 hover:bg-green-700">Connected</Badge>
                <span className="text-sm text-muted-foreground">{config?.gmail_email}</span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Connect your Gmail account to send certificates.
              </p>
            )}
            <Button onClick={handleConnectGmail} variant="outline">
              {isGmailConnected ? "Reconnect Gmail" : "Connect Gmail"}
            </Button>
          </div>
        )}

        {activeTab === "resend" && (
          <form onSubmit={handleSaveResend} className="space-y-3">
            {isResendConnected && (
              <Badge className="bg-green-600 hover:bg-green-700">Connected</Badge>
            )}
            <div className="space-y-2">
              <Label htmlFor="resendApiKey">API Key</Label>
              <Input
                id="resendApiKey"
                type="password"
                value={resendApiKey}
                onChange={(e) => setResendApiKey(e.target.value)}
                placeholder="re_..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resendDomain">Domain (optional)</Label>
              <Input
                id="resendDomain"
                value={resendDomain}
                onChange={(e) => setResendDomain(e.target.value)}
                placeholder="yourdomain.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resendFromEmail">From Email</Label>
              <Input
                id="resendFromEmail"
                type="email"
                value={resendFromEmail}
                onChange={(e) => setResendFromEmail(e.target.value)}
                placeholder="noreply@yourdomain.com"
                required
              />
            </div>
            {message && <p className="text-sm text-muted-foreground">{message}</p>}
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Resend Config"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
