export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences?: {
    currency: string;
    language: string;
    notifications: boolean;
  };
}

export interface Trip {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  coverPhoto?: string;
  totalBudget: number;
  estimatedCost: number;
  isPublic: boolean;
  userId: string;
  stops: TripStop[];
  createdAt: string;
  updatedAt: string;
}

export interface TripStop {
  id: string;
  tripId: string;
  cityId: string;
  city: City;
  arrivalDate: string;
  departureDate: string;
  accommodation?: string;
  accommodationCost: number;
  transportCost: number;
  activities: Activity[];
  order: number;
}

export interface City {
  id: string;
  name: string;
  country: string;
  region: string;
  costIndex: number;
  popularity: number;
  imageUrl: string;
  description: string;
  currency: string;
  averageDailyCost: number;
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  category: ActivityCategory;
  cost: number;
  duration: number; // in hours
  rating: number;
  imageUrl: string;
  cityId: string;
  isBooked: boolean;
}

export type ActivityCategory = 
  | 'sightseeing' 
  | 'food' 
  | 'adventure' 
  | 'culture' 
  | 'nightlife' 
  | 'shopping' 
  | 'nature' 
  | 'relaxation';

export interface BudgetBreakdown {
  accommodation: number;
  transport: number;
  activities: number;
  meals: number;
  miscellaneous: number;
  total: number;
}