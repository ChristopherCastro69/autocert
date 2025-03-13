  
  export interface RecipientDTO {
    id?: string; 
    certificate_id: string; // Reference to the Certificates table
    name: string;
    email: string;
    created_at?: Date; // Optional for new recipients
  }