import { supabase } from "@/integrations/supabase/client";

export { supabase };

export type UserRole = 'customer' | 'ops';

export interface Profile {
  id: string;
  name: string;
  code: string | null;
  username: string;
  email: string;
  mobile_number: string | null;
  address: string | null;
  company_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRoleType {
  id: string;
  user_id: string;
  role: UserRole;
}
