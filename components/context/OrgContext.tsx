"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Organization } from "@/types";

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
}

interface OrgContextType {
  user: UserProfile | null;
  organizations: Organization[];
  activeOrg: Organization | null;
  setActiveOrg: (org: Organization | null) => void;
  loading: boolean;
  refreshOrgs: () => Promise<void>;
}

const OrgContext = createContext<OrgContextType | undefined>(undefined);

export function OrgProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeOrg, setActiveOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const fetchOrgs = async (userId: string) => {
    const { data, error } = await supabase
      .from("org_members")
      .select("org_id, organizations(*)")
      .eq("profile_id", userId);

    if (!error && data) {
      const orgs = data
        .map((m) => m.organizations as unknown as Organization)
        .filter(Boolean);
      setOrganizations(orgs);
      if (orgs.length > 0 && !activeOrg) {
        setActiveOrg(orgs[0]);
      }
    }
  };

  const refreshOrgs = async () => {
    if (user) {
      await fetchOrgs(user.id);
    }
  };

  useEffect(() => {
    const init = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        const userProfile: UserProfile = {
          id: authUser.id,
          full_name: authUser.user_metadata?.full_name ?? null,
          email: authUser.email ?? null,
          avatar_url: authUser.user_metadata?.avatar_url ?? null,
        };
        setUser(userProfile);
        await fetchOrgs(userProfile.id);
      }
      setLoading(false);
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <OrgContext.Provider
      value={{ user, organizations, activeOrg, setActiveOrg, loading, refreshOrgs }}
    >
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  const context = useContext(OrgContext);
  if (!context) {
    throw new Error("useOrg must be used within an OrgProvider");
  }
  return context;
}
