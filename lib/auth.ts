import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface AuthResult {
  userId: string;
  orgId: string;
}

interface AuthError {
  error: string;
  status: number;
}

/**
 * Verify the current user is authenticated and is a member of the specified org.
 * Uses the user's session for auth, and admin client for org membership check
 * (since org_members may not be directly queryable by anon key depending on RLS).
 */
export async function verifyOrgMembership(
  orgId: string | null | undefined
): Promise<AuthResult | AuthError> {
  if (!orgId) {
    return { error: "orgId is required", status: 400 };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized", status: 401 };
  }

  const adminDb = createAdminClient();
  const { data: membership } = await adminDb
    .from("org_members")
    .select("id")
    .eq("org_id", orgId)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!membership) {
    return { error: "Forbidden — not a member of this organization", status: 403 };
  }

  return { userId: user.id, orgId };
}

/**
 * Verify the current user is authenticated (no org check).
 */
export async function verifyAuth(): Promise<
  { userId: string } | AuthError
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized", status: 401 };
  }

  return { userId: user.id };
}

export function isAuthError(
  result: AuthResult | AuthError | { userId: string }
): result is AuthError {
  return "error" in result;
}
