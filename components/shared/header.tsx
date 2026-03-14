"use client";

import { Breadcrumbs } from "./breadcrumbs";

export function Header() {
  return (
    <header className="h-10 border-b bg-card flex items-center px-5">
      <Breadcrumbs />
    </header>
  );
}
