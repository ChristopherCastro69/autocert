"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import Link from "next/link";
import { Button } from "./ui/button";
import { signout } from "@/lib/auth-actions"; 
import { useUser } from "@/components/context/UserContext"; 

export default function AuthButton() {
  const { user, setUser } = useUser(); // Access user data from context
  const router = useRouter();

  if (!hasEnvVars) {
    return (
      <div className="flex gap-4 items-center">
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
      Hey, {user.profile?.full_name}!
      <Button
        onClick={() => {
          signout();
          setUser(null); // Optionally clear user state on signout
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
