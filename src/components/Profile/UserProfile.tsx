import React, { useState } from 'react';
import { User, Mail, Globe, Bell, Shield, Camera, Save, MapPin, Calendar, DollarSign } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast';

const UserProfile: React.FC = () => {
  const { user, setUser, trips } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currency: user?.preferences?.currency || 'USD',
    language: user?.preferences?.language || 'en',
    notifications: user?.preferences?.notifications || true,
  });

  const handleSave = () => {
    if (!user) return;

    const updatedUser = {
      ...user,
      name: formData.name,
      email: formData.email,
      preferences: {
        ...user.preferences,
        currency: formData.currency,
        language: formData.language,
        notifications: formData.notifications,
      },
    };

    setUser(updatedUser);
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const totalTrips = trips.length;
  const totalCities = trips.reduce((sum, trip) => sum + trip.stops.length, 0);
  const totalSpent = trips.reduce((sum, trip) => sum + trip.estimatedCost, 0);

  if (!user) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-medium text-white mb-4">Please log in to view your profile</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
        <p className="text-slate-400 mt-1">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Basic Information</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-all duration-200"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-all duration-200 flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-start space-x-6">
              {/* Avatar */}
              <div className="relative">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-24 w-24 rounded-full object-cover ring-4 ring-blue-500/20"
                  />
                ) : (
                  <div className="h-24 w-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="h-12 w-12 text-white" />
                  </div>
                )}
                {isEditing && (
                  <button className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-all duration-200">
                    <Camera className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Form Fields */}
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-white">{user.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-white">{user.email}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Preferences</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  <Globe className="h-4 w-4 inline mr-2" />
                  Currency
                </label>
                {isEditing ? (
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                  </select>
                ) : (
                  <p className="text-white">{formData.currency}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Language
                </label>
                {isEditing ? (
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="it">Italian</option>
                  </select>
                ) : (
                  <p className="text-white">
                    {formData.language === 'en' ? 'English' : formData.language}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="flex items-center">
                {isEditing ? (
                  <input
                    type="checkbox"
                    name="notifications"
                    checked={formData.notifications}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-600 rounded bg-slate-800"
                  />
                ) : (
                  <div className={`h-4 w-4 rounded ${formData.notifications ? 'bg-blue-500' : 'bg-slate-600'}`} />
                )}
                <span className="ml-3 text-slate-200">
                  <Bell className="h-4 w-4 inline mr-2" />
                  Email notifications
                </span>
              </label>
            </div>
          </div>

          {/* Security */}
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">
              <Shield className="h-5 w-5 inline mr-2" />
              Security
            </h2>
            
            <div className="space-y-4">
              <button className="w-full text-left p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-all duration-200">
                <h3 className="font-medium text-white mb-1">Change Password</h3>
                <p className="text-sm text-slate-400">Update your password to keep your account secure</p>
              </button>
              
              <button className="w-full text-left p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-all duration-200">
                <h3 className="font-medium text-white mb-1">Two-Factor Authentication</h3>
                <p className="text-sm text-slate-400">Add an extra layer of security to your account</p>
              </button>
              
              <button className="w-full text-left p-4 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all duration-200">
                <h3 className="font-medium text-red-400 mb-1">Delete Account</h3>
                <p className="text-sm text-red-300">Permanently delete your account and all data</p>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* Travel Stats */}
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Travel Stats</h3>
            
            <div className="space-y-6">
              <div className="text-center">
                <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">{totalTrips}</p>
                <p className="text-sm text-slate-400">Total Trips</p>
              </div>
              
              <div className="text-center">
                <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">{totalCities}</p>
                <p className="text-sm text-slate-400">Cities Visited</p>
              </div>
              
              <div className="text-center">
                <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">${totalSpent}</p>
                <p className="text-sm text-slate-400">Total Spent</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Recent Activity</h3>
            
            <div className="space-y-4">
              {trips.slice(0, 3).map((trip) => (
                <div key={trip.id} className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg">
                  <Calendar className="h-4 w-4 text-blue-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{trip.name}</p>
                    <p className="text-xs text-slate-400">Created {trip.createdAt}</p>
                  </div>
                </div>
              ))}
              
              {trips.length === 0 && (
                <p className="text-slate-400 text-sm">No recent activity</p>
              )}
            </div>
          </div>

          {/* Account Status */}
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-600/10 border border-blue-500/20 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Account Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Plan</span>
                <span className="text-blue-400 font-medium">Free</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Member since</span>
                <span className="text-white">Jan 2025</span>
              </div>
            </div>
            <button className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200">
              Upgrade to Pro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;