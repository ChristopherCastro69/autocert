import { SupabaseClient } from "@supabase/supabase-js";
import { Event, CreateEventInput, UpdateEventInput } from "@/types";

export async function getByOrgId(
  supabase: SupabaseClient,
  orgId: string
): Promise<Event[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getById(
  supabase: SupabaseClient,
  id: string
): Promise<Event | null> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code === "PGRST116") return null;
  if (error) throw error;
  return data;
}

export async function create(
  supabase: SupabaseClient,
  input: CreateEventInput
): Promise<Event> {
  const { data, error } = await supabase
    .from("events")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function update(
  supabase: SupabaseClient,
  id: string,
  input: UpdateEventInput
): Promise<Event> {
  const { data, error } = await supabase
    .from("events")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteEvent(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase.from("events").delete().eq("id", id);

  if (error) throw error;
}
