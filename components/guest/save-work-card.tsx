"use client";

import { useGuest } from "@/components/context/guest-context";
import { useGuestUpgrade } from "@/hooks/use-guest-upgrade";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2, Save, LogIn } from "lucide-react";

export function SaveWorkCard() {
  const {
    templateFile,
    templateName,
    textConfig,
    recipients,
    generatedCerts,
  } = useGuest();
  const { openSignIn, upgrade, isAuthenticating, isUpgrading, error, progress } = useGuestUpgrade();

  const handleSave = async () => {
    // Step 1: Sign in via popup
    const authenticated = await openSignIn();
    if (!authenticated) return;

    // Step 2: Migrate guest data to account
    if (!templateFile) return;

    const result = await upgrade({
      templateFile,
      templateName,
      textConfig,
      recipients,
      generatedCerts,
    });

    if (result) {
      // Full page navigation so OrgProvider initializes fresh with the new org
      window.location.href = `/dashboard/${result.orgSlug}/events/${result.eventId}/generate`;
    }
  };

  const isBusy = isAuthenticating || isUpgrading;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save Your Work
        </CardTitle>
        <CardDescription>
          Sign in with Google to save your template, recipients, and generated certificates.
          You&apos;ll get email distribution, team features, and persistent storage.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {isUpgrading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {progress}
          </div>
        )}

        <Button onClick={handleSave} disabled={isBusy} className="gap-2">
          {isBusy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {isAuthenticating ? "Signing in..." : "Saving..."}
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              Sign in with Google to Save
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
