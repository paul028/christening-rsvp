import axios from 'axios';
import type { Guest, RsvpRequest, EventInfo, RsvpWindowStatus } from '../types';

const baseURL = import.meta.env.VITE_BACKEND_URL
  ? `${import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '')}/api`
  : '/api';

const api = axios.create({
  baseURL,
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

export async function getRsvpWindow(): Promise<RsvpWindowStatus> {
  const response = await api.get<RsvpWindowStatus>('/rsvp-window');
  return response.data;
}
