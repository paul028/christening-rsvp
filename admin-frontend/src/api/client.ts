import axios from 'axios';
import type { Guest, RsvpStats, RsvpWindowStatus } from '../types';

const ADMIN_AUTH_KEY = 'admin_auth';

export function getAdminAuth(): string | null {
  return localStorage.getItem(ADMIN_AUTH_KEY);
}

export function setAdminAuth(username: string, password: string): void {
  const encoded = btoa(`${username}:${password}`);
  localStorage.setItem(ADMIN_AUTH_KEY, encoded);
}

export function clearAdminAuth(): void {
  localStorage.removeItem(ADMIN_AUTH_KEY);
}

const baseURL = import.meta.env.VITE_BACKEND_URL
  ? `${import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '')}/api`
  : '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const auth = getAdminAuth();
  if (auth) {
    config.headers.Authorization = `Basic ${auth}`;
  }
  return config;
});

export async function getAdminGuests(): Promise<Guest[]> {
  const response = await api.get<Guest[]>('/admin/guests');
  return response.data;
}

export async function addGuest(
  name: string,
  email?: string,
  phone?: string,
  max_companions?: number,
  sponsor_role?: 'ninong' | 'ninang' | null,
): Promise<Guest> {
  const response = await api.post<Guest>('/admin/guests', {
    name,
    email,
    phone,
    max_companions: max_companions ?? 0,
    sponsor_role: sponsor_role ?? null,
  });
  return response.data;
}

export async function updateGuest(
  guestId: string,
  name: string,
  email?: string,
  phone?: string,
  max_companions?: number,
  sponsor_role?: 'ninong' | 'ninang' | null,
): Promise<Guest> {
  const response = await api.put<Guest>(`/admin/guests/${guestId}`, {
    name,
    email,
    phone,
    max_companions: max_companions ?? 0,
    sponsor_role: sponsor_role ?? null,
  });
  return response.data;
}

export async function deleteGuest(guestId: string): Promise<void> {
  await api.delete(`/admin/guests/${guestId}`);
}

export async function getStats(): Promise<RsvpStats> {
  const response = await api.get<RsvpStats>('/admin/stats');
  return response.data;
}

export async function getAdminRsvpWindow(): Promise<RsvpWindowStatus> {
  const response = await api.get<RsvpWindowStatus>('/admin/rsvp-window');
  return response.data;
}

export async function setAdminRsvpWindow(
  startDate: string | null,
  endDate: string | null,
): Promise<RsvpWindowStatus> {
  const response = await api.put<RsvpWindowStatus>('/admin/rsvp-window', {
    start_date: startDate,
    end_date: endDate,
  });
  return response.data;
}
