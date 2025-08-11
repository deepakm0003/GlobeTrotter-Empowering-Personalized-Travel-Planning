import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast';
import { User, Mail, Globe, Bell, Shield, Camera, Save, MapPin, Calendar, DollarSign, Trash2, Settings, Languages, Heart, Eye, EyeOff, Lock } from 'lucide-react';

const UserProfile = () => {
  const { user, setUser, trips } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '', 
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    currency: user?.preferences?.currency || 'USD',
    language: user?.preferences?.language || 'en',
    notifications: user?.preferences?.notifications || true,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      let avatarUrl = user.avatar;

      // Upload profile image if selected
      if (profileImage) {
        const formDataImage = new FormData();
        formDataImage.append('profileImage', profileImage);

        const uploadRes = await fetch('/api/auth/upload-profile-image', {
          method: 'POST',
          body: formDataImage,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          avatarUrl = uploadData.imageUrl;
        } else {
          toast.error('Failed to upload profile image');
          setIsLoading(false);
          return;
        }
      }

      // Update user profile with all form data
      const updateRes = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: formData.name,
          email: formData.email,
          avatar: avatarUrl,
          preferences: {
            currency: formData.currency,
            language: formData.language,
            notifications: formData.notifications,
          },
        }),
      });

      if (updateRes.ok) {
        const updateData = await updateRes.json();
        setUser(updateData.user);
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        setProfileImage(null);
        setImagePreview(null);
      } else {
        const errorData = await updateRes.json();
        toast.error(errorData.error || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      if (res.ok) {
        toast.success('Password changed successfully!');
        setShowPasswordModal(false);
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'Failed to change password');
      }
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm account deletion');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      if (res.ok) {
        toast.success('Account deleted successfully');
        setShowDeleteConfirm(false);
        setDeleteConfirmText('');
        // Redirect to logout or home page
        window.location.href = '/';
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'Failed to delete account');
      }
    } catch (error) {
      toast.error('Failed to delete account');
    } finally {
      setIsLoading(false);
    }
  };

  const totalTrips = trips.length;
  const totalCities = trips.reduce((sum, trip) => sum + (trip.stops?.length || 0), 0);
  const totalSpent = trips.reduce((sum, trip) => sum + (trip.estimatedCost || 0), 0);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-white" />
          </div>
          <p className="text-slate-400">Please log in to view your profile</p>
        </div>
      </div>
    );
  }

  const hasTrips = totalTrips > 0;

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
                    onClick={() => {
                      setIsEditing(false);
                      setProfileImage(null);
                      setImagePreview(null);
                      setFormData({
                        name: user.name,
                        email: user.email,
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                        currency: user.preferences?.currency || 'USD',
                        language: user.preferences?.language || 'en',
                        notifications: user.preferences?.notifications || true,
                      });
                    }}
                    className="bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    <span>{isLoading ? 'Saving...' : 'Save'}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-start space-x-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-blue-500/20">
                  <img
                    src={imagePreview || user.avatar || `https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                {isEditing && (
                  <label
                    htmlFor="profile-image-edit"
                    className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 cursor-pointer hover:bg-blue-600 transition-colors"
                  >
                    <Camera className="h-4 w-4" />
                  </label>
                )}
                {isEditing && (
                  <input
                    id="profile-image-edit"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
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
                  <Languages className="h-4 w-4 inline mr-2" />
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
              <button 
                onClick={() => setShowPasswordModal(true)}
                className="w-full text-left p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-all duration-200"
              >
                <h3 className="font-medium text-white mb-1">Change Password</h3>
                <p className="text-sm text-slate-400">Update your password to keep your account secure</p>
              </button>
              
              <div className="p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-all duration-200">
                <h3 className="font-medium text-white mb-1">Two-Factor Authentication</h3>
                <p className="text-sm text-slate-400">Add an extra layer of security to your account</p>
              </div>
              
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full text-left p-4 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all duration-200"
              >
                <h3 className="font-medium text-red-400 mb-1">Delete Account</h3>
                <p className="text-sm text-red-300">Permanently delete your account and all data</p>
              </button>
            </div>
          </div>

          {/* Saved Destinations */}
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">
              <Heart className="h-5 w-5 inline mr-2" />
              Saved Destinations
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trips.slice(0, 4).map((trip) => (
                <div key={trip.id} className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{trip.name}</p>
                    <p className="text-xs text-slate-400">
                      {trip.stops.length > 0 
                        ? `${trip.stops[0].city.name}, ${trip.stops[0].city.country}`
                        : 'No destinations set'
                      }
                    </p>
                  </div>
                </div>
              ))}
              
              {trips.length === 0 && (
                <div className="col-span-2 text-center py-8">
                  <Heart className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No saved destinations yet</p>
                  <p className="text-sm text-slate-500">Start planning trips to see them here</p>
                </div>
              )}
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
                <p className="text-sm text-slate-400">{hasTrips ? 'Total Trips' : 'Start Planning!'}</p>
              </div>
              
              <div className="text-center">
                <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">{totalCities}</p>
                <p className="text-sm text-slate-400">{hasTrips ? 'Cities Visited' : 'Explore the World'}</p>
              </div>
              
              <div className="text-center">
                <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">${totalSpent.toLocaleString()}</p>
                <p className="text-sm text-slate-400">{hasTrips ? 'Total Spent' : 'Budget Your Adventures'}</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Recent Activity</h3>
            
            <div className="space-y-4">
              {hasTrips ? (
                trips.slice(0, 3).map((trip) => (
                  <div key={trip.id} className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg">
                    <Calendar className="h-4 w-4 text-blue-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{trip.name}</p>
                      <p className="text-xs text-slate-400">Created {trip.createdAt}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-slate-400 text-sm mb-2">No recent activity</p>
                  <p className="text-slate-500 text-xs">Create your first trip to see activity here</p>
                </div>
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

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Lock className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Change Password</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter new password"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setFormData(prev => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  }));
                }}
                className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 bg-red-500/20 rounded-full flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Delete Account</h3>
            </div>
            <p className="text-slate-300 mb-4">
              This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
            </p>
            <p className="text-slate-400 text-sm mb-4">
              To confirm, please type <span className="text-red-400 font-mono">DELETE</span> in the box below:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 mb-6"
              placeholder="Type DELETE to confirm"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                }}
                className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || isLoading}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;