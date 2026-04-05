"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { uploadFile, getPublicUrl } from "@/services/storage.service";
import { DEFAULT_TEXT_CONFIG } from "@/lib/constants";
import type { TemplateTextConfig } from "@/types";
import type { GuestRecipient } from "@/types/guest";
import type { GuestBatchResult } from "@/hooks/use-guest-batch-generation";

interface UpgradeInput {
  templateFile: File;
  templateName: string;
  textConfig: TemplateTextConfig;
  recipients: GuestRecipient[];
  generatedCerts: GuestBatchResult[];
}

interface UpgradeResult {
  orgSlug: string;
  eventId: string;
}

export function useGuestUpgrade() {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState("");

  const resolveRef = useRef<((value: boolean) => void) | null>(null);
  const closeCheckerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Listen for auth callback from popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "guest-auth-callback") return;

      // Clear the close-checker so it doesn't fire after we resolve
      if (closeCheckerRef.current) {
        clearInterval(closeCheckerRef.current);
        closeCheckerRef.current = null;
      }

      setIsAuthenticating(false);

      if (event.data.success) {
        resolveRef.current?.(true);
      } else {
        resolveRef.current?.(false);
      }
      resolveRef.current = null;
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const openSignIn = useCallback((): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setIsAuthenticating(true);
      setError(null);

      (async () => {
        const supabase = createClient();
        const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/auth/callback?redirect_to=/guest/auth-callback`,
            skipBrowserRedirect: true,
            queryParams: {
              access_type: "offline",
              prompt: "consent",
            },
          },
        });

        if (oauthError || !data.url) {
          setError(oauthError?.message || "Failed to start sign-in");
          setIsAuthenticating(false);
          resolveRef.current = null;
          resolve(false);
          return;
        }

        // Open OAuth in popup
        const width = 500;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        const popup = window.open(
          data.url,
          "guest-upgrade",
          `width=${width},height=${height},left=${left},top=${top}`
        );

        // Handle popup being closed without completing auth
        closeCheckerRef.current = setInterval(() => {
          if (popup?.closed) {
            if (closeCheckerRef.current) {
              clearInterval(closeCheckerRef.current);
              closeCheckerRef.current = null;
            }
            setIsAuthenticating(false);
            resolveRef.current?.(false);
            resolveRef.current = null;
          }
        }, 500);
      })();
    });
  }, []);

  const upgrade = useCallback(async (input: UpgradeInput): Promise<UpgradeResult | null> => {
    setIsUpgrading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Force session refresh — cookies were set by the popup's /auth/callback
      await supabase.auth.getSession();

      // Verify we have a session (retry once after delay if needed)
      let user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        // Cookie propagation might need a moment
        await new Promise((r) => setTimeout(r, 1000));
        await supabase.auth.getSession();
        user = (await supabase.auth.getUser()).data.user;
      }
      if (!user) {
        setError("Not authenticated — please try again");
        return null;
      }

      // 1. Create organization
      setProgress("Creating organization...");
      const orgId = crypto.randomUUID();
      const orgName = input.templateName || "My Certificates";
      const orgSlug = orgName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        + "-" + Date.now().toString(36);

      const { error: orgError } = await supabase
        .from("organizations")
        .insert({ id: orgId, name: orgName, slug: orgSlug });
      if (orgError) throw new Error(`Failed to create organization: ${orgError.message}`);

      const { error: memberError } = await supabase
        .from("org_members")
        .insert({ org_id: orgId, profile_id: user.id, role: "owner" });
      if (memberError) throw new Error(`Failed to add member: ${memberError.message}`);

      // 2. Create event
      setProgress("Creating event...");
      const { data: event, error: eventError } = await supabase
        .from("events")
        .insert({
          org_id: orgId,
          name: input.templateName || "Guest Certificates",
          description: "Imported from guest mode",
        })
        .select()
        .single();
      if (eventError) throw new Error(`Failed to create event: ${eventError.message}`);

      // 3. Upload template
      setProgress("Uploading template...");
      const ext = input.templateFile.name.split(".").pop() ?? "png";
      const templatePath = `certificates/templates/${event.id}/${Date.now()}.${ext}`;
      await uploadFile(supabase, "autocert", templatePath, input.templateFile, {
        contentType: input.templateFile.type,
        upsert: false,
      });
      const templateUrl = getPublicUrl(supabase, templatePath);

      const { data: template, error: tplError } = await supabase
        .from("templates")
        .insert({
          event_id: event.id,
          name: input.templateName || "Certificate",
          type: "custom",
          template_url: templateUrl,
          text_config: input.textConfig,
        })
        .select()
        .single();
      if (tplError) throw new Error(`Failed to save template: ${tplError.message}`);

      // 4. Insert recipients
      setProgress("Saving recipients...");
      const recipientRecords = input.recipients.map((r) => ({
        event_id: event.id,
        first_name: r.firstName,
        last_name: r.lastName,
        email: r.email || null,
      }));

      const { data: savedRecipients, error: rcptError } = await supabase
        .from("recipients")
        .insert(recipientRecords)
        .select("id");
      if (rcptError) throw new Error(`Failed to save recipients: ${rcptError.message}`);

      // 5. Upload generated certificates
      if (input.generatedCerts.length > 0 && savedRecipients) {
        setProgress(`Uploading ${input.generatedCerts.length} certificates...`);
        const folderName = (input.templateName || "certs").replace(/[^a-zA-Z0-9_-]/g, "_");
        const certRecords = [];

        for (let i = 0; i < input.generatedCerts.length; i++) {
          const cert = input.generatedCerts[i];
          const recipient = savedRecipients[i];
          if (!recipient) continue;

          const safeName = cert.name.replace(/[^a-zA-Z0-9_\- ]/g, "").replace(/\s+/g, "_") || `cert_${i}`;
          const certExt = cert.blob.type.includes("jpeg") ? "jpg" : "png";
          const certPath = `certificates/${folderName}/${safeName}.${certExt}`;

          try {
            await uploadFile(supabase, "autocert", certPath, cert.blob, {
              contentType: cert.blob.type,
              upsert: true,
            });
            const certUrl = getPublicUrl(supabase, certPath);

            certRecords.push({
              recipient_id: recipient.id,
              template_id: template.id,
              image_url: certUrl,
            });
          } catch {
            // Skip failed uploads, continue with the rest
          }

          if ((i + 1) % 10 === 0) {
            setProgress(`Uploading certificates... ${i + 1}/${input.generatedCerts.length}`);
          }
        }

        if (certRecords.length > 0) {
          const { error: certError } = await supabase
            .from("generated_certificates")
            .insert(certRecords);
          if (certError) {
            console.error("Failed to save certificate records:", certError);
          }
        }
      }

      setProgress("Done!");
      return { orgSlug, eventId: event.id };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upgrade failed");
      return null;
    } finally {
      setIsUpgrading(false);
    }
  }, []);

  return {
    openSignIn,
    upgrade,
    isAuthenticating,
    isUpgrading,
    error,
    progress,
  };
}
