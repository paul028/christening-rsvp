import axios from 'axios';
import type { Guest, RsvpRequest, EventInfo, RsvpStats } from '../types';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function getGuestByToken(token: string): Promise<Guest> {
  const response = await api.get<Guest>(`/rsvp/${token}`);
  return response.data;
}

export async function submitRsvp(token: string, data: RsvpRequest): Promise<Guest> {
  const response = await api.post<Guest>(`/rsvp/${token}`, data);
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

export async function addGuest(name: string, email?: string, phone?: string): Promise<Guest> {
  const response = await api.post<Guest>('/admin/guests', { name, email, phone });
  return response.data;
}

export async function updateGuest(guestId: string, name: string, email?: string, phone?: string): Promise<Guest> {
  const response = await api.put<Guest>(`/admin/guests/${guestId}`, { name, email, phone });
  return response.data;
}

export async function deleteGuest(guestId: string): Promise<void> {
  await api.delete(`/admin/guests/${guestId}`);
}

export async function getStats(): Promise<RsvpStats> {
  const response = await api.get<RsvpStats>('/admin/stats');
  return response.data;
}
