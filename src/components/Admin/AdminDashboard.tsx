import React from 'react';
import { Users, MapPin, Activity, TrendingUp, Calendar, DollarSign, Globe, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard: React.FC = () => {
  // Mock admin data
  const stats = [
    { label: 'Total Users', value: '12,543', icon: Users, color: 'from-blue-500 to-cyan-500', change: '+12%' },
    { label: 'Total Trips', value: '8,921', icon: MapPin, color: 'from-purple-500 to-pink-500', change: '+8%' },
    { label: 'Active Users', value: '3,456', icon: Activity, color: 'from-green-500 to-emerald-500', change: '+15%' },
    { label: 'Revenue', value: '$45,678', icon: DollarSign, color: 'from-orange-500 to-red-500', change: '+23%' },
  ];

  const monthlyUsers = [
    { month: 'Jan', users: 1200 },
    { month: 'Feb', users: 1400 },
    { month: 'Mar', users: 1800 },
    { month: 'Apr', users: 2200 },
    { month: 'May', users: 2800 },
    { month: 'Jun', users: 3200 },
  ];

  const tripsByRegion = [
    { name: 'Europe', value: 35, color: '#3B82F6' },
    { name: 'Asia', value: 28, color: '#8B5CF6' },
    { name: 'North America', value: 20, color: '#10B981' },
    { name: 'South America', value: 10, color: '#F59E0B' },
    { name: 'Africa', value: 4, color: '#EF4444' },
    { name: 'Oceania', value: 3, color: '#6B7280' },
  ];

  const popularCities = [
    { name: 'Paris', trips: 1234, growth: '+12%' },
    { name: 'Tokyo', trips: 987, growth: '+8%' },
    { name: 'New York', trips: 876, growth: '+15%' },
    { name: 'London', trips: 765, growth: '+5%' },
    { name: 'Bali', trips: 654, growth: '+22%' },
  ];

  const recentUsers = [
    { name: 'Sarah Johnson', email: 'sarah@example.com', joined: '2 hours ago', trips: 3 },
    { name: 'Mike Chen', email: 'mike@example.com', joined: '5 hours ago', trips: 1 },
    { name: 'Emma Wilson', email: 'emma@example.com', joined: '1 day ago', trips: 2 },
    { name: 'David Brown', email: 'david@example.com', joined: '2 days ago', trips: 4 },
    { name: 'Lisa Garcia', email: 'lisa@example.com', joined: '3 days ago', trips: 1 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-slate-400 mt-1">Monitor platform performance and user activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">User Growth</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyUsers}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trips by Region */}
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Trips by Region</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tripsByRegion}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {tripsByRegion.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            {tripsByRegion.map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <div className="flex-1">
                  <p className="text-sm text-white">{item.name}</p>
                  <p className="text-xs text-slate-400">{item.value}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Cities */}
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Popular Destinations</h2>
          <div className="space-y-4">
            {popularCities.map((city, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-white">{city.name}</p>
                    <p className="text-sm text-slate-400">{city.trips} trips</p>
                  </div>
                </div>
                <span className="text-sm text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
                  {city.growth}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Recent Users</h2>
          <div className="space-y-4">
            {recentUsers.map((user, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{user.name}</p>
                    <p className="text-sm text-slate-400">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white">{user.trips} trips</p>
                  <p className="text-xs text-slate-400">{user.joined}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">System Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="h-16 w-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Activity className="h-8 w-8 text-white" />
            </div>
            <p className="text-2xl font-bold text-green-400">99.9%</p>
            <p className="text-slate-400">Uptime</p>
          </div>
          <div className="text-center">
            <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <p className="text-2xl font-bold text-blue-400">1.2s</p>
            <p className="text-slate-400">Avg Response</p>
          </div>
          <div className="text-center">
            <div className="h-16 w-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <p className="text-2xl font-bold text-purple-400">2.1GB</p>
            <p className="text-slate-400">Data Usage</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;