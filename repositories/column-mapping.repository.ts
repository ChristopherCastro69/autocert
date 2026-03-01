import { SupabaseClient } from "@supabase/supabase-js";
import { ColumnMapping, MappingResult } from "@/types";

export async function getByEventId(
  supabase: SupabaseClient,
  eventId: string
): Promise<ColumnMapping | null> {
  const { data, error } = await supabase
    .from("column_mappings")
    .select("*")
    .eq("event_id", eventId)
    .single();

  if (error && error.code === "PGRST116") return null;
  if (error) throw error;
  return data;
}

export async function create(
  supabase: SupabaseClient,
  eventId: string,
  originalHeaders: string[],
  mapping: MappingResult
): Promise<ColumnMapping> {
  const { data, error } = await supabase
    .from("column_mappings")
    .insert({
      event_id: eventId,
      original_headers: originalHeaders,
      mapping,
      confirmed: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function confirm(
  supabase: SupabaseClient,
  id: string
): Promise<ColumnMapping> {
  const { data, error } = await supabase
    .from("column_mappings")
    .update({ confirmed: true })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
