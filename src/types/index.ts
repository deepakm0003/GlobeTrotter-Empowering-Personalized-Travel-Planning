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
  description?: string;
  coverPhoto?: string;
  startDate: string;
  endDate: string;
  destinationCity: string;
  destinationCountry: string;
  totalBudget?: number;
  estimatedCost?: number;
  isPublic?: boolean;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  stops?: TripStop[];
}

export interface TripStop {
  id: string;
  cityId: string;
  cityName: string;
  country: string;
  arrivalDate: string;
  departureDate: string;
  activities: Activity[];
  notes?: string;
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