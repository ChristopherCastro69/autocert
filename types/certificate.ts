export type CertificateStatus = "generated" | "sent" | "failed";

export interface GeneratedCertificate {
  id: string;
  recipient_id: string;
  template_id: string;
  image_url: string;
  status: CertificateStatus;
  sent_at: string | null;
  error_message: string | null;
  created_at: string;
}

export interface CreateGeneratedCertificateInput {
  recipient_id: string;
  template_id: string;
  image_url: string;
}

export interface GeneratedCertificateWithRecipient extends GeneratedCertificate {
  recipients: {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    event_id: string;
  };
}
