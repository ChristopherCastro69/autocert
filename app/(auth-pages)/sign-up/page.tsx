import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { signup } from "../../../lib/auth-actions";
import SignInWithGoogleButton from "../sign-in/SignInWithGoogleButton";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center sm:max-w-md justify-center gap-2 p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }

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
          {/* Body */}
          <ellipse cx="60" cy="65" rx="30" ry="28" fill="#D4A855" />
          <ellipse cx="60" cy="70" rx="20" ry="18" fill="#E8C96A" />
          {/* Head */}
          <circle cx="60" cy="38" r="25" fill="#D4A855" />
          {/* Ear tufts */}
          <path d="M42 20 L46 8 L52 22" fill="#C49440" />
          <path d="M68 22 L74 8 L78 20" fill="#C49440" />
          {/* Face disc */}
          <ellipse cx="60" cy="40" rx="18" ry="15" fill="#E8C96A" />
          {/* Eyes */}
          <circle cx="52" cy="37" r="7" fill="white" stroke="#3D2817" strokeWidth="1.5" />
          <circle cx="68" cy="37" r="7" fill="white" stroke="#3D2817" strokeWidth="1.5" />
          <circle cx="53" cy="36.5" r="3.5" fill="#3D2817" />
          <circle cx="69" cy="36.5" r="3.5" fill="#3D2817" />
          <circle cx="54" cy="35.5" r="1.2" fill="white" />
          <circle cx="70" cy="35.5" r="1.2" fill="white" />
          {/* Beak */}
          <path d="M57 45 L60 50 L63 45" fill="#C49440" stroke="#3D2817" strokeWidth="1" strokeLinejoin="round" />
          {/* Feet */}
          <ellipse cx="50" cy="92" rx="8" ry="3.5" fill="#C49440" />
          <ellipse cx="70" cy="92" rx="8" ry="3.5" fill="#C49440" />
          {/* Waving wing */}
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
          <h1 className="text-2xl font-extrabold">Create your account</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Already have an account?{" "}
            <Link className="text-foreground font-medium underline" href="/sign-in">
              Sign in
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
            <Input name="email" id="email" placeholder="you@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              name="password"
              id="password"
              placeholder="Min. 6 characters"
              minLength={6}
              required
            />
          </div>
          <SubmitButton formAction={signup} pendingText="Signing up...">
            Sign up
          </SubmitButton>
          <FormMessage message={searchParams} />
        </form>
      </div>
    </div>
  );
}
