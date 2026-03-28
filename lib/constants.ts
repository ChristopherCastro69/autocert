export const SUPPORTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg"];
export const MAX_TEMPLATE_SIZE_MB = 10;
export const MIN_TEMPLATE_WIDTH = 2000;
export const MIN_TEMPLATE_HEIGHT = 1414; // ~A4 landscape ratio at 2000px wide

export const PAPER_SIZES = {
  original: { label: "Original", width: 0, height: 0 },
  letter: { label: "Letter (8.5×11\")", width: 3300, height: 2550 }, // landscape at 300 DPI
  legal: { label: "Legal (8.5×14\")", width: 4200, height: 2550 },
  a4: { label: "A4 (210×297mm)", width: 3508, height: 2480 },
  a3: { label: "A3 (297×420mm)", width: 4961, height: 3508 },
} as const;

export type PaperSize = keyof typeof PAPER_SIZES;
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
  outputSize: "original" as const,
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
