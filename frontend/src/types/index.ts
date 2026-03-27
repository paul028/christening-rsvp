export interface Guest {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  token: string;
  rsvp_status: 'pending' | 'attending' | 'not_attending';
  number_of_companions: number;
  dietary_restrictions: string | null;
  message: string | null;
  responded_at: string | null;
  created_at: string;
}

export interface EventInfo {
  title: string;
  baby_name: string;
  date: string;
  time: string;
  church_name: string;
  church_map_url: string;
  reception_venue: string;
  reception_map_url: string;
}

export interface RsvpRequest {
  rsvp_status: 'attending' | 'not_attending';
  number_of_companions: number;
  dietary_restrictions: string | null;
  message: string | null;
}

export interface RsvpStats {
  total: number;
  attending: number;
  not_attending: number;
  pending: number;
  total_companions: number;
}
