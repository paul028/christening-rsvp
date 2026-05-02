export interface Companion {
  first_name: string;
  last_name: string;
  dietary_restrictions: string | null;
}

export interface Guest {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  token: string;
  sponsor_role: 'ninong' | 'ninang' | null;
  rsvp_status: 'pending' | 'attending' | 'not_attending';
  max_companions: number;
  companions: Companion[];
  number_of_companions: number;
  dietary_restrictions: string | null;
  message: string | null;
  responded_at: string | null;
  created_at: string;
}

export interface RsvpWindowStatus {
  start_date: string | null;
  end_date: string | null;
  is_open: boolean;
}

export interface RsvpStats {
  total: number;
  attending: number;
  not_attending: number;
  pending: number;
  total_companions: number;
  attending_headcount: number;
}
