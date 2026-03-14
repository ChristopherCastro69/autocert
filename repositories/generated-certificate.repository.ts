import { SupabaseClient } from "@supabase/supabase-js";
import {
  GeneratedCertificate,
  CreateGeneratedCertificateInput,
  CertificateStatus,
} from "@/types";

export async function getByTemplateId(
  supabase: SupabaseClient,
  templateId: string
): Promise<GeneratedCertificate[]> {
  const { data, error } = await supabase
    .from("generated_certificates")
    .select("*")
    .eq("template_id", templateId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getByRecipientId(
  supabase: SupabaseClient,
  recipientId: string
): Promise<GeneratedCertificate[]> {
  const { data, error } = await supabase
    .from("generated_certificates")
    .select("*")
    .eq("recipient_id", recipientId);

  if (error) throw error;
  return data ?? [];
}

export async function create(
  supabase: SupabaseClient,
  input: CreateGeneratedCertificateInput
): Promise<GeneratedCertificate> {
  const { data, error } = await supabase
    .from("generated_certificates")
    .upsert(input, { onConflict: "recipient_id,template_id" })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createMany(
  supabase: SupabaseClient,
  inputs: CreateGeneratedCertificateInput[]
): Promise<GeneratedCertificate[]> {
  const { data, error } = await supabase
    .from("generated_certificates")
    .upsert(inputs, { onConflict: "recipient_id,template_id" })
    .select();

  if (error) throw error;
  return data ?? [];
}

export async function updateStatus(
  supabase: SupabaseClient,
  id: string,
  status: CertificateStatus,
  errorMessage?: string
): Promise<GeneratedCertificate> {
  const updateData: Record<string, unknown> = { status };
  if (errorMessage !== undefined) {
    updateData.error_message = errorMessage;
  }
  if (status === "sent") {
    updateData.sent_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("generated_certificates")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
