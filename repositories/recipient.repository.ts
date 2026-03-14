import { SupabaseClient } from "@supabase/supabase-js";
import { Recipient, CreateRecipientsInput } from "@/types";

export async function getByEventId(
  supabase: SupabaseClient,
  eventId: string
): Promise<Recipient[]> {
  const { data, error } = await supabase
    .from("recipients")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getById(
  supabase: SupabaseClient,
  id: string
): Promise<Recipient | null> {
  const { data, error } = await supabase
    .from("recipients")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code === "PGRST116") return null;
  if (error) throw error;
  return data;
}

export async function createMany(
  supabase: SupabaseClient,
  eventId: string,
  recipients: CreateRecipientsInput
): Promise<Recipient[]> {
  const rows = recipients.map((r) => ({ ...r, event_id: eventId }));

  const { data, error } = await supabase
    .from("recipients")
    .insert(rows)
    .select();

  if (error) throw error;
  return data ?? [];
}

export async function deleteRecipient(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase.from("recipients").delete().eq("id", id);

  if (error) throw error;
}

export async function deleteByEventId(
  supabase: SupabaseClient,
  eventId: string
): Promise<void> {
  const { error } = await supabase
    .from("recipients")
    .delete()
    .eq("event_id", eventId);

  if (error) throw error;
}
