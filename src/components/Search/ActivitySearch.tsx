import React, { useState, useEffect } from 'react';
import { Search, Filter, Clock, DollarSign, Star, MapPin, Plus, Check, Heart, Share2, Globe, Users, Calendar } from 'lucide-react';
import { Activity, ActivityCategory } from '../../types';

interface ActivityWithCity extends Activity {
  city: {
    id: number;
    name: string;
    country: string;
    region: string;
    imageUrl: string;
    popularity?: number;
  };
}

interface Trip {
  id: string;
  name: string;
  destinationCity: string;
  destinationCountry: string;
}

const ActivitySearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | 'all'>('all');
  const [priceRange, setPriceRange] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [durationFilter, setDurationFilter] = useState<'all' | 'short' | 'medium' | 'long'>('all');
  const [cityFilter, setCityFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [sortBy, setSortBy] = useState('rating');
  const [activities, setActivities] = useState<ActivityWithCity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityWithCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [bookedActivities, setBookedActivities] = useState<Set<number>>(new Set());
  const [userTrips, setUserTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<string>('');
  const [showTripSelector, setShowTripSelector] = useState(false);
  const [addingToTrip, setAddingToTrip] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch activities from API
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/activities');
        if (response.ok) {
          const data = await response.json();
          setActivities(data);
          setFilteredActivities(data);
          
          // Extract unique cities and regions
          const uniqueCities = [...new Set(data.map((activity: ActivityWithCity) => activity.city.name))] as string[];
          const uniqueRegions = [...new Set(data.map((activity: ActivityWithCity) => activity.city.region))] as string[];
          setCities(uniqueCities.sort());
          setRegions(uniqueRegions.sort());
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/activities/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const fetchUserTrips = async () => {
      try {
        const response = await fetch('/api/trips');
        if (response.ok) {
          const tripsData = await response.json();
          setUserTrips(tripsData);
        }
      } catch (error) {
        console.error('Error fetching user trips:', error);
      }
    };

    fetchActivities();
    fetchCategories();
    fetchUserTrips();
  }, []);

  // Handle search with button click
  const handleSearch = async () => {
    try {
      setSearchLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (cityFilter) params.append('city', cityFilter);
      if (regionFilter !== 'all') params.append('region', regionFilter);
      if (ratingFilter > 0) params.append('rating', ratingFilter.toString());
      if (sortBy) params.append('sortBy', sortBy);
      
      // Add price range filter
      if (priceRange !== 'all') {
        switch (priceRange) {
          case 'low':
            params.append('costMax', '25');
            break;
          case 'medium':
            params.append('costMax', '75');
            break;
          case 'high':
            // For high price, we'll filter client-side since we want > 75
            break;
        }
      }
      
      // Add duration filter
      if (durationFilter !== 'all') {
        switch (durationFilter) {
          case 'short':
            params.append('duration', '2');
            break;
          case 'medium':
            params.append('duration', '4');
            break;
          case 'long':
            // For long duration, we'll filter client-side since we want > 4
            break;
        }
      }
      
      const response = await fetch(`/api/activities/search?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        let filteredData = data;
        
        // Apply additional client-side filters for price and duration ranges
        if (priceRange === 'high') {
          filteredData = filteredData.filter((activity: ActivityWithCity) => (activity.cost || 0) > 75);
        }
        
        if (durationFilter === 'long') {
          filteredData = filteredData.filter((activity: ActivityWithCity) => (activity.duration || 0) > 4);
        }
        
        setFilteredActivities(filteredData);
      } else {
        // Fallback to client-side filtering if server search fails
        performClientSideSearch();
      }
    } catch (error) {
      console.error('Error searching activities:', error);
      // Fallback to client-side filtering
      performClientSideSearch();
    } finally {
      setSearchLoading(false);
    }
  };

  // Client-side filtering as fallback
  const performClientSideSearch = () => {
    let filtered = activities.filter(activity => {
      const searchLower = searchTerm.toLowerCase().trim();
      if (!searchLower) return true;
      
      return (
        activity.name.toLowerCase().includes(searchLower) ||
        (activity.description && activity.description.toLowerCase().includes(searchLower)) ||
        activity.city.name.toLowerCase().includes(searchLower) ||
        activity.city.country.toLowerCase().includes(searchLower) ||
        activity.city.region.toLowerCase().includes(searchLower)
      );
    });

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(activity => activity.category === selectedCategory);
    }

    if (cityFilter) {
      filtered = filtered.filter(activity => activity.city.name === cityFilter);
    }

    if (regionFilter !== 'all') {
      filtered = filtered.filter(activity => activity.city.region === regionFilter);
    }

    if (priceRange !== 'all') {
      filtered = filtered.filter(activity => {
        const cost = activity.cost || 0;
        switch (priceRange) {
          case 'low':
            return cost <= 25;
          case 'medium':
            return cost > 25 && cost <= 75;
          case 'high':
            return cost > 75;
          default:
            return true;
        }
      });
    }

    if (durationFilter !== 'all') {
      filtered = filtered.filter(activity => {
        const duration = activity.duration || 0;
        switch (durationFilter) {
          case 'short':
            return duration <= 2;
          case 'medium':
            return duration > 2 && duration <= 4;
          case 'long':
            return duration > 4;
          default:
            return true;
        }
      });
    }

    if (ratingFilter > 0) {
      filtered = filtered.filter(activity => (activity.rating || 0) >= ratingFilter);
    }

    // Sort activities
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'cost-low':
          return (a.cost || 0) - (b.cost || 0);
        case 'cost-high':
          return (b.cost || 0) - (a.cost || 0);
        case 'duration':
          return (a.duration || 0) - (b.duration || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'popularity':
          return ((b.city.popularity || 0) - (a.city.popularity || 0));
        default:
          return 0;
      }
    });

    setFilteredActivities(filtered);
  };

  // Handle Enter key press in search input
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Filter activities on filter changes (without search term)
  useEffect(() => {
    if (!searchTerm.trim()) {
      performClientSideSearch();
    }
  }, [activities, selectedCategory, priceRange, durationFilter, cityFilter, regionFilter, ratingFilter, sortBy]);

  // Clear search and reset to all activities
  const handleClearSearch = () => {
    setSearchTerm('');
    setFilteredActivities(activities);
  };

  const handleBookActivity = async (activityId: number) => {
    if (!selectedTrip) {
      setShowTripSelector(true);
      return;
    }

    try {
      setAddingToTrip(activityId);
      const response = await fetch(`/api/activities/${activityId}/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setBookedActivities(prev => new Set(prev).add(activityId));
        setActivities(prev => prev.map(activity => 
          activity.id === activityId ? { ...activity, isBooked: true } : activity
        ));
        
        const trip = userTrips.find(t => t.id === selectedTrip);
        alert(`Successfully added activity to ${trip?.name}!`);
      }
    } catch (error) {
      console.error('Error booking activity:', error);
    } finally {
      setAddingToTrip(null);
    }
  };

  const handleUnbookActivity = async (activityId: number) => {
    try {
      const response = await fetch(`/api/activities/${activityId}/unbook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setBookedActivities(prev => {
          const newSet = new Set(prev);
          newSet.delete(activityId);
          return newSet;
        });
        setActivities(prev => prev.map(activity => 
          activity.id === activityId ? { ...activity, isBooked: false } : activity
        ));
      }
    } catch (error) {
      console.error('Error unbooking activity:', error);
    }
  };

  const getPriceRangeLabel = (cost: number) => {
    if (cost <= 25) return 'Budget';
    if (cost <= 75) return 'Mid-range';
    return 'Premium';
  };

  const getDurationLabel = (duration: number) => {
    if (duration <= 2) return 'Quick';
    if (duration <= 4) return 'Half-day';
    return 'Full-day';
  };

  const ActivityCard: React.FC<{ activity: ActivityWithCity }> = ({ activity }) => {
    const isBooked = activity.isBooked || bookedActivities.has(activity.id);
    const isAdding = addingToTrip === activity.id;
    
    return (
      <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl overflow-hidden hover:border-slate-600/50 transition-all duration-200 group">
        <div className="relative h-48 overflow-hidden">
          <img
            src={activity.imageUrl}
            alt={activity.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          
          {/* Category Badge */}
          <div className="absolute top-4 right-4">
            <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-medium border border-blue-500/30 capitalize">
              {activity.category}
            </span>
          </div>

          {/* Price Range Badge */}
          <div className="absolute top-4 left-4">
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
              (activity.cost || 0) <= 25 
                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                : (activity.cost || 0) <= 75
                ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                : 'bg-red-500/20 text-red-400 border-red-500/30'
            }`}>
              {getPriceRangeLabel(activity.cost || 0)}
            </span>
          </div>

          {/* Rating */}
          <div className="absolute bottom-4 left-4">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(activity.rating || 0) 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-slate-500'
                  }`}
                />
              ))}
              <span className="text-white text-sm ml-2">{activity.rating?.toFixed(1)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="absolute top-4 left-16 flex space-x-2">
            <button className="p-2 bg-slate-800/50 rounded-full hover:bg-slate-700/50 transition-colors">
              <Heart className="h-4 w-4 text-slate-300" />
            </button>
            <button className="p-2 bg-slate-800/50 rounded-full hover:bg-slate-700/50 transition-colors">
              <Share2 className="h-4 w-4 text-slate-300" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* City Info */}
          <div className="flex items-center mb-3">
            <MapPin className="h-4 w-4 text-slate-400 mr-2" />
            <span className="text-slate-400 text-sm">{activity.city.name}, {activity.city.country}</span>
            <span className="ml-2 px-2 py-1 bg-slate-700/50 rounded-full text-xs text-slate-300">
              {activity.city.region}
            </span>
          </div>

          {/* Activity Info */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-2">{activity.name}</h3>
              <p className="text-slate-300 text-sm line-clamp-2">{activity.description}</p>
            </div>
          </div>

          {/* Details */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4 text-sm">
              <span className="flex items-center text-slate-300">
                <Clock className="h-4 w-4 mr-1" />
                {activity.duration}h
              </span>
              <span className="flex items-center text-green-400">
                <DollarSign className="h-4 w-4 mr-1" />
                ${activity.cost}
              </span>
              <span className="flex items-center text-slate-300">
                <Users className="h-4 w-4 mr-1" />
                {getDurationLabel(activity.duration || 0)}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isBooked && (
                <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                  <Check className="h-3 w-3 mr-1" />
                  Booked
                </span>
              )}
            </div>
            
            <button
              onClick={() => isBooked ? handleUnbookActivity(activity.id) : handleBookActivity(activity.id)}
              disabled={isAdding}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                isAdding
                  ? 'bg-slate-600/50 text-slate-400 cursor-not-allowed'
                  : isBooked
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                  : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30'
              }`}
            >
              {isAdding ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                  <span>Adding...</span>
                </>
              ) : isBooked ? (
                <>
                  <span>Unbook</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Add to Trip</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Discover Activities</h1>
          <p className="text-slate-400 mt-1">Find amazing experiences to add to your travel itinerary</p>
        </div>
        
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Discover Activities</h1>
        <p className="text-slate-400 mt-1">Find amazing experiences to add to your travel itinerary</p>
      </div>

      {/* Trip Selector Modal */}
      {showTripSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Select a Trip</h3>
            <div className="space-y-2 mb-4">
              {userTrips.map(trip => (
                <button
                  key={trip.id}
                  onClick={() => {
                    setSelectedTrip(trip.id);
                    setShowTripSelector(false);
                  }}
                  className="w-full text-left p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <div className="text-white font-medium">{trip.name}</div>
                  <div className="text-slate-400 text-sm">{trip.destinationCity}, {trip.destinationCountry}</div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowTripSelector(false)}
              className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
        <div className="space-y-4">
          {/* Search Bar with Button */}
          <div className="flex space-x-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search activities, experiences, or cities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="w-full pl-11 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={searchLoading}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {searchLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>Search</span>
                </>
              )}
            </button>
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="px-4 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-medium transition-colors duration-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as ActivityCategory | 'all')}
              className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.name} value={category.name}>
                  {category.name.charAt(0).toUpperCase() + category.name.slice(1)} ({category.count})
                </option>
              ))}
            </select>

            {/* City Filter */}
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Cities</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            {/* Region Filter */}
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Regions</option>
              {regions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>

            {/* Price Range Filter */}
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value as 'all' | 'low' | 'medium' | 'high')}
              className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Prices</option>
              <option value="low">Under $25</option>
              <option value="medium">$25 - $75</option>
              <option value="high">Over $75</option>
            </select>

            {/* Duration Filter */}
            <select
              value={durationFilter}
              onChange={(e) => setDurationFilter(e.target.value as 'all' | 'short' | 'medium' | 'long')}
              className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Durations</option>
              <option value="short">Under 2h</option>
              <option value="medium">2-4h</option>
              <option value="long">Over 4h</option>
            </select>

            {/* Rating Filter */}
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(parseFloat(e.target.value))}
              className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>All Ratings</option>
              <option value={4.5}>4.5+ Stars</option>
              <option value={4.0}>4.0+ Stars</option>
              <option value={3.5}>3.5+ Stars</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="rating">Highest Rated</option>
              <option value="cost-low">Lowest Price</option>
              <option value="cost-high">Highest Price</option>
              <option value="duration">Shortest Duration</option>
              <option value="popularity">Most Popular</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-slate-400">
          {filteredActivities.length} activit{filteredActivities.length !== 1 ? 'ies' : 'y'} found
          {searchTerm && (
            <span className="ml-2 text-blue-400">
              for "{searchTerm}"
            </span>
          )}
        </p>
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-blue-500/20 text-blue-400' 
                  : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50'
              }`}
            >
              <div className="grid grid-cols-2 gap-1 w-4 h-4">
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
              </div>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-blue-500/20 text-blue-400' 
                  : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50'
              }`}
            >
              <div className="space-y-1 w-4 h-4">
                <div className="bg-current rounded-sm h-1"></div>
                <div className="bg-current rounded-sm h-1"></div>
                <div className="bg-current rounded-sm h-1"></div>
              </div>
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-400">
              {selectedCategory !== 'all' && `${selectedCategory} • `}
              {cityFilter && `${cityFilter} • `}
              {regionFilter !== 'all' && `${regionFilter} • `}
              {priceRange !== 'all' && `${priceRange} price • `}
              {durationFilter !== 'all' && `${durationFilter} duration • `}
              {ratingFilter > 0 && `${ratingFilter}+ stars • `}
              {sortBy === 'rating' && 'Highest Rated'}
              {sortBy === 'cost-low' && 'Lowest Price'}
              {sortBy === 'cost-high' && 'Highest Price'}
              {sortBy === 'duration' && 'Shortest Duration'}
              {sortBy === 'popularity' && 'Most Popular'}
              {sortBy === 'name' && 'A-Z'}
            </span>
          </div>
        </div>
      </div>

      {/* Activities Grid/List */}
      {filteredActivities.length > 0 ? (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-4"
        }>
          {filteredActivities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="h-24 w-24 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-12 w-12 text-slate-500" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">
            {searchTerm ? `No activities found for "${searchTerm}"` : 'No activities found'}
          </h3>
          <p className="text-slate-400">
            {searchTerm ? 'Try adjusting your search term or filters' : 'Try adjusting your filters'}
          </p>
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivitySearch;