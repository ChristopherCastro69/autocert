export interface Recipient {
  id: string;
  event_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface CreateRecipientInput {
  event_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  metadata?: Record<string, unknown>;
}

export type CreateRecipientsInput = Omit<CreateRecipientInput, "event_id">[];
