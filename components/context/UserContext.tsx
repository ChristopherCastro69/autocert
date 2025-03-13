"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { createClient } from "@/utils/supabase/client";
import { UserProfile } from "../../dto/UserProfilesDTO"; // Adjust the import path as necessary

interface UserContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (!error) {
          const userProfile: UserProfile = {
            id: profile.id,
            profile: profile,
            full_name: profile.full_name,
            email: user.email,
            avatar_url: profile.avatar_url,
          };
          console.log("Fetched User Profile:", userProfile);

          setUser(userProfile);
        }
      } else {
        setUser(null);
      }
    };
    fetchUser();
  }, [supabase]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
