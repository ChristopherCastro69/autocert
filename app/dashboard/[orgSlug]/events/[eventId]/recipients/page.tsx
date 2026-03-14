"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { RecipientTable } from "@/components/recipients/recipient-table";
import { UploadDialog } from "@/components/recipients/upload-dialog";
import { Upload, UserPlus } from "lucide-react";
import type { Recipient } from "@/types";

export default function RecipientsPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  // Manual add form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchRecipients = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("recipients")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });

    setRecipients((data as Recipient[]) ?? []);
    setLoading(false);
  }, [eventId]);

  useEffect(() => {
    fetchRecipients();
  }, [fetchRecipients]);

  const handleDelete = async (ids: string[]) => {
    setDeleting(true);
    const supabase = createClient();
    await supabase.from("recipients").delete().in("id", ids);
    await fetchRecipients();
    setDeleting(false);
  };

  const handleAddManually = async () => {
    if (!firstName.trim() || !lastName.trim()) return;
    setAdding(true);

    const supabase = createClient();
    await supabase.from("recipients").insert({
      event_id: eventId,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim() || null,
    });

    setFirstName("");
    setLastName("");
    setEmail("");
    setAddOpen(false);
    setAdding(false);
    fetchRecipients();
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading recipients...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">
          Recipients{" "}
          {recipients.length > 0 && (
            <span className="text-base font-normal text-muted-foreground">
              ({recipients.length})
            </span>
          )}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setAddOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Manually
          </Button>
          <Button onClick={() => setUploadOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Recipients
          </Button>
        </div>
      </div>

      {recipients.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No recipients yet. Upload a CSV/XLSX or add manually.
          </p>
        </div>
      ) : (
        <RecipientTable
          recipients={recipients}
          onDelete={handleDelete}
          deleting={deleting}
        />
      )}

      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        eventId={eventId}
        onUploaded={fetchRecipients}
      />

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Recipient</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-first-name">First Name</Label>
              <Input
                id="add-first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-last-name">Last Name</Label>
              <Input
                id="add-last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-email">Email (optional)</Label>
              <Input
                id="add-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)} disabled={adding}>
              Cancel
            </Button>
            <Button
              onClick={handleAddManually}
              disabled={adding || !firstName.trim() || !lastName.trim()}
            >
              {adding ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
