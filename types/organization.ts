export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export type OrgRole = "owner" | "admin" | "member";

export interface OrgMember {
  id: string;
  org_id: string;
  profile_id: string;
  role: OrgRole;
  created_at: string;
}

export interface OrgMemberWithProfile extends OrgMember {
  profiles: {
    id: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
}

export interface CreateOrganizationInput {
  name: string;
  slug: string;
  logo_url?: string;
}
