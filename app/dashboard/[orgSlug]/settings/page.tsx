"use client";

import { useState } from "react";
import { useOrg } from "@/components/context/OrgContext";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function OrgSettingsPage() {
  const { activeOrg, refreshOrgs } = useOrg();
  const [name, setName] = useState(activeOrg?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!activeOrg) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase
      .from("organizations")
      .update({ name: name.trim(), updated_at: new Date().toISOString() })
      .eq("id", activeOrg.id);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Settings saved.");
      await refreshOrgs();
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Organization Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>Update your organization details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orgName">Organization name</Label>
              <Input
                id="orgName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={activeOrg.slug} disabled />
              <p className="text-xs text-muted-foreground">
                Slug cannot be changed after creation.
              </p>
            </div>
            {message && (
              <p className="text-sm text-muted-foreground">{message}</p>
            )}
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Configuration</CardTitle>
          <CardDescription>
            Configure email providers for certificate distribution.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Email provider configuration will be available in the distribute
            section of each event.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
