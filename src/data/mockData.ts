// src/data/mockData.ts
// Backend-first data helpers for dashboard/trips.
// Old mock exports are kept (empty) so existing imports don't crash.

import { User, Trip, City, Activity } from "../types";

/** -----------------------------
 *  Backend response contracts
 *  ----------------------------- */
export type DashboardStats = {
  totalTrips: number;
  countriesVisited: number;
  upcomingTrips: number;
  totalSpent: number;
  nextTripLabel?: string;
};

export type DashboardResponse = {
  stats: DashboardStats;
  recentTrips: Array<{
    id: string;
    name: string;
    coverPhoto: string;
    startDate: string; // ISO
    endDate: string;   // ISO
    estimatedCost: number;
    stopsCount: number;
  }>;
  popularDestinations: Array<{
    id: string;
    name: string;
    country: string;
    imageUrl: string;
    averageDailyCost: number;
    popularity: number; // 0..100
  }>;
};

/** -----------------------------
 *  Small fetch wrapper
 *  ----------------------------- */
async function api<T>(path: string, init?: RequestInit, userId?: string): Promise<T> {
  const headers = new Headers({
    "Content-Type": "application/json",
    ...(init?.headers || {}),
  });

  // Add user ID to headers if provided
  if (userId) {
    headers.set('x-user-id', userId);
  }

  const res = await fetch(path, {
    headers,
    ...init,
  });
  
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`❌ API Error: ${path}`, { status: res.status, text });
    throw new Error(`API ${path} failed: ${res.status} ${text}`);
  }
  
  const data = await res.json();
  return data;
}

/** -----------------------------
 *  Backend-powered functions
 *  ----------------------------- */
export async function fetchDashboard(userId?: string): Promise<DashboardResponse> {
  // Vite proxy should forward /api/* to backend (vite.config.ts)
  const url = userId ? `/api/dashboard?userId=${userId}&_t=${Date.now()}` : `/api/dashboard?_t=${Date.now()}`;
  return api<DashboardResponse>(url, undefined, userId);
}

export async function fetchMe(): Promise<User> {
  return api<User>("/api/auth/me");
}

export async function fetchMyTrips(userId?: string): Promise<Trip[]> {
  const url = userId ? `/api/trips/my?userId=${userId}&_t=${Date.now()}` : `/api/trips/my?_t=${Date.now()}`;
  return api<Trip[]>(url, undefined, userId);
}

export async function fetchTripsByStatus(
  status: "ongoing" | "upcoming" | "completed",
  userId?: string
): Promise<Trip[]> {
  const url = userId ? `/api/trips?status=${status}&userId=${userId}&_t=${Date.now()}` : `/api/trips?status=${status}&_t=${Date.now()}`;
  return api<Trip[]>(url, undefined, userId);
}

export async function searchActivities(params: {
  city?: string;
  category?: string;
  costMax?: number;
}): Promise<Activity[]> {
  const q = new URLSearchParams();
  if (params.city) q.set("city", params.city);
  if (params.category) q.set("category", params.category);
  if (typeof params.costMax === "number") q.set("costMax", String(params.costMax));
  return api<Activity[]>(`/api/activities/search?${q.toString()}`);
}

export async function fetchPublicTripsByRegion(region: string): Promise<Trip[]> {
  return api<Trip[]>(`/api/trips/public?region=${encodeURIComponent(region)}`);
}

export async function deleteTrip(tripId: string, userId?: string): Promise<void> {
  const url = userId ? `/api/trips/${tripId}?userId=${userId}` : `/api/trips/${tripId}`;
  await api<void>(url, { method: 'DELETE' }, userId);
}

/** -----------------------------
 *  Legacy mock exports (now empty)
 *  Keep names so old imports don’t crash.
 *  ----------------------------- */
export const mockUser: User | null = null;
export const mockCities: City[] = [
  {
    id: 1,
    name: 'Paris',
    country: 'France',
    region: 'Europe',
    costIndex: 85,
    popularity: 95,
    imageUrl: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&h=600&fit=crop',
    description: 'The City of Light offers iconic landmarks, world-class museums, and exquisite cuisine.',
    currency: 'EUR',
    averageDailyCost: 120
  },
  {
    id: 2,
    name: 'London',
    country: 'United Kingdom',
    region: 'Europe',
    costIndex: 90,
    popularity: 92,
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop',
    description: 'A vibrant metropolis with rich history, diverse culture, and endless entertainment options.',
    currency: 'GBP',
    averageDailyCost: 130
  },
  {
    id: 3,
    name: 'Tokyo',
    country: 'Japan',
    region: 'Asia',
    costIndex: 75,
    popularity: 88,
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop',
    description: 'A fascinating blend of ultramodern and traditional, offering unique cultural experiences.',
    currency: 'JPY',
    averageDailyCost: 100
  },
  {
    id: 4,
    name: 'New York',
    country: 'United States',
    region: 'North America',
    costIndex: 95,
    popularity: 90,
    imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop',
    description: 'The Big Apple offers world-famous attractions, diverse neighborhoods, and endless possibilities.',
    currency: 'USD',
    averageDailyCost: 150
  },
  {
    id: 5,
    name: 'Barcelona',
    country: 'Spain',
    region: 'Europe',
    costIndex: 70,
    popularity: 85,
    imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=600&fit=crop',
    description: 'A vibrant city known for its unique architecture, beautiful beaches, and lively atmosphere.',
    currency: 'EUR',
    averageDailyCost: 90
  },
  {
    id: 6,
    name: 'Bangkok',
    country: 'Thailand',
    region: 'Asia',
    costIndex: 45,
    popularity: 82,
    imageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&h=600&fit=crop',
    description: 'A bustling metropolis offering rich culture, delicious street food, and vibrant nightlife.',
    currency: 'THB',
    averageDailyCost: 60
  },
  {
    id: 7,
    name: 'Sydney',
    country: 'Australia',
    region: 'Oceania',
    costIndex: 80,
    popularity: 78,
    imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&h=600&fit=crop',
    description: 'A stunning harbor city with beautiful beaches, iconic landmarks, and outdoor lifestyle.',
    currency: 'AUD',
    averageDailyCost: 110
  },
  {
    id: 8,
    name: 'Rio de Janeiro',
    country: 'Brazil',
    region: 'South America',
    costIndex: 60,
    popularity: 75,
    imageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&h=600&fit=crop',
    description: 'Famous for its carnival, beautiful beaches, and the iconic Christ the Redeemer statue.',
    currency: 'BRL',
    averageDailyCost: 70
  },
  {
    id: 9,
    name: 'Cape Town',
    country: 'South Africa',
    region: 'Africa',
    costIndex: 55,
    popularity: 72,
    imageUrl: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&h=600&fit=crop',
    description: 'A beautiful coastal city with stunning landscapes, rich history, and diverse culture.',
    currency: 'ZAR',
    averageDailyCost: 65
  },
  {
    id: 10,
    name: 'Dubai',
    country: 'United Arab Emirates',
    region: 'Asia',
    costIndex: 85,
    popularity: 80,
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop',
    description: 'A modern city of superlatives with stunning architecture and luxury shopping.',
    currency: 'AED',
    averageDailyCost: 140
  },
  {
    id: 11,
    name: 'Amsterdam',
    country: 'Netherlands',
    region: 'Europe',
    costIndex: 75,
    popularity: 83,
    imageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&h=600&fit=crop',
    description: 'A charming city with beautiful canals, historic architecture, and vibrant culture.',
    currency: 'EUR',
    averageDailyCost: 100
  },
  {
    id: 12,
    name: 'Singapore',
    country: 'Singapore',
    region: 'Asia',
    costIndex: 90,
    popularity: 85,
    imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&h=600&fit=crop',
    description: 'A modern city-state known for its cleanliness, efficiency, and diverse cuisine.',
    currency: 'SGD',
    averageDailyCost: 120
  }
];
export const mockActivities: Activity[] = [];
export const mockTrips: Trip[] = [];

/** -----------------------------
 *  Calendar Event Management
 *  ----------------------------- */
export async function createCalendarEvent(eventData: {
  tripId: string;
  stopId: string;
  name: string;
  description: string;
  date: string;
  duration: number;
  cost: number;
  category: string;
}, userId?: string): Promise<Activity> {
  return api<Activity>('/api/calendar/events', {
    method: 'POST',
    body: JSON.stringify(eventData)
  }, userId);
}

export async function updateCalendarEvent(activityId: string, eventData: {
  name: string;
  description: string;
  duration: number;
  cost: number;
  category: string;
}, userId?: string): Promise<Activity> {
  return api<Activity>(`/api/calendar/events/${activityId}`, {
    method: 'PUT',
    body: JSON.stringify(eventData)
  }, userId);
}

export async function deleteCalendarEvent(activityId: string, userId?: string): Promise<void> {
  return api<void>(`/api/calendar/events/${activityId}`, {
    method: 'DELETE'
  }, userId);
}

export async function fetchCalendarEvents(tripId: string, userId?: string): Promise<Activity[]> {
  const response = await api<{ success: boolean; activities: Activity[] }>(`/api/calendar/events/${tripId}`, undefined, userId);
  return response.activities;
}
