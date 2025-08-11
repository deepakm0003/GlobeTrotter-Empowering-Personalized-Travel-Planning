import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Globe, ArrowRight, Sparkles, Shield, Zap, Camera } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast';

const SignupForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState({ name: false, email: false, password: false, confirmPassword: false });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const { setUser } = useApp();
  const navigate = useNavigate();

  // Animated background particles
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, size: number, speed: number}>>([]);

  useEffect(() => {
    // Generate floating particles
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 0.5 + 0.1
    }));
    setParticles(newParticles);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    
    try {
      let avatarUrl = '';
      
      // Upload profile image if selected
      if (profileImage) {
        const formData = new FormData();
        formData.append('image', profileImage);
        
        const uploadRes = await fetch('/api/auth/upload-profile-image', {
          method: 'POST',
          body: formData,
        });
        
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          avatarUrl = uploadData.imageUrl;
        }
      }

      // Create user account
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: 'Signup failed' }));
        throw new Error(error);
      }
      
      const data = await res.json();
      
      // Update user avatar if image was uploaded
      if (avatarUrl) {
        await fetch('/api/auth/update-profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name, 
            email, 
            avatar: avatarUrl,
            preferences: { currency: 'USD', language: 'en', notifications: true }
          }),
        });
      }
      
      setUser(data.user);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    toast.success('Google sign-up coming soon!');
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10" />
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDuration: `${particle.speed}s`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Header with Animation */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="relative group">
                <div className="h-20 w-20 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl animate-pulse group-hover:scale-110 transition-transform duration-300">
                  <Globe className="h-10 w-10 text-white group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <div className="absolute -top-2 -right-2 h-6 w-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Join GlobeTrotter
            </h1>
            <p className="text-slate-300 text-lg">
              Start your adventure today
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl hover:shadow-blue-500/10 transition-all duration-500">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Profile Image Upload */}
              <div className="flex justify-center mb-6">
                <div className="relative group cursor-pointer">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 p-0.5">
                    <div className="h-full w-full rounded-full bg-slate-800/30 flex items-center justify-center overflow-hidden">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-8 w-8 text-slate-400" />
                      )}
                    </div>
                  </div>
                  <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Name Field with Floating Placeholder */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300">
                  <User className={`h-5 w-5 transition-all duration-300 ${isFocused.name ? 'text-blue-400 scale-110' : 'text-slate-400'}`} />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setIsFocused({ ...isFocused, name: true })}
                  onBlur={() => setIsFocused({ ...isFocused, name: false })}
                  className="w-full pl-12 pr-4 py-4 bg-slate-800/30 border border-slate-600/30 rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 backdrop-blur-sm peer group-hover:border-slate-500/50"
                  placeholder="Enter your name"
                />
                <label 
                  htmlFor="name" 
                  className={`absolute left-12 top-4 text-slate-400 transition-all duration-300 pointer-events-none peer-focus:text-blue-400 peer-focus:text-sm peer-focus:-translate-y-6 peer-focus:translate-x-0 peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:translate-x-0 ${isFocused.name ? 'text-blue-400 text-sm -translate-y-6 translate-x-0' : ''}`}
                >
                  Full Name
                </label>
              </div>

              {/* Email Field with Floating Placeholder */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300">
                  <Mail className={`h-5 w-5 transition-all duration-300 ${isFocused.email ? 'text-blue-400 scale-110' : 'text-slate-400'}`} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsFocused({ ...isFocused, email: true })}
                  onBlur={() => setIsFocused({ ...isFocused, email: false })}
                  className="w-full pl-12 pr-4 py-4 bg-slate-800/30 border border-slate-600/30 rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 backdrop-blur-sm peer group-hover:border-slate-500/50"
                  placeholder="Enter your email"
                />
                <label 
                  htmlFor="email" 
                  className={`absolute left-12 top-4 text-slate-400 transition-all duration-300 pointer-events-none peer-focus:text-blue-400 peer-focus:text-sm peer-focus:-translate-y-6 peer-focus:translate-x-0 peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:translate-x-0 ${isFocused.email ? 'text-blue-400 text-sm -translate-y-6 translate-x-0' : ''}`}
                >
                  Email Address
                </label>
              </div>

              {/* Password Field with Floating Placeholder */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300">
                  <Lock className={`h-5 w-5 transition-all duration-300 ${isFocused.password ? 'text-blue-400 scale-110' : 'text-slate-400'}`} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsFocused({ ...isFocused, password: true })}
                  onBlur={() => setIsFocused({ ...isFocused, password: false })}
                  className="w-full pl-12 pr-12 py-4 bg-slate-800/30 border border-slate-600/30 rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 backdrop-blur-sm peer group-hover:border-slate-500/50"
                  placeholder="Enter your password"
                />
                <label 
                  htmlFor="password" 
                  className={`absolute left-12 top-4 text-slate-400 transition-all duration-300 pointer-events-none peer-focus:text-blue-400 peer-focus:text-sm peer-focus:-translate-y-6 peer-focus:translate-x-0 peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:translate-x-0 ${isFocused.password ? 'text-blue-400 text-sm -translate-y-6 translate-x-0' : ''}`}
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-all duration-200 hover:scale-110"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Confirm Password Field with Floating Placeholder */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300">
                  <Lock className={`h-5 w-5 transition-all duration-300 ${isFocused.confirmPassword ? 'text-blue-400 scale-110' : 'text-slate-400'}`} />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setIsFocused({ ...isFocused, confirmPassword: true })}
                  onBlur={() => setIsFocused({ ...isFocused, confirmPassword: false })}
                  className="w-full pl-12 pr-12 py-4 bg-slate-800/30 border border-slate-600/30 rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 backdrop-blur-sm peer group-hover:border-slate-500/50"
                  placeholder="Confirm your password"
                />
                <label 
                  htmlFor="confirmPassword" 
                  className={`absolute left-12 top-4 text-slate-400 transition-all duration-300 pointer-events-none peer-focus:text-blue-400 peer-focus:text-sm peer-focus:-translate-y-6 peer-focus:translate-x-0 peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:translate-x-0 ${isFocused.confirmPassword ? 'text-blue-400 text-sm -translate-y-6 translate-x-0' : ''}`}
                >
                  Confirm Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-all duration-200 hover:scale-110"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Animated Neon Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 hover:from-blue-600 hover:via-purple-700 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 overflow-hidden"
              >
                {/* Neon glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
                
                {isLoading ? (
                  <div className="flex items-center relative z-10">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Creating account...
                  </div>
                ) : (
                  <div className="flex items-center relative z-10">
                    <span>Create Account</span>
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-8 mb-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-600/30" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-slate-900/50 text-slate-400">Or continue with</span>
                </div>
              </div>
            </div>

            {/* Google Sign-up Button */}
            <button 
              onClick={handleGoogleSignUp}
              className="w-full flex items-center justify-center px-4 py-3 border border-slate-600/30 rounded-xl text-slate-300 hover:bg-slate-800/30 transition-all duration-200 group hover:scale-105 hover:border-slate-500/50"
            >
              <div className="w-5 h-5 bg-gradient-to-r from-red-500 to-yellow-500 rounded mr-3 group-hover:scale-110 transition-transform duration-200"></div>
              <span className="text-sm font-medium group-hover:text-white transition-colors duration-200">Sign up with Google</span>
            </button>
          </div>

          {/* Sign In Link */}
          <div className="text-center mt-8">
            <p className="text-slate-400">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="font-semibold text-blue-400 hover:text-blue-300 transition-all duration-200 flex items-center justify-center group hover:scale-105"
              >
                Sign in
                <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </p>
          </div>

          {/* Features */}
          <div className="mt-12 grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="h-10 w-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors duration-200">Secure</p>
            </div>
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors duration-200">Fast</p>
            </div>
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="h-10 w-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors duration-200">Modern</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;