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
async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      // If you’re using mockAuth on the backend, you can pass x-user-id here:
      // "x-user-id": "<seeded-user-id>"
      ...(init?.headers || {}),
    },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

/** -----------------------------
 *  Backend-powered functions
 *  ----------------------------- */
export async function fetchDashboard(): Promise<DashboardResponse> {
  // Vite proxy should forward /api/* to backend (vite.config.ts)
  return api<DashboardResponse>("/api/dashboard");
}

export async function fetchMe(): Promise<User> {
  return api<User>("/api/auth/me");
}

export async function fetchMyTrips(): Promise<Trip[]> {
  return api<Trip[]>("/api/trips/my");
}

export async function fetchTripsByStatus(
  status: "ongoing" | "upcoming" | "completed"
): Promise<Trip[]> {
  return api<Trip[]>(`/api/trips?status=${status}`);
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
