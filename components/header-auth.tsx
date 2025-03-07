"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/client";
import { signout } from "@/lib/auth-actions"; // Assuming signout is similar to signOutAction

export default function AuthButton() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  // New useEffect to refresh or re-render when user is available
  useEffect(() => {
    if (user) {
      // This will refresh the page
      router.refresh();
    }
  }, [user]);

  if (!hasEnvVars) {
    return (
      <div className="flex gap-4 items-center">
        <Badge variant={"default"} className="font-normal pointer-events-none">
          Please update .env.local file with anon key and url
        </Badge>
        <div className="flex gap-2">
          <Button
            asChild
            size="sm"
            variant={"outline"}
            disabled
            className="opacity-75 cursor-none pointer-events-none"
          >
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button
            asChild
            size="sm"
            variant={"default"}
            disabled
            className="opacity-75 cursor-none pointer-events-none"
          >
            <Link href="/sign-up">Sign up</Link>
          </Button>
        </div>
      </div>
    );
  }

  return user ? (
    <div className="flex items-center gap-4">
      Hey, {user.email}!
      <Button
        onClick={() => {
          signout();
          setUser(null);
        }}
        variant={"outline"}
      >
        Sign out
      </Button>
    </div>
  ) : (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          router.push("/sign-in");
        }}
      >
        Sign in
      </Button>
      <Button
        variant="default"
        size="sm"
        onClick={() => {
          router.push("/sign-up");
        }}
      >
        Sign up
      </Button>
    </div>
  );
}
