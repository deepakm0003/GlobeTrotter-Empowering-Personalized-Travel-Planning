import React, { useState } from 'react';
import { Calendar, Camera, MapPin, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast';

const CreateTrip: React.FC = () => {
  const navigate = useNavigate();
  const { bumpRefresh, user } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    budget: '',
    city: '',
    country: '',
    coverPhoto:
      'https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg?auto=compress&cs=tinysrgb&w=800',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast.error('Please log in to create a trip');
      return;
    }

    if (
      !formData.name ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.city ||
      !formData.country
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description || '',
      coverPhoto: formData.coverPhoto,
      startDate: formData.startDate, // YYYY-MM-DD from <input type="date" />
      endDate: formData.endDate,
      destinationCity: formData.city,
      destinationCountry: formData.country,
      totalBudget: Number(formData.budget || 0),
      estimatedCost: 0,
      userId: user.id, // Include user ID
    };

    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `Create failed (HTTP ${res.status})`);
      }

      toast.success('Trip created successfully!');
      bumpRefresh();          // 🔔 tell Dashboard to refetch
      navigate('/dashboard'); // or '/trips' if you prefer
    } catch (err: any) {
      toast.error(err.message || 'Failed to create trip');
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Create New Trip</h1>
        <p className="text-slate-400">
          Start planning your next adventure by providing some basic details.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Trip Details */}
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <MapPin className="h-5 w-5 text-blue-400 mr-2" />
            Trip Details
          </h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-200 mb-2">
                Trip Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., European Summer Adventure"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-slate-200 mb-2">
                  Destination City *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Paris"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-slate-200 mb-2">
                  Destination Country *
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  required
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="France"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-200 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your trip and what makes it special..."
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Dates & Budget */}
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <Calendar className="h-5 w-5 text-purple-400 mr-2" />
            Dates & Budget
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-slate-200 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                required
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-slate-200 mb-2">
                End Date *
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                required
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-slate-200 mb-2">
              Estimated Budget (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">$</span>
              <input
                type="number"
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                placeholder="0"
                className="w-full pl-8 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Cover Photo */}
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <Camera className="h-5 w-5 text-green-400 mr-2" />
            Cover Photo (Optional)
          </h2>
          <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
            <Camera className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-400 mb-2">Add a cover photo to make your trip stand out</p>
            <button type="button" className="text-blue-400 hover:text-blue-300 font-medium">
              Choose from gallery
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-700/50">
          <button
            type="button"
            onClick={() => navigate('/trips')}
            className="px-6 py-3 text-slate-300 hover:text-white transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
          >
            <span>Create Trip</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTrip;
