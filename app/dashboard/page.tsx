"use client";

import { useOrg } from "@/components/context/OrgContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Building2, Plus, ArrowRight, Calendar } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user, organizations, loading, refreshOrgs } = useOrg();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showCreateForm, setShowCreateForm] = useState(
    searchParams.get("new") === "true"
  );
  const [eventCounts, setEventCounts] = useState<Record<string, number>>({});

  // Only auto-redirect if user has exactly 1 org
  useEffect(() => {
    if (!loading && organizations.length === 1) {
      router.replace(`/dashboard/${organizations[0].slug}`);
    }
  }, [loading, organizations, router]);

  // Fetch event counts for each org
  useEffect(() => {
    if (organizations.length <= 1) return;
    const fetchCounts = async () => {
      const supabase = createClient();
      const counts: Record<string, number> = {};
      for (const org of organizations) {
        const { count } = await supabase
          .from("events")
          .select("id", { count: "exact", head: true })
          .eq("org_id", org.id);
        counts[org.id] = count ?? 0;
      }
      setEventCounts(counts);
    };
    fetchCounts();
  }, [organizations]);

  if (loading || organizations.length === 1) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (organizations.length === 0 || showCreateForm) {
    return (
      <CreateOrgForm
        onCreated={refreshOrgs}
        showBack={organizations.length > 0}
        onBack={() => setShowCreateForm(false)}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Your Organizations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Choose an organization to manage
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCreateForm(true)}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          New Organization
        </Button>
      </div>

      <div className="grid gap-3">
        {organizations.map((org) => (
          <Link
            key={org.id}
            href={`/dashboard/${org.slug}`}
            className="group"
          >
            <Card className="transition-all hover:shadow-md hover:border-primary/30">
              <CardContent className="flex items-center gap-4 py-5">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold truncate">{org.name}</h2>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-muted-foreground">
                      /{org.slug}
                    </span>
                    {eventCounts[org.id] !== undefined && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {eventCounts[org.id]} event{eventCounts[org.id] !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function CreateOrgForm({
  onCreated,
  showBack,
  onBack,
}: {
  onCreated: () => Promise<void>;
  showBack?: boolean;
  onBack?: () => void;
}) {
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
            <div className="flex gap-2">
              {showBack && (
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={onBack}
                >
                  Back
                </Button>
              )}
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? "Creating..." : "Create organization"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
