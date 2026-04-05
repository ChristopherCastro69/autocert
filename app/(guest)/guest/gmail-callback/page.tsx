"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function GmailCallbackContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const data = {
      gmail_connected: searchParams.get("gmail_connected"),
      gmail_access_token: searchParams.get("gmail_access_token"),
      gmail_refresh_token: searchParams.get("gmail_refresh_token"),
      gmail_email: searchParams.get("gmail_email"),
      gmail_error: searchParams.get("gmail_error"),
    };

    // Send tokens to the opener window and close this popup
    if (window.opener) {
      window.opener.postMessage({ type: "gmail-oauth-callback", ...data }, window.location.origin);
      window.close();
    } else {
      // Fallback: if not opened as popup, redirect to distribute page with params
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(data)) {
        if (value) params.set(key, value);
      }
      window.location.href = `/guest/distribute?${params.toString()}`;
    }
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center py-20">
      <p className="text-sm text-muted-foreground">Connecting Gmail... This window will close automatically.</p>
    </div>
  );
}

export default function GmailCallbackPage() {
  return (
    <Suspense>
      <GmailCallbackContent />
    </Suspense>
  );
}
