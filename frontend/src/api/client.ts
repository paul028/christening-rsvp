import axios from 'axios';
import type { Guest, RsvpRequest, EventInfo, RsvpStats, RsvpWindowStatus } from '../types';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function getGuestByToken(token: string): Promise<Guest> {
  const response = await api.get<Guest>(`/guests/${token}`);
  return response.data;
}

export async function submitRsvp(token: string, data: RsvpRequest): Promise<Guest> {
  const response = await api.post<Guest>(`/guests/${token}/rsvp`, data);
  return response.data;
}

export async function getEventDetails(): Promise<EventInfo> {
  const response = await api.get<EventInfo>('/event');
  return response.data;
}

export async function getAdminGuests(): Promise<Guest[]> {
  const response = await api.get<Guest[]>('/admin/guests');
  return response.data;
}

export async function addGuest(name: string, email?: string, phone?: string, max_companions?: number): Promise<Guest> {
  const response = await api.post<Guest>('/admin/guests', { name, email, phone, max_companions: max_companions ?? 0 });
  return response.data;
}

export async function updateGuest(guestId: string, name: string, email?: string, phone?: string, max_companions?: number): Promise<Guest> {
  const response = await api.put<Guest>(`/admin/guests/${guestId}`, { name, email, phone, max_companions: max_companions ?? 0 });
  return response.data;
}

export async function deleteGuest(guestId: string): Promise<void> {
  await api.delete(`/admin/guests/${guestId}`);
}

export async function getStats(): Promise<RsvpStats> {
  const response = await api.get<RsvpStats>('/admin/stats');
  return response.data;
}

export async function getRsvpWindow(): Promise<RsvpWindowStatus> {
  const response = await api.get<RsvpWindowStatus>('/rsvp-window');
  return response.data;
}

export async function getAdminRsvpWindow(): Promise<RsvpWindowStatus> {
  const response = await api.get<RsvpWindowStatus>('/admin/rsvp-window');
  return response.data;
}

export async function setAdminRsvpWindow(startDate: string | null, endDate: string | null): Promise<RsvpWindowStatus> {
  const response = await api.put<RsvpWindowStatus>('/admin/rsvp-window', {
    start_date: startDate,
    end_date: endDate,
  });
  return response.data;
}
