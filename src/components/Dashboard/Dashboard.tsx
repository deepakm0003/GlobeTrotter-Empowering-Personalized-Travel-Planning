import React from 'react';
import { TrendingUp, MapPin, Calendar, DollarSign, Plus, Globe, Plane, User, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { format } from 'date-fns';

// API helper
import { fetchDashboard, type DashboardResponse } from '../../data/mockData';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshKey } = useApp(); // 👈 listen for refresh

  const [data, setData] = React.useState<DashboardResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.id) {
        console.log('No user ID available, skipping dashboard load');
        setData(null);
        return;
      }
      
      console.log('🔄 Loading dashboard for user:', user.id, 'Name:', user.name, 'Email:', user.email);
      const d = await fetchDashboard(user.id);
      console.log('📊 Dashboard data loaded:', d);
      setData(d);
    } catch (e) {
      console.error('Dashboard load error:', e);
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  React.useEffect(() => {
    load();
  }, [load, refreshKey]); // 👈 re-fetch whenever a trip is created

  // Force refresh function
  const handleRefresh = () => {
    console.log('Force refreshing dashboard...');
    load();
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-white" />
          </div>
          <p className="text-slate-400">Please log in to view your dashboard</p>
        </div>
      </div>
    );
  }

  if (loading) return <div className="text-slate-300">Loading dashboard…</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!data) return <div className="text-slate-300">No dashboard data available</div>;

  const stats = [
    {
      label: 'Total Trips',
      value: String(data.stats.totalTrips),
      icon: MapPin,
      color: 'from-blue-500 to-cyan-500',
      change: data.stats.totalTrips > 0 ? '+2 this month' : 'Start planning!',
    },
    {
      label: 'Countries Visited',
      value: String(data.stats.countriesVisited),
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
      change: data.stats.countriesVisited > 0 ? '+3 this year' : 'Explore the world',
    },
    {
      label: 'Upcoming Trips',
      value: String(data.stats.upcomingTrips),
      icon: Calendar,
      color: 'from-green-500 to-emerald-500',
      change: data.stats.nextTripLabel ? `Next: ${data.stats.nextTripLabel}` : 'Plan your next adventure',
    },
    {
      label: 'Total Spent',
      value: `$${data.stats.totalSpent}`,
      icon: DollarSign,
      color: 'from-orange-500 to-red-500',
      change: data.stats.totalSpent > 0 ? 'All time' : 'Budget your trips',
    },
  ];

  const hasTrips = data.stats.totalTrips > 0;

  return (
    <div className="space-y-8">
      {/* User Info Debug Section */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-slate-300">Current User</h3>
            <p className="text-xs text-slate-400">ID: {user?.id}</p>
            <p className="text-xs text-slate-400">Email: {user?.email}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Total Trips: {data?.stats.totalTrips || 0}</p>
            <p className="text-xs text-slate-400">Countries: {data?.stats.countriesVisited || 0}</p>
          </div>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-500/20 rounded-2xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user?.name ?? ''}! 👋
            </h1>
            <p className="text-slate-300">
              {hasTrips 
                ? "Ready to plan your next adventure? Let's explore the world together."
                : "Welcome to GlobeTrotter! Start planning your first adventure and discover amazing destinations."
              }
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="bg-slate-700/50 hover:bg-slate-700/70 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
                         {!hasTrips && (
               <button
                 onClick={() => navigate('/trips/create')}
                 className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
               >
                 <Plus className="h-5 w-5" />
                 <span>Create Your First Trip</span>
               </button>
             )}
          </div>
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
                <span className={`text-xs px-2 py-1 rounded-full ${
                  hasTrips 
                    ? 'text-emerald-400 bg-emerald-400/10' 
                    : 'text-blue-400 bg-blue-400/10'
                }`}>
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
            {hasTrips && (
              <button
                onClick={() => navigate('/trips')}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                View all
              </button>
            )}
          </div>
          
          {hasTrips ? (
            <div className="space-y-4">
              {data.recentTrips.slice(0, 3).map((trip) => (
                <div key={trip.id} className="flex items-center space-x-4 p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-all duration-200 cursor-pointer">
                  <img src={trip.coverPhoto} alt={trip.name} className="h-12 w-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{trip.name}</h3>
                    <p className="text-sm text-slate-400">
                      {format(new Date(trip.startDate), 'MMM d')} - {format(new Date(trip.endDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-400">${trip.estimatedCost}</p>
                    <p className="text-xs text-slate-400">{trip.stopsCount} stops</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Plane className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No trips yet</h3>
              <p className="text-slate-400 mb-6">Start your journey by creating your first trip</p>
                             <button
                 onClick={() => navigate('/trips/create')}
                 className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2 mx-auto"
               >
                 <Plus className="h-4 w-4" />
                 <span>Create Trip</span>
               </button>
            </div>
          )}
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
            {data.popularDestinations.slice(0, 4).map((city) => (
              <div key={city.id} className="flex items-center space-x-4 p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-all duration-200 cursor-pointer">
                <img src={city.imageUrl} alt={city.name} className="h-12 w-12 rounded-lg object-cover" />
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

      {/* Empty State for New Users */}
      {!hasTrips && (
        <div className="bg-gradient-to-br from-blue-500/10 to-purple-600/10 border border-blue-500/20 rounded-2xl p-8 text-center">
          <div className="h-20 w-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Globe className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Start Your Adventure?</h2>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            Create your first trip and discover amazing destinations around the world. 
            Plan your itinerary, set your budget, and start exploring!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
                         <button
               onClick={() => navigate('/trips/create')}
               className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
             >
               <Plus className="h-5 w-5" />
               <span>Create Your First Trip</span>
             </button>
            <button
              onClick={() => navigate('/search')}
              className="bg-slate-700/50 text-white px-8 py-3 rounded-lg font-medium hover:bg-slate-700/70 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <MapPin className="h-5 w-5" />
              <span>Explore Destinations</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
