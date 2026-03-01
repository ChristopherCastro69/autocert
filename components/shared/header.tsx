"use client";

import { useOrg } from "@/components/context/OrgContext";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut } from "lucide-react";
import { Breadcrumbs } from "./breadcrumbs";

export function Header() {
  const { user } = useOrg();

  return (
    <header className="h-14 border-b flex items-center justify-between px-6">
      <Breadcrumbs />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <User className="h-4 w-4" />
            <span className="text-sm">{user?.full_name ?? user?.email ?? "User"}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem disabled className="text-xs text-muted-foreground">
            {user?.email}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <form action={signOutAction}>
              <button type="submit" className="flex items-center gap-2 w-full">
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
