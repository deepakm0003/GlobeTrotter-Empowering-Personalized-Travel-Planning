import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { User, Trip } from '../types';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;

  trips: Trip[];
  setTrips: (trips: Trip[]) => void;

  currentTrip: Trip | null;
  setCurrentTrip: (trip: Trip | null) => void;

  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  /** 🔁 bump this to tell listeners (Dashboard, etc.) to refetch */
  refreshKey: number;
  bumpRefresh: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 🔔 signal used to trigger re-fetches across the app
  const [refreshKey, setRefreshKey] = useState(0);
  const bumpRefresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const value: AppContextType = {
    user,
    setUser,
    trips,
    setTrips,
    currentTrip,
    setCurrentTrip,
    isLoading,
    setIsLoading,
    refreshKey,
    bumpRefresh,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
