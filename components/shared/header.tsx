"use client";

import { usePathname } from "next/navigation";
import { Breadcrumbs } from "./breadcrumbs";

export function Header() {
  const pathname = usePathname();

  // Hide breadcrumb header on event detail pages — the step tabs provide navigation
  const isEventDetail = /\/events\/[^/]+\/(templates|recipients|generate|distribute)/.test(pathname);
  if (isEventDetail) return null;

  return (
    <header className="h-10 border-b bg-card flex items-center px-5">
      <Breadcrumbs />
    </header>
  );
}
