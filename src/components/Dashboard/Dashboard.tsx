import React from 'react';
import { Plus, TrendingUp, MapPin, Calendar, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { mockTrips, mockCities } from '../../data/mockData';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, setTrips } = useApp();

  React.useEffect(() => {
    setTrips(mockTrips);
  }, [setTrips]);

  const stats = [
    {
      label: 'Total Trips',
      value: '12',
      icon: MapPin,
      color: 'from-blue-500 to-cyan-500',
      change: '+2 this month',
    },
    {
      label: 'Countries Visited',
      value: '8',
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
      change: '+3 this year',
    },
    {
      label: 'Upcoming Trips',
      value: '2',
      icon: Calendar,
      color: 'from-green-500 to-emerald-500',
      change: 'Next: June 15',
    },
    {
      label: 'Total Spent',
      value: '$8.5k',
      icon: DollarSign,
      color: 'from-orange-500 to-red-500',
      change: '2024 trips',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-500/20 rounded-2xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-slate-300">
              Ready to plan your next adventure? Let's explore the world together.
            </p>
          </div>
          <button
            onClick={() => navigate('/create-trip')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Plan New Trip</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`h-12 w-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-slate-400 text-sm">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Trips */}
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Recent Trips</h2>
            <button 
              onClick={() => navigate('/trips')}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              View all
            </button>
          </div>
          <div className="space-y-4">
            {mockTrips.slice(0, 3).map((trip) => (
              <div key={trip.id} className="flex items-center space-x-4 p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-all duration-200 cursor-pointer">
                <img
                  src={trip.coverPhoto}
                  alt={trip.name}
                  className="h-12 w-12 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-white">{trip.name}</h3>
                  <p className="text-sm text-slate-400">
                    {format(new Date(trip.startDate), 'MMM d')} - {format(new Date(trip.endDate), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-blue-400">${trip.estimatedCost}</p>
                  <p className="text-xs text-slate-400">{trip.stops.length} stops</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Destinations */}
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Popular Destinations</h2>
            <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
              Explore more
            </button>
          </div>
          <div className="space-y-4">
            {mockCities.slice(0, 4).map((city) => (
              <div key={city.id} className="flex items-center space-x-4 p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-all duration-200 cursor-pointer">
                <img
                  src={city.imageUrl}
                  alt={city.name}
                  className="h-12 w-12 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-white">{city.name}</h3>
                  <p className="text-sm text-slate-400">{city.country}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 w-2 rounded-full ${
                          i < Math.floor(city.popularity / 20) ? 'bg-yellow-400' : 'bg-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">${city.averageDailyCost}/day</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;