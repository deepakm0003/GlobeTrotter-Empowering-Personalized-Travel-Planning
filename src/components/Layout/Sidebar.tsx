import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Map, 
  PlusCircle, 
  Calendar, 
  DollarSign, 
  Share2, 
  User,
  Globe,
  Activity
} from 'lucide-react';

const sidebarItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: Map, label: 'My Trips', path: '/trips' },
  { icon: PlusCircle, label: 'Create Trip', path: '/trips/create' },
  { icon: Calendar, label: 'Calendar', path: '/calendar' },
  { icon: DollarSign, label: 'Budget', path: '/budget' },
  { icon: Activity, label: 'Activities', path: '/activity-search' },
  { icon: Share2, label: 'Shared Trips', path: '/shared' },
  { icon: User, label: 'Profile', path: '/profile' },
];

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-800/90 backdrop-blur-lg border-r border-slate-700/50 transform lg:translate-x-0 transition-transform duration-200 ease-in-out">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center space-x-2 p-6 border-b border-slate-700/50">
          <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Globe className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">GlobeTrotter</h1>
            <p className="text-xs text-slate-400">Plan. Explore. Experience.</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-white'}`} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/50">
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-600/10 border border-blue-500/20 rounded-lg p-4">
            <h3 className="text-sm font-medium text-white mb-2">Upgrade to Pro</h3>
            <p className="text-xs text-slate-400 mb-3">Unlock unlimited trips and premium features</p>
            <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-medium py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-200">
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;