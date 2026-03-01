"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Fragment } from "react";

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // Build breadcrumb items from path segments
  const items = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label = decodeURIComponent(segment)
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return { href, label };
  });

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground">
      {items.map((item, index) => (
        <Fragment key={item.href}>
          {index > 0 && <ChevronRight className="h-3 w-3" />}
          {index === items.length - 1 ? (
            <span className="font-medium text-foreground">{item.label}</span>
          ) : (
            <Link href={item.href} className="hover:text-foreground transition-colors">
              {item.label}
            </Link>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
