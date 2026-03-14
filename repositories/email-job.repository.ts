import { SupabaseClient } from "@supabase/supabase-js";
import { EmailJob, EmailJobStatus } from "@/types";

export async function getPending(
  supabase: SupabaseClient,
  limit: number
): Promise<EmailJob[]> {
  const { data, error } = await supabase
    .from("email_jobs")
    .select("*")
    .eq("status", "pending")
    .lte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function getByOrgId(
  supabase: SupabaseClient,
  orgId: string
): Promise<EmailJob[]> {
  const { data, error } = await supabase
    .from("email_jobs")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createMany(
  supabase: SupabaseClient,
  jobs: Omit<EmailJob, "id" | "created_at" | "processed_at">[]
): Promise<EmailJob[]> {
  const { data, error } = await supabase
    .from("email_jobs")
    .insert(jobs)
    .select();

  if (error) throw error;
  return data ?? [];
}

export async function updateStatus(
  supabase: SupabaseClient,
  id: string,
  status: EmailJobStatus,
  lastError?: string
): Promise<EmailJob> {
  const updateData: Record<string, unknown> = { status };
  if (lastError !== undefined) {
    updateData.last_error = lastError;
  }
  if (status === "processing" || status === "sent") {
    updateData.processed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("email_jobs")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function incrementAttempts(
  supabase: SupabaseClient,
  id: string
): Promise<EmailJob> {
  const { data: current, error: fetchError } = await supabase
    .from("email_jobs")
    .select("attempts")
    .eq("id", id)
    .single();

  if (fetchError) throw fetchError;

  const { data, error } = await supabase
    .from("email_jobs")
    .update({ attempts: (current.attempts ?? 0) + 1 })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
