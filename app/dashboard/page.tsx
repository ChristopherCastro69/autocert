"use client";

import { useOrg } from "@/components/context/OrgContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2 } from "lucide-react";

export default function DashboardPage() {
  const { user, organizations, loading, refreshOrgs } = useOrg();
  const router = useRouter();

  // Redirect to first org if user already has one
  useEffect(() => {
    if (!loading && organizations.length > 0) {
      router.replace(`/dashboard/${organizations[0].slug}`);
    }
  }, [loading, organizations, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (organizations.length > 0) {
    return null; // Redirecting...
  }

  return <CreateOrgForm onCreated={refreshOrgs} />;
}

function CreateOrgForm({ onCreated }: { onCreated: () => Promise<void> }) {
  const { user } = useOrg();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (value: string) => {
    setName(value);
    setSlug(
      value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim() || !slug.trim()) return;

    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const orgId = crypto.randomUUID();

    const { error: orgError } = await supabase
      .from("organizations")
      .insert({ id: orgId, name: name.trim(), slug: slug.trim() });

    if (orgError) {
      setError(orgError.message);
      setSubmitting(false);
      return;
    }

    const { error: memberError } = await supabase
      .from("org_members")
      .insert({ org_id: orgId, profile_id: user.id, role: "owner" });

    if (memberError) {
      setError(memberError.message);
      setSubmitting(false);
      return;
    }

    await onCreated();
    setSubmitting(false);
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto rounded-full bg-muted p-3 mb-2">
            <Building2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle>Create your organization</CardTitle>
          <CardDescription>
            Set up your organization to start managing events and certificates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Organization name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="GDG Cebu"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">URL slug</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="gdg-cebu"
                required
              />
              <p className="text-xs text-muted-foreground">
                /dashboard/{slug || "your-org"}
              </p>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Creating..." : "Create organization"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
