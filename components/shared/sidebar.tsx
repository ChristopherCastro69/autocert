"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Settings, LayoutDashboard, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOrg } from "@/components/context/OrgContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Sidebar() {
  const { activeOrg, organizations, setActiveOrg } = useOrg();
  const pathname = usePathname();

  if (!activeOrg) return null;

  const basePath = `/dashboard/${activeOrg.slug}`;

  const navItems = [
    { href: basePath, label: "Overview", icon: LayoutDashboard },
    { href: `${basePath}/events`, label: "Events", icon: CalendarDays },
    { href: `${basePath}/settings`, label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-64 border-r bg-muted/40 flex flex-col h-full">
      <div className="p-4 border-b">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-between font-semibold">
              {activeOrg.name}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
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

      <nav className="flex-1 p-3 space-y-1">
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
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
