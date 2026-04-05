import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <nav className="w-full flex justify-center border-b h-14 sm:h-16">
        <div className="w-full max-w-7xl flex justify-between items-center px-4 sm:px-6">
          <Link href="/" className="font-extrabold text-lg sm:text-xl">
            AutoCert
          </Link>
          <div className="flex gap-2 sm:gap-3 items-center">
            <ThemeSwitcher />
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/sign-up">
                <span className="sm:hidden">Start</span>
                <span className="hidden sm:inline">Get started</span>
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
          <div className="grid gap-8 grid-cols-2 md:grid-cols-4">
            <div className="col-span-2 md:col-span-1 space-y-3">
              <span className="font-extrabold text-lg">AutoCert</span>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Generate and distribute personalized certificates at scale.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/sign-up" className="hover:text-foreground transition-colors">Certificate Generator</Link></li>
                <li><Link href="/sign-up" className="hover:text-foreground transition-colors">Email Distribution</Link></li>
                <li><Link href="/sign-up" className="hover:text-foreground transition-colors">Batch Processing</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-sm">Features</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/sign-up" className="hover:text-foreground transition-colors">AI Column Mapping</Link></li>
                <li><Link href="/sign-up" className="hover:text-foreground transition-colors">Auto Text Sizing</Link></li>
                <li><Link href="/sign-up" className="hover:text-foreground transition-colors">Multi-org Support</Link></li>
              </ul>
            </div>

            <div className="space-y-3 hidden md:block">
              <h4 className="font-bold text-sm">Get Started</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/sign-up" className="hover:text-foreground transition-colors">Create Account</Link></li>
                <li><Link href="/sign-in" className="hover:text-foreground transition-colors">Sign In</Link></li>
                <li><Link href="/guest/template" className="hover:text-foreground transition-colors">Guest Mode</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 sm:mt-10 pt-6 border-t flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-muted-foreground">
            <span>&copy; {new Date().getFullYear()} AutoCert</span>
            <span>Built with Next.js &amp; Supabase</span>
          </div>
        </div>
      </footer>
    </>
  );
}
