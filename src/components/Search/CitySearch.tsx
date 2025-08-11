import React, { useState } from 'react';
import { Search, MapPin, Star, DollarSign, Filter, Plus } from 'lucide-react';
import { mockCities } from '../../data/mockData';
import { City } from '../../types';

const CitySearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');
  const [filteredCities, setFilteredCities] = useState(mockCities);

  const regions = ['all', 'Europe', 'Asia', 'North America', 'South America', 'Africa', 'Oceania'];

  React.useEffect(() => {
    let filtered = mockCities.filter(city => 
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
          return b.popularity - a.popularity;
        case 'cost-low':
          return a.averageDailyCost - b.averageDailyCost;
        case 'cost-high':
          return b.averageDailyCost - a.averageDailyCost;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredCities(filtered);
  }, [searchTerm, selectedRegion, sortBy]);

  const CityCard: React.FC<{ city: City }> = ({ city }) => (
    <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl overflow-hidden hover:border-slate-600/50 transition-all duration-200 group">
      <div className="relative h-48 overflow-hidden">
        <img
          src={city.imageUrl}
          alt={city.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute top-4 right-4">
          <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-medium border border-green-500/30">
            ${city.averageDailyCost}/day
          </span>
        </div>
        <div className="absolute bottom-4 left-4">
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.floor(city.popularity / 20) 
                    ? 'text-yellow-400 fill-current' 
                    : 'text-slate-500'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">{city.name}</h3>
            <p className="text-slate-400 flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {city.country}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-400">Popularity</div>
            <div className="text-lg font-bold text-blue-400">{city.popularity}%</div>
          </div>
        </div>

        <p className="text-slate-300 text-sm mb-4 line-clamp-2">{city.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm">
            <span className="flex items-center text-slate-300">
              <DollarSign className="h-4 w-4 mr-1" />
              Cost Index: {city.costIndex}
            </span>
          </div>
          <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200 flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add to Trip</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Discover Destinations</h1>
        <p className="text-slate-400 mt-1">Find amazing cities to add to your travel itinerary</p>
      </div>

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
            {regions.map(region => (
              <option key={region} value={region}>
                {region === 'all' ? 'All Regions' : region}
              </option>
            ))}
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

      {/* Cities Grid */}
      {filteredCities.length > 0 ? (
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