import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { login } from "../../../lib/auth-actions";
import SignInWithGoogleButton from "./SignInWithGoogleButton";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  return (
    <div className="w-full max-w-sm mx-auto space-y-6">
      {/* Owl mascot */}
      <div className="flex justify-center">
        <svg
          viewBox="0 0 120 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-24 h-20"
          aria-label="AutoCert owl mascot"
        >
          <ellipse cx="60" cy="65" rx="30" ry="28" fill="#D4A855" />
          <ellipse cx="60" cy="70" rx="20" ry="18" fill="#E8C96A" />
          <circle cx="60" cy="38" r="25" fill="#D4A855" />
          <path d="M42 20 L46 8 L52 22" fill="#C49440" />
          <path d="M68 22 L74 8 L78 20" fill="#C49440" />
          <ellipse cx="60" cy="40" rx="18" ry="15" fill="#E8C96A" />
          <circle cx="52" cy="37" r="7" fill="white" stroke="#3D2817" strokeWidth="1.5" />
          <circle cx="68" cy="37" r="7" fill="white" stroke="#3D2817" strokeWidth="1.5" />
          <circle cx="53" cy="36.5" r="3.5" fill="#3D2817" />
          <circle cx="69" cy="36.5" r="3.5" fill="#3D2817" />
          <circle cx="54" cy="35.5" r="1.2" fill="white" />
          <circle cx="70" cy="35.5" r="1.2" fill="white" />
          <path d="M57 45 L60 50 L63 45" fill="#C49440" stroke="#3D2817" strokeWidth="1" strokeLinejoin="round" />
          <ellipse cx="50" cy="92" rx="8" ry="3.5" fill="#C49440" />
          <ellipse cx="70" cy="92" rx="8" ry="3.5" fill="#C49440" />
          <g>
            <path d="M90 58 Q102 42 106 30" stroke="#D4A855" strokeWidth="12" strokeLinecap="round" fill="none" />
            <circle cx="106" cy="30" r="5.5" fill="#C49440" />
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 90 58;-6 90 58;0 90 58;4 90 58;0 90 58"
              dur="2s"
              repeatCount="indefinite"
            />
          </g>
        </svg>
      </div>

      {/* Card */}
      <div className="rounded-2xl border-2 bg-card p-6 sm:p-8 shadow-[4px_4px_0px] shadow-secondary/30">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Don&apos;t have an account?{" "}
            <Link className="text-foreground font-medium underline" href="/sign-up">
              Sign up
            </Link>
          </p>
        </div>

        {/* Google */}
        <SignInWithGoogleButton />

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Email form */}
        <form className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              name="email"
              id="email"
              type="email"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              <Link
                className="text-xs text-muted-foreground hover:text-foreground underline"
                href="/forgot-password"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              name="password"
              id="password"
              placeholder="Your password"
              required
            />
          </div>
          <SubmitButton pendingText="Signing in..." formAction={login}>
            Sign in
          </SubmitButton>
          <FormMessage message={searchParams} />
        </form>
      </div>
    </div>
  );
}
