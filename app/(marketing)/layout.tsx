import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Award } from "lucide-react";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Sticky Nav */}
      <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/80 border-b">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center shadow-[0px_4px_0px] shadow-secondary group-hover:shadow-[0px_2px_0px] group-hover:translate-y-0.5 transition-all">
              <Award className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight">AutoCert</span>
          </Link>

          <div className="flex gap-3 items-center">
            <ThemeSwitcher />
            <Button asChild variant="ghost" size="sm">
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/sign-up">Get started</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t bg-card/50">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid gap-12 md:grid-cols-4">
            {/* Brand */}
            <div className="md:col-span-1 space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <Award className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg">AutoCert</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Generate and distribute personalized certificates at scale.
                Built for event organizers who value their time.
              </p>
            </div>

            {/* Product */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                Product
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/sign-up" className="hover:text-secondary transition-colors">
                    Certificate Generator
                  </Link>
                </li>
                <li>
                  <Link href="/sign-up" className="hover:text-secondary transition-colors">
                    Email Distribution
                  </Link>
                </li>
                <li>
                  <Link href="/sign-up" className="hover:text-secondary transition-colors">
                    CSV/XLSX Import
                  </Link>
                </li>
                <li>
                  <Link href="/sign-up" className="hover:text-secondary transition-colors">
                    Batch Processing
                  </Link>
                </li>
              </ul>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                Features
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/sign-up" className="hover:text-secondary transition-colors">
                    AI Column Mapping
                  </Link>
                </li>
                <li>
                  <Link href="/sign-up" className="hover:text-secondary transition-colors">
                    Auto Text Sizing
                  </Link>
                </li>
                <li>
                  <Link href="/sign-up" className="hover:text-secondary transition-colors">
                    Multi-org Support
                  </Link>
                </li>
                <li>
                  <Link href="/sign-up" className="hover:text-secondary transition-colors">
                    Gmail & Resend
                  </Link>
                </li>
              </ul>
            </div>

            {/* Get Started */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                Get Started
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/sign-up" className="hover:text-secondary transition-colors">
                    Create Account
                  </Link>
                </li>
                <li>
                  <Link href="/sign-in" className="hover:text-secondary transition-colors">
                    Sign In
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} AutoCert. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <span>Built with Next.js & Supabase</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
