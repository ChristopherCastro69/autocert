"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Settings,
  LayoutDashboard,
  ChevronDown,
  LogOut,
  CircleUser,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useOrg } from "@/components/context/OrgContext";
import { signOutAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Sidebar() {
  const { activeOrg, organizations, setActiveOrg, user } = useOrg();
  const pathname = usePathname();

  if (!activeOrg) return null;

  const basePath = `/dashboard/${activeOrg.slug}`;

  const navItems = [
    { href: basePath, label: "Overview", icon: LayoutDashboard },
    { href: `${basePath}/events`, label: "Events", icon: CalendarDays },
    { href: `${basePath}/settings`, label: "Settings", icon: Settings },
  ];

  const displayName = user?.full_name ?? user?.email?.split("@")[0] ?? "User";
  const displayEmail = user?.email ?? "";

  return (
    <aside className="w-60 border-r bg-card flex flex-col h-full">
      <div className="p-4 border-b">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between text-sm font-semibold h-9"
            >
              <span className="truncate">{activeOrg.name}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-40 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            {organizations.map((org) => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => setActiveOrg(org)}
                className={cn(org.id === activeOrg.id && "bg-accent")}
              >
                {org.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            item.href === basePath
              ? pathname === basePath
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User profile */}
      <div className="border-t p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 w-full rounded-lg px-3 py-2 text-left hover:bg-accent transition-colors">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <CircleUser className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium truncate">
                  {displayName}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {displayEmail}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-52">
            <DropdownMenuItem disabled className="text-xs text-muted-foreground">
              {displayEmail}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="flex items-center gap-2 w-full"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
