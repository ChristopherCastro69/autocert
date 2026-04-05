"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { TemplateTextConfig } from "@/types";
import type { GuestRecipient } from "@/types/guest";
import type { GuestBatchResult } from "@/hooks/use-guest-batch-generation";
import { DEFAULT_TEXT_CONFIG } from "@/lib/constants";

export type GuestEmailProvider = "gmail" | "resend" | "smtp";

export interface GuestEmailConfig {
  provider: GuestEmailProvider;
  fromEmail: string;

  // Gmail (in-memory tokens from OAuth)
  gmailAccessToken?: string;
  gmailRefreshToken?: string;

  // Resend
  resendApiKey?: string;

  // SMTP
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUsername?: string;
  smtpPassword?: string;
}

interface GuestState {
  templateFile: File | null;
  templateObjectUrl: string | null;
  templateName: string;
  textConfig: TemplateTextConfig;
  recipients: GuestRecipient[];
  generatedCerts: GuestBatchResult[];
  emailConfig: GuestEmailConfig | null;
}

interface GuestContextType extends GuestState {
  setTemplate: (file: File) => void;
  clearTemplate: () => void;
  setTextConfig: (config: TemplateTextConfig) => void;
  setRecipients: (recipients: GuestRecipient[]) => void;
  setGeneratedCerts: (certs: GuestBatchResult[]) => void;
  clearGeneratedCerts: () => void;
  setEmailConfig: (config: GuestEmailConfig | null) => void;
  reset: () => void;
}

const GuestContext = createContext<GuestContextType | undefined>(undefined);

export function GuestProvider({ children }: { children: React.ReactNode }) {
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [templateObjectUrl, setTemplateObjectUrl] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [textConfig, setTextConfig] = useState<TemplateTextConfig>(
    DEFAULT_TEXT_CONFIG as TemplateTextConfig
  );
  const [recipients, setRecipients] = useState<GuestRecipient[]>([]);
  const [generatedCerts, setGeneratedCerts] = useState<GuestBatchResult[]>([]);
  const [emailConfig, setEmailConfig] = useState<GuestEmailConfig | null>(null);

  // Revoke previous object URL when template changes
  useEffect(() => {
    return () => {
      if (templateObjectUrl) {
        URL.revokeObjectURL(templateObjectUrl);
      }
    };
  }, [templateObjectUrl]);

  const setTemplate = useCallback((file: File) => {
    // Revoke old URL if exists
    setTemplateObjectUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setTemplateFile(file);
    setTemplateName(file.name.replace(/\.[^/.]+$/, ""));
    // Clear generated certs when template changes
    setGeneratedCerts([]);
  }, []);

  const clearTemplate = useCallback(() => {
    setTemplateObjectUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setTemplateFile(null);
    setTemplateName("");
    setGeneratedCerts([]);
  }, []);

  const clearGeneratedCerts = useCallback(() => {
    setGeneratedCerts([]);
  }, []);

  const reset = useCallback(() => {
    setTemplateObjectUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setTemplateFile(null);
    setTemplateName("");
    setTextConfig(DEFAULT_TEXT_CONFIG as TemplateTextConfig);
    setRecipients([]);
    setGeneratedCerts([]);
    setEmailConfig(null);
  }, []);

  return (
    <GuestContext.Provider
      value={{
        templateFile,
        templateObjectUrl,
        templateName,
        textConfig,
        recipients,
        generatedCerts,
        emailConfig,
        setTemplate,
        clearTemplate,
        setTextConfig,
        setRecipients,
        setGeneratedCerts,
        clearGeneratedCerts,
        setEmailConfig,
        reset,
      }}
    >
      {children}
    </GuestContext.Provider>
  );
}

export function useGuest() {
  const context = useContext(GuestContext);
  if (!context) {
    throw new Error("useGuest must be used within a GuestProvider");
  }
  return context;
}
