export interface GeneratedCertificateDTO {
    id?: string; 
    recipient_id: string; 
    certificate_id: string; // Reference to the Certificates table
    image_url: string;
    sent_at?: Date; // Optional for tracking when sent
  }