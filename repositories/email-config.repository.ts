import { SupabaseClient } from "@supabase/supabase-js";
import { EmailConfig } from "@/types";

export async function getByOrgId(
  supabase: SupabaseClient,
  orgId: string
): Promise<EmailConfig[]> {
  const { data, error } = await supabase
    .from("email_configs")
    .select("*")
    .eq("org_id", orgId);

  if (error) throw error;
  return data ?? [];
}

export async function getActiveByOrgId(
  supabase: SupabaseClient,
  orgId: string
): Promise<EmailConfig | null> {
  const { data, error } = await supabase
    .from("email_configs")
    .select("*")
    .eq("org_id", orgId)
    .eq("is_active", true)
    .single();

  if (error && error.code === "PGRST116") return null;
  if (error) throw error;
  return data;
}

export async function upsert(
  supabase: SupabaseClient,
  config: Partial<EmailConfig> & { org_id: string; provider: string }
): Promise<EmailConfig> {
  const { data, error } = await supabase
    .from("email_configs")
    .upsert(config, { onConflict: "org_id,provider" })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteConfig(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("email_configs")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
