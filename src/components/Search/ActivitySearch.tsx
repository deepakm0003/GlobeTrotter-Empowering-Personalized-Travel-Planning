import React, { useState } from 'react';
import { Search, Filter, Clock, DollarSign, Star, Plus, MapPin } from 'lucide-react';
import { mockActivities } from '../../data/mockData';
import { Activity, ActivityCategory } from '../../types';

const ActivitySearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | 'all'>('all');
  const [priceRange, setPriceRange] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [sortBy, setSortBy] = useState('rating');
  const [filteredActivities, setFilteredActivities] = useState(mockActivities);

  const categories: (ActivityCategory | 'all')[] = [
    'all', 'sightseeing', 'food', 'adventure', 'culture', 'nightlife', 'shopping', 'nature', 'relaxation'
  ];

  React.useEffect(() => {
    let filtered = mockActivities.filter(activity => 
      activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(activity => activity.category === selectedCategory);
    }

    if (priceRange !== 'all') {
      filtered = filtered.filter(activity => {
        switch (priceRange) {
          case 'low':
            return activity.cost <= 25;
          case 'medium':
            return activity.cost > 25 && activity.cost <= 75;
          case 'high':
            return activity.cost > 75;
          default:
            return true;
        }
      });
    }

    // Sort activities
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'cost-low':
          return a.cost - b.cost;
        case 'cost-high':
          return b.cost - a.cost;
        case 'duration':
          return a.duration - b.duration;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredActivities(filtered);
  }, [searchTerm, selectedCategory, priceRange, sortBy]);

  const ActivityCard: React.FC<{ activity: Activity }> = ({ activity }) => (
    <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl overflow-hidden hover:border-slate-600/50 transition-all duration-200 group">
      <div className="relative h-48 overflow-hidden">
        <img
          src={activity.imageUrl}
          alt={activity.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute top-4 right-4">
          <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-medium border border-blue-500/30 capitalize">
            {activity.category}
          </span>
        </div>
        <div className="absolute bottom-4 left-4">
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.floor(activity.rating) 
                    ? 'text-yellow-400 fill-current' 
                    : 'text-slate-500'
                }`}
              />
            ))}
            <span className="text-white text-sm ml-2">{activity.rating}</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-2">{activity.name}</h3>
            <p className="text-slate-300 text-sm line-clamp-2">{activity.description}</p>
          </div>
        </div>

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
          </div>
          <div className="flex items-center text-sm text-slate-400">
            <MapPin className="h-4 w-4 mr-1" />
            City ID: {activity.cityId}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {activity.isBooked && (
              <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-medium">
                Booked
              </span>
            )}
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
        <h1 className="text-3xl font-bold text-white">Discover Activities</h1>
        <p className="text-slate-400 mt-1">Find amazing experiences to add to your travel itinerary</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search activities, experiences..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as ActivityCategory | 'all')}
              className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
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
              <option value="name">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-slate-400">
          {filteredActivities.length} activit{filteredActivities.length !== 1 ? 'ies' : 'y'} found
        </p>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-400">
            {selectedCategory !== 'all' && `${selectedCategory} • `}
            {priceRange !== 'all' && `${priceRange} price • `}
            {sortBy === 'rating' && 'Highest Rated'}
            {sortBy === 'cost-low' && 'Lowest Price'}
            {sortBy === 'cost-high' && 'Highest Price'}
            {sortBy === 'duration' && 'Shortest Duration'}
            {sortBy === 'name' && 'A-Z'}
          </span>
        </div>
      </div>

      {/* Activities Grid */}
      {filteredActivities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="h-24 w-24 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-12 w-12 text-slate-500" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">No activities found</h3>
          <p className="text-slate-400">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default ActivitySearch;