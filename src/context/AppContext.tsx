import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { User, Trip } from '../types';
import { fetchMyTrips } from '../data/mockData';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  login: (user: User) => void;

  trips: Trip[];
  setTrips: (trips: Trip[]) => void;

  currentTrip: Trip | null;
  setCurrentTrip: (trip: Trip | null) => void;

  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  /** 🔁 bump this to tell listeners (Dashboard, etc.) to refetch */
  refreshKey: number;
  bumpRefresh: () => void;

  /** 🔄 bump this to tell SharedTripsPage to refetch shared trips */
  sharedTripsRefreshKey: number;
  bumpSharedTripsRefresh: () => void;
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

  // 🔄 signal used to trigger re-fetches for shared trips
  const [sharedTripsRefreshKey, setSharedTripsRefreshKey] = useState(0);
  const bumpSharedTripsRefresh = useCallback(() => setSharedTripsRefreshKey((k) => k + 1), []);

  // Add this to handle Google auth tokens
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      verifyToken(token);
    } else if (!token && !user) {
      // No token and no user, this is expected for unauthenticated users
      console.log('No authentication token found');
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify-token', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const { user } = await response.json();
        console.log('Token verified successfully, user:', user);
        setUser(user);
      } else {
        console.log('Token verification failed, removing token');
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('Token verification error:', error);
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  // Logout function to properly clear user data
  const logout = useCallback(() => {
    console.log('Logging out user, clearing all data');
    setUser(null);
    setTrips([]);
    setCurrentTrip(null);
    setRefreshKey(0);
    setSharedTripsRefreshKey(0); // Clear shared trips refresh key on logout
    localStorage.removeItem('token');
  }, []);

  // Login function
  const login = useCallback((user: User) => {
    setUser(user);
  }, []);

  // Load user's trips when user changes
  useEffect(() => {
    const loadUserTrips = async () => {
      if (user?.id) {
        try {
          setIsLoading(true);
          const userTrips = await fetchMyTrips(user.id);
          setTrips(userTrips);
        } catch (error) {
          console.error('Failed to load user trips:', error);
          setTrips([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Clear trips when user logs out
        setTrips([]);
        setCurrentTrip(null);
      }
    };

    loadUserTrips();
  }, [user?.id]);

  const value: AppContextType = {
    user,
    setUser,
    logout,
    login,
    trips,
    setTrips,
    currentTrip,
    setCurrentTrip,
    isLoading,
    setIsLoading,
    refreshKey,
    bumpRefresh,
    sharedTripsRefreshKey,
    bumpSharedTripsRefresh,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
