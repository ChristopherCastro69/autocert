export const SUPPORTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg"];
export const MAX_TEMPLATE_SIZE_MB = 10;
export const MAX_RECIPIENTS_PER_UPLOAD = 5000;

export const CERTIFICATE_TYPES = [
  "participant",
  "volunteer",
  "speaker",
  "custom",
] as const;

export const EMAIL_PROVIDERS = ["gmail", "resend"] as const;

export const EMAIL_JOB_STATUSES = [
  "pending",
  "processing",
  "sent",
  "failed",
  "retrying",
] as const;

export const CERTIFICATE_STATUSES = [
  "generated",
  "sent",
  "failed",
] as const;

export const ORG_ROLES = ["owner", "admin", "member"] as const;

export const DEFAULT_TEXT_CONFIG = {
  posXPercent: 50,
  posYPercent: 55,
  boundingBoxWidthPercent: 70,
  boundingBoxHeightPercent: 15,
  fontFamily: "Arial",
  maxFontSizePercent: 5,
  minFontSizePx: 12,
  fontWeight: "normal" as const,
  fontStyle: "normal" as const,
  textDecoration: "none" as const,
  textColor: "#000000",
  textAlign: "center" as const,
  capitalize: false,
  outputFormat: "png" as const,
  outputQuality: 0.9,
};

// Batch processing
export const BATCH_YIELD_INTERVAL = 10; // Yield to UI every N certs
export const EMAIL_BATCH_SIZE = 20; // Process N emails per invocation
export const EMAIL_MAX_ATTEMPTS = 3;

// Groq LLM
export const GROQ_MODEL = "llama-3.3-70b-versatile";
export const GROQ_TEMPERATURE = 0;
