import { SupabaseClient } from "@supabase/supabase-js";
import {
  Organization,
  CreateOrganizationInput,
  OrgMember,
  OrgRole,
} from "@/types";

export async function getBySlug(
  supabase: SupabaseClient,
  slug: string
): Promise<Organization | null> {
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error && error.code === "PGRST116") return null;
  if (error) throw error;
  return data;
}

export async function getByUserId(
  supabase: SupabaseClient,
  userId: string
): Promise<Organization[]> {
  const { data, error } = await supabase
    .from("org_members")
    .select("organizations(*)")
    .eq("profile_id", userId);

  if (error) throw error;
  return (data ?? []).map((row: any) => row.organizations);
}

export async function getById(
  supabase: SupabaseClient,
  id: string
): Promise<Organization | null> {
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code === "PGRST116") return null;
  if (error) throw error;
  return data;
}

export async function create(
  supabase: SupabaseClient,
  input: CreateOrganizationInput
): Promise<Organization> {
  const { data, error } = await supabase
    .from("organizations")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function update(
  supabase: SupabaseClient,
  id: string,
  input: Partial<CreateOrganizationInput>
): Promise<Organization> {
  const { data, error } = await supabase
    .from("organizations")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function addMember(
  supabase: SupabaseClient,
  orgId: string,
  profileId: string,
  role: OrgRole
): Promise<OrgMember> {
  const { data, error } = await supabase
    .from("org_members")
    .insert({ org_id: orgId, profile_id: profileId, role })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMembers(
  supabase: SupabaseClient,
  orgId: string
): Promise<OrgMember[]> {
  const { data, error } = await supabase
    .from("org_members")
    .select("*")
    .eq("org_id", orgId);

  if (error) throw error;
  return data ?? [];
}
