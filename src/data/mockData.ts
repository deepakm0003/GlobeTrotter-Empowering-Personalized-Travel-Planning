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

  console.log(`🌐 API Request: ${path}`, { userId, headers: Object.fromEntries(headers.entries()) });

  const res = await fetch(path, {
    headers,
    ...init,
  });
  
  console.log(`📡 API Response: ${path}`, { status: res.status, ok: res.ok });
  
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`❌ API Error: ${path}`, { status: res.status, text });
    throw new Error(`API ${path} failed: ${res.status} ${text}`);
  }
  
  const data = await res.json();
  console.log(`✅ API Success: ${path}`, data);
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

/** -----------------------------
 *  Legacy mock exports (now empty)
 *  Keep names so old imports don’t crash.
 *  ----------------------------- */
export const mockUser: User | null = null;
export const mockCities: City[] = [];
export const mockActivities: Activity[] = [];
export const mockTrips: Trip[] = [];
