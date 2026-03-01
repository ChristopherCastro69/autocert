import { SupabaseClient } from "@supabase/supabase-js";
import {
  Template,
  CreateTemplateInput,
  UpdateTemplateInput,
  TemplateTextConfig,
} from "@/types";

export async function getByEventId(
  supabase: SupabaseClient,
  eventId: string
): Promise<Template[]> {
  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getById(
  supabase: SupabaseClient,
  id: string
): Promise<Template | null> {
  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code === "PGRST116") return null;
  if (error) throw error;
  return data;
}

export async function create(
  supabase: SupabaseClient,
  input: CreateTemplateInput
): Promise<Template> {
  const { data, error } = await supabase
    .from("templates")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function update(
  supabase: SupabaseClient,
  id: string,
  input: UpdateTemplateInput
): Promise<Template> {
  const { data, error } = await supabase
    .from("templates")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTextConfig(
  supabase: SupabaseClient,
  id: string,
  textConfig: TemplateTextConfig
): Promise<Template> {
  const { data, error } = await supabase
    .from("templates")
    .update({ text_config: textConfig })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTemplate(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase.from("templates").delete().eq("id", id);

  if (error) throw error;
}
