import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, DollarSign, Loader2, Camera, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast';

const CreateTrip = () => {
  const navigate = useNavigate();
  const { user, setTrips } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    destinationCity: '',
    destinationCountry: '',
    totalBudget: '',
    estimatedCost: ''
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadTripImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/trips/upload-photo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error('Error uploading trip image:', error);
      // If upload fails, create a local URL for preview
      return URL.createObjectURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.startDate || !formData.endDate || !formData.destinationCity || !formData.destinationCountry) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!user) {
      toast.error('User not found. Please log in again.');
      return;
    }

    setIsLoading(true);

    try {
      // First upload image if selected
      let imageUrl = '';
      if (selectedImage) {
        imageUrl = await uploadTripImage(selectedImage);
        console.log('Trip image uploaded successfully:', imageUrl);
      }

      // Create trip with image URL and user ID
      const tripData = {
        ...formData,
        coverPhoto: imageUrl,
        totalBudget: parseFloat(formData.totalBudget) || 0,
        estimatedCost: parseFloat(formData.estimatedCost) || 0,
        userId: user.id // Add user ID to the request body
      };

      console.log('Creating trip with data:', tripData);

      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id // Also add user ID in header
        },
        body: JSON.stringify(tripData),
      });

      if (response.ok) {
        const newTrip = await response.json();
        setTrips(prev => [...prev, newTrip]);
        toast.success('Trip created successfully!');
        navigate('/trips');
      } else {
        const errorData = await response.json();
        console.error('Trip creation error:', errorData);
        toast.error(errorData.error || 'Failed to create trip');
      }
    } catch (error) {
      console.error('Error creating trip:', error);
      toast.error('Failed to create trip. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/trips')}
          className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">Create New Trip</h1>
          <p className="text-slate-400 mt-1">Plan your next adventure</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Trip Details */}
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Trip Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Trip Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white mb-2">
                Trip Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter trip name"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your trip"
                rows={3}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Trip Image */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white mb-2">
                Trip Cover Image
              </label>
              <div className="space-y-4">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Trip preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-slate-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <Camera className="h-8 w-8 text-slate-400" />
                      <span className="text-slate-400">Click to upload trip image</span>
                      <span className="text-sm text-slate-500">PNG, JPG up to 5MB</span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Start Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                End Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Destination City */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Destination City *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="destinationCity"
                  value={formData.destinationCity}
                  onChange={handleInputChange}
                  placeholder="City name"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Destination Country */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Destination Country *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="destinationCountry"
                  value={formData.destinationCountry}
                  onChange={handleInputChange}
                  placeholder="Country name"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Total Budget */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Total Budget
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="totalBudget"
                  value={formData.totalBudget}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Estimated Cost */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Estimated Cost
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="estimatedCost"
                  value={formData.estimatedCost}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Creating Trip...</span>
            </>
          ) : (
            <span>Create Trip</span>
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateTrip;
