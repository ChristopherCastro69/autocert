"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function GuestAuthCallbackPage() {
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    if (window.opener) {
      // Signal the opener (guest page) that auth is complete
      window.opener.postMessage(
        { type: "guest-auth-callback", success: true },
        window.location.origin
      );
      // Small delay before closing to ensure message is received
      setTimeout(() => window.close(), 300);
    } else {
      // Not a popup — show fallback UI
      setFallback(true);
    }
  }, []);

  if (fallback) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-sm text-muted-foreground">
          Sign-in successful! Return to your guest session to continue.
        </p>
        <div className="flex gap-3">
          <Link href="/guest/generate" className="text-sm text-primary hover:underline">
            Back to Generate
          </Link>
          <Link href="/dashboard" className="text-sm text-primary hover:underline">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-20">
      <p className="text-sm text-muted-foreground">
        Signing you in... This window will close automatically.
      </p>
    </div>
  );
}
