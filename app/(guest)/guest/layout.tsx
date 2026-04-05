"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { GuestProvider } from "@/components/context/guest-context";
import { GUEST_STEPS } from "@/lib/guest-steps";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

function GuestStepper() {
  const pathname = usePathname();

  const currentIndex = GUEST_STEPS.findIndex((s) => pathname.includes(s.key));

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {GUEST_STEPS.map((step, i) => {
        const Icon = step.icon;
        const isActive = i === currentIndex;
        const isCompleted = i < currentIndex;

        return (
          <div key={step.key} className="flex items-center gap-1 sm:gap-2">
            {i > 0 && (
              <div
                className={cn(
                  "w-6 sm:w-10 h-px",
                  isCompleted ? "bg-primary" : "bg-border"
                )}
              />
            )}
            <Link
              href={step.href}
              className={cn(
                "flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors",
                isActive && "bg-primary text-primary-foreground",
                isCompleted && "text-primary",
                !isActive && !isCompleted && "text-muted-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{step.label}</span>
            </Link>
          </div>
        );
      })}
    </div>
  );
}

export default function GuestLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuestProvider>
      <div className="flex flex-col min-h-screen">
        {/* Nav */}
        <nav className="w-full flex justify-center border-b h-14 sm:h-16">
          <div className="w-full max-w-7xl flex justify-between items-center px-4 sm:px-6">
            <Link href="/" className="font-extrabold text-lg sm:text-xl">
              AutoCert
            </Link>
            <GuestStepper />
            <ThemeSwitcher />
          </div>
        </nav>

        {/* Privacy banner */}
        <div className="bg-secondary/50 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <Shield className="h-3.5 w-3.5 shrink-0" />
            <span>
              Guest Mode — Your data stays in your browser. Nothing is uploaded or stored.
            </span>
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </main>

        {/* Minimal footer */}
        <footer className="border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-muted-foreground">
            <span>
              Want email distribution and team features?{" "}
              <Link href="/sign-up" className="text-primary hover:underline font-medium">
                Sign up for free
              </Link>
            </span>
            <span>&copy; {new Date().getFullYear()} AutoCert</span>
          </div>
        </footer>
      </div>
    </GuestProvider>
  );
}
