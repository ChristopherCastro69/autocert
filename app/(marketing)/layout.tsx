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
      <nav className="w-full flex justify-center border-b h-16">
        <div className="w-full max-w-7xl flex justify-between items-center px-6">
          <Link href="/" className="flex items-center gap-2">
            <Award className="h-6 w-6" />
            <span className="font-extrabold text-xl">AutoCert</span>
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
      <footer className="border-t">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                <span className="font-extrabold text-lg">AutoCert</span>
              </div>
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

            <div className="space-y-3">
              <h4 className="font-bold text-sm">Get Started</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/sign-up" className="hover:text-foreground transition-colors">Create Account</Link></li>
                <li><Link href="/sign-in" className="hover:text-foreground transition-colors">Sign In</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t flex justify-between items-center text-xs text-muted-foreground">
            <span>&copy; {new Date().getFullYear()} AutoCert</span>
            <span>Built with Next.js &amp; Supabase</span>
          </div>
        </div>
      </footer>
    </>
  );
}
