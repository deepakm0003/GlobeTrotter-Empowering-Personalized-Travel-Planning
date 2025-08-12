import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, DollarSign, Filter, Plus, Check, Globe, TrendingUp } from 'lucide-react';
import { City } from '../../types';

interface Trip {
  id: string;
  name: string;
  destinationCity: string;
  destinationCountry: string;
}

const CitySearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');
  const [cities, setCities] = useState<City[]>([]);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [userTrips, setUserTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<string>('');
  const [showTripSelector, setShowTripSelector] = useState(false);
  const [addingToTrip, setAddingToTrip] = useState<number | null>(null);

  const regions = ['all', 'Europe', 'Asia', 'North America', 'South America', 'Africa', 'Oceania'];

  // Fetch cities from API
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/cities');
        if (response.ok) {
          const citiesData = await response.json();
          setCities(citiesData);
        } else {
          console.error('Failed to fetch cities');
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
      } finally {
        setLoading(false);
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

    fetchCities();
    fetchUserTrips();
  }, []);

  useEffect(() => {
    let filtered = cities.filter(city => 
      city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      city.country.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedRegion !== 'all') {
      filtered = filtered.filter(city => city.region === selectedRegion);
    }

    // Sort cities
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return (b.popularity || 0) - (a.popularity || 0);
        case 'cost-low':
          return (a.averageDailyCost || 0) - (b.averageDailyCost || 0);
        case 'cost-high':
          return (b.averageDailyCost || 0) - (a.averageDailyCost || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredCities(filtered);
  }, [cities, searchTerm, selectedRegion, sortBy]);

  const handleAddToTrip = async (city: City) => {
    if (!selectedTrip) {
      setShowTripSelector(true);
      return;
    }

    try {
      setAddingToTrip(city.id);
      
      // Use AI to plan the trip
      const aiResponse = await fetch('/api/ai/plan-trip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cityId: city.id,
          tripDuration: 7,
        }),
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        
        // Create AI-planned trip
        const createResponse = await fetch('/api/ai/create-trip', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cityId: city.id,
            tripName: `AI-Planned Trip to ${city.name}`,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          }),
        });

        if (createResponse.ok) {
          const tripData = await createResponse.json();
          const trip = userTrips.find(t => t.id === selectedTrip);
          alert(`🎉 AI has planned your perfect trip to ${city.name}! Check your trips for the detailed itinerary.`);
          
          // Refresh trips list
          const tripsResponse = await fetch('/api/trips');
          if (tripsResponse.ok) {
            const tripsData = await tripsResponse.json();
            setUserTrips(tripsData);
          }
        } else {
          console.error('Failed to create AI-planned trip');
        }
      } else {
        console.error('Failed to plan trip with AI');
      }
    } catch (error) {
      console.error('Error adding city to trip:', error);
    } finally {
      setAddingToTrip(null);
    }
  };

  const CityCard: React.FC<{ city: City }> = ({ city }) => {
    const isAdding = addingToTrip === city.id;
    
    return (
      <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl overflow-hidden hover:border-slate-600/50 transition-all duration-200 group">
        <div className="relative h-48 overflow-hidden">
          <img
            src={city.imageUrl}
            alt={city.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          
          {/* Cost Badge */}
          <div className="absolute top-4 right-4">
            <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-medium border border-green-500/30">
              ${city.averageDailyCost}/day
            </span>
          </div>

          {/* Region Badge */}
          <div className="absolute top-4 left-4">
            <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-medium border border-blue-500/30">
              {city.region}
            </span>
          </div>

          {/* Popularity Stars */}
          <div className="absolute bottom-4 left-4">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor((city.popularity || 0) / 20) 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-slate-500'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Popularity Percentage */}
          <div className="absolute bottom-4 right-4">
            <div className="flex items-center space-x-1 bg-slate-800/50 px-2 py-1 rounded-full">
              <TrendingUp className="h-3 w-3 text-green-400" />
              <span className="text-white text-xs font-medium">{city.popularity}%</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-1">{city.name}</h3>
              <p className="text-slate-400 flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {city.country}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-400">Cost Index</div>
              <div className="text-lg font-bold text-blue-400">{city.costIndex}</div>
            </div>
          </div>

          <p className="text-slate-300 text-sm mb-4 line-clamp-2">{city.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm">
              <span className="flex items-center text-slate-300">
                <DollarSign className="h-4 w-4 mr-1" />
                {city.currency}
              </span>
              <span className="flex items-center text-slate-300">
                <Globe className="h-4 w-4 mr-1" />
                {city.region}
              </span>
            </div>
            
            <button
              onClick={() => handleAddToTrip(city)}
              disabled={isAdding}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                isAdding
                  ? 'bg-slate-600/50 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30'
              }`}
            >
              {isAdding ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                  <span>Adding...</span>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Discover Destinations</h1>
        <p className="text-slate-400 mt-1">Find amazing cities to add to your travel itinerary</p>
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
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search cities, countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Region Filter */}
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {regions.map(region => {
              const cityCount = region === 'all' 
                ? cities.length 
                : cities.filter(city => city.region === region).length;
              
              return (
                <option key={region} value={region}>
                  {region === 'all' ? `All Regions (${cityCount})` : `${region} (${cityCount})`}
                </option>
              );
            })}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="popularity">Most Popular</option>
            <option value="cost-low">Lowest Cost</option>
            <option value="cost-high">Highest Cost</option>
            <option value="name">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-slate-400">
          {filteredCities.length} destination{filteredCities.length !== 1 ? 's' : ''} found
        </p>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-400">
            {selectedRegion !== 'all' && `${selectedRegion} • `}
            {sortBy === 'popularity' && 'Most Popular'}
            {sortBy === 'cost-low' && 'Lowest Cost'}
            {sortBy === 'cost-high' && 'Highest Cost'}
            {sortBy === 'name' && 'A-Z'}
          </span>
        </div>
      </div>

      {/* Indian Cities Highlight for Asia Region */}
      {selectedRegion === 'Asia' && !loading && (
        <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-2xl">🇮🇳</span>
            <h3 className="text-lg font-semibold text-white">Discover Amazing Indian Cities</h3>
          </div>
          <p className="text-slate-300 text-sm">
            Explore the diverse culture, rich heritage, and stunning landscapes of India. From the spiritual Varanasi to the beaches of Goa, 
            from the royal palaces of Jaipur to the financial hub of Mumbai - India offers unforgettable experiences.
          </p>
        </div>
      )}

      {/* Cities Grid */}
      {loading ? (
        <div className="text-center py-16">
          <div className="h-24 w-24 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
          <h3 className="text-xl font-medium text-white mb-2">Loading destinations...</h3>
          <p className="text-slate-400">Please wait while we fetch amazing cities</p>
        </div>
      ) : filteredCities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCities.map((city) => (
            <CityCard key={city.id} city={city} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="h-24 w-24 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-12 w-12 text-slate-500" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">No destinations found</h3>
          <p className="text-slate-400">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default CitySearch;