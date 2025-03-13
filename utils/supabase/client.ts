import { createBrowserClient } from "@supabase/ssr";

// Create the Supabase client instance
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Export the Supabase client instance
export { supabase };

// Export the createClient function if needed
export const createClient = () => supabase;
