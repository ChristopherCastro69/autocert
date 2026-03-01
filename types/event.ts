export interface Event {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  event_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateEventInput {
  org_id: string;
  name: string;
  description?: string;
  event_date?: string;
}

export interface UpdateEventInput {
  name?: string;
  description?: string;
  event_date?: string;
}
