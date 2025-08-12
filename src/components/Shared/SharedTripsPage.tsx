import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Mail, Link, Clock, Users, Eye, Copy, Trash2, RefreshCw, Filter, Search, Check } from 'lucide-react';
import { SharedTrip } from '../../types';
import { format, differenceInDays } from 'date-fns';
import toast from 'react-hot-toast';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

const SharedTripsPage: React.FC = () => {
  const { user, sharedTripsRefreshKey } = useApp();
  const navigate = useNavigate();
  const [sharedTrips, setSharedTrips] = useState<SharedTrip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<SharedTrip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState<'all' | 'email' | 'link'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchSharedTrips();
    } else {
      setIsLoading(false);
      setError('Please log in to view your shared trips');
    }
  }, [user]);

  // Listen for shared trips refresh signals
  useEffect(() => {
    if (user && !isLoading) {
      fetchSharedTrips();
    }
  }, [sharedTripsRefreshKey, user, isLoading]);

  // Add focus event listener to refresh data when page becomes visible
  useEffect(() => {
    const handleFocus = () => {
      if (user && !isLoading) {
        fetchSharedTrips();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user, isLoading]);

  // Add navigation event listener to refresh data when navigating to this page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user && !isLoading) {
        fetchSharedTrips();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, isLoading]);

  // Listen for shared trips update events
  useEffect(() => {
    const handleSharedTripsUpdated = () => {
      if (user && !isLoading) {
        fetchSharedTrips();
      }
    };

    window.addEventListener('sharedTripsUpdated', handleSharedTripsUpdated);
    return () => window.removeEventListener('sharedTripsUpdated', handleSharedTripsUpdated);
  }, [user, isLoading]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user && !isLoading) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  // Filter trips based on search and filter criteria
  useEffect(() => {
    let filtered = sharedTrips;

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(trip => 
        trip.trip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.trip.destinationCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.trip.destinationCountry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (trip.sharedWith && trip.sharedWith.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply method filter
    if (filterMethod !== 'all') {
      filtered = filtered.filter(trip => trip.shareMethod === filterMethod);
    }

    setFilteredTrips(filtered);
  }, [sharedTrips, searchTerm, filterMethod]);

  const fetchSharedTrips = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in.');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/shared-trips', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSharedTrips(data);
        setFilteredTrips(data);
      } else if (response.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (response.status === 403) {
        setError('Access denied. Please check your permissions.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || 'Failed to load shared trips');
      }
    } catch (error) {
      console.error('Error fetching shared trips:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSharedTrips = async () => {
    setIsRefreshing(true);
    await fetchSharedTrips();
    setIsRefreshing(false);
  };

  const copyShareUrl = async (shareUrl: string, tripId: string) => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedId(tripId);
      toast.success('Share link copied to clipboard!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const viewSharedTrip = (tripId: string) => {
    window.open(`/shared-trip/${tripId}`, '_blank');
  };

  const deactivateShare = async (sharedTripId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required. Please log in.');
        return;
      }

      const response = await fetch(`/api/shared-trips/${sharedTripId}/deactivate`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Share deactivated successfully');
        fetchSharedTrips(); // Refresh the list
      } else if (response.status === 401) {
        toast.error('Authentication failed. Please log in again.');
      } else if (response.status === 403) {
        toast.error('Access denied. Please check your permissions.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || 'Failed to deactivate share');
      }
    } catch (error) {
      console.error('Error deactivating share:', error);
      toast.error('Network error. Please try again.');
    }
  };

  const getShareMethodIcon = (method: string) => {
    return method === 'email' ? <Mail className="h-4 w-4" /> : <Link className="h-4 w-4" />;
  };

  const getShareMethodColor = (method: string) => {
    return method === 'email' ? 'text-blue-400' : 'text-green-400';
  };

  const getShareMethodLabel = (method: string) => {
    return method === 'email' ? 'Email' : 'Link';
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterMethod('all');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading shared trips...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Error</h1>
          <p className="text-slate-400 mb-6">{error}</p>
          {error.includes('log in') || error.includes('Authentication') ? (
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Go to Login
            </button>
          ) : (
            <button
              onClick={fetchSharedTrips}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Shared Trips</h1>
          <p className="text-slate-400">Track all your shared itineraries and their sharing details</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-slate-400 text-sm">Total Shared</p>
                <p className={`text-white text-2xl font-bold transition-all duration-300 ${isRefreshing ? 'animate-pulse' : ''}`}>
                  {sharedTrips.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <Mail className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-slate-400 text-sm">Email Shares</p>
                <p className={`text-white text-2xl font-bold transition-all duration-300 ${isRefreshing ? 'animate-pulse' : ''}`}>
                  {sharedTrips.filter(st => st.shareMethod === 'email').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <Link className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-slate-400 text-sm">Link Shares</p>
                <p className={`text-white text-2xl font-bold transition-all duration-300 ${isRefreshing ? 'animate-pulse' : ''}`}>
                  {sharedTrips.filter(st => st.shareMethod === 'link').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search trips, destinations, or recipients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value as 'all' | 'email' | 'link')}
                className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Methods</option>
                <option value="email">Email Only</option>
                <option value="link">Link Only</option>
              </select>

              <button
                onClick={clearFilters}
                className="px-4 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>Clear</span>
              </button>

              <button
                onClick={refreshSharedTrips}
                disabled={isRefreshing}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-400">
            {filteredTrips.length} shared trip{filteredTrips.length !== 1 ? 's' : ''} found
            {(searchTerm || filterMethod !== 'all') && (
              <span className="ml-2 text-blue-400">
                (filtered from {sharedTrips.length} total)
              </span>
            )}
          </p>
        </div>

        {/* Shared Trips List */}
        {filteredTrips.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-12 text-center">
            <Users className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {sharedTrips.length === 0 ? 'No Shared Trips Yet' : 'No Trips Match Your Filters'}
            </h3>
            <p className="text-slate-400 mb-6">
              {sharedTrips.length === 0 
                ? "You haven't shared any trips yet. Share your itineraries with friends and family to see them here."
                : "Try adjusting your search terms or filters to find what you're looking for."
              }
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => navigate('/trips')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Go to My Trips
              </button>
              {sharedTrips.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredTrips.map((sharedTrip) => (
              <div
                key={sharedTrip.id}
                className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6"
              >
                <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between space-y-4 xl:space-y-0">
                  {/* Trip Info */}
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                      {sharedTrip.trip.coverPhoto && (
                        <img
                          src={sharedTrip.trip.coverPhoto}
                          alt={sharedTrip.trip.name}
                          className="w-20 h-20 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold text-white mb-2 truncate">
                          {sharedTrip.trip.name}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-green-400 flex-shrink-0" />
                            <span className="text-slate-400 text-sm truncate">
                              {sharedTrip.trip.destinationCity}, {sharedTrip.trip.destinationCountry}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-blue-400 flex-shrink-0" />
                            <span className="text-slate-400 text-sm">
                              {differenceInDays(new Date(sharedTrip.trip.endDate), new Date(sharedTrip.trip.startDate))} days
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                            <span className="text-slate-400 text-sm">
                              {format(new Date(sharedTrip.sharedAt), 'MMM dd, yyyy')}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className={`${getShareMethodColor(sharedTrip.shareMethod)}`}>
                              {getShareMethodIcon(sharedTrip.shareMethod)}
                            </div>
                            <span className="text-slate-400 text-sm">
                              {getShareMethodLabel(sharedTrip.shareMethod)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sharing Details and Actions */}
                  <div className="flex flex-col space-y-4 xl:space-y-3">
                    {/* Share Method and Recipient */}
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className={`${getShareMethodColor(sharedTrip.shareMethod)}`}>
                          {getShareMethodIcon(sharedTrip.shareMethod)}
                        </div>
                        <span className="text-white font-medium">
                          {getShareMethodLabel(sharedTrip.shareMethod)}
                        </span>
                      </div>

                      {sharedTrip.shareMethod === 'email' && sharedTrip.sharedWith && (
                        <div className="text-slate-400 text-sm">
                          Shared with: {sharedTrip.sharedWith}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => viewSharedTrip(sharedTrip.tripId)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center space-x-1 transition-colors"
                        title="View shared trip"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="hidden sm:inline">View</span>
                      </button>

                      {sharedTrip.shareUrl && (
                        <button
                          onClick={() => copyShareUrl(sharedTrip.shareUrl!, sharedTrip.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center space-x-1 transition-colors"
                          title="Copy share link"
                        >
                          {copiedId === sharedTrip.id ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                          <span className="hidden sm:inline">
                            {copiedId === sharedTrip.id ? 'Copied' : 'Copy'}
                          </span>
                        </button>
                      )}

                      <button
                        onClick={() => deactivateShare(sharedTrip.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg flex items-center space-x-1 transition-colors"
                        title="Deactivate share"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Share URL Display */}
                {sharedTrip.shareUrl && (
                  <div className="mt-4 p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                      <span className="text-slate-400 text-sm">Share URL:</span>
                      <span className="text-white text-sm font-mono truncate max-w-full sm:max-w-md">
                        {sharedTrip.shareUrl}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedTripsPage;
