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
      <nav className="w-full flex justify-center border-b h-14">
        <div className="w-full max-w-7xl flex justify-between items-center px-5">
          <Link href="/" className="font-bold text-lg">
            AutoCert
          </Link>
          <div className="flex gap-2 items-center">
            <Button asChild variant="ghost" size="sm">
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/sign-up">Sign up</Link>
            </Button>
          </div>
        </div>
      </nav>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-6 flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <span>AutoCert</span>
        <ThemeSwitcher />
      </footer>
    </>
  );
}
