import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is not authenticated
    if (!user) {
      // Check if there's a token in localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        // No token, redirect to login
        navigate('/login', { replace: true });
        return;
      }
      
      // There's a token but no user in context, try to verify it
      const verifyToken = async () => {
        try {
          const response = await fetch('/api/auth/verify-token', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            // Token is invalid, remove it and redirect to login
            localStorage.removeItem('token');
            navigate('/login', { replace: true });
          }
        } catch (error) {
          console.error('Token verification error:', error);
          localStorage.removeItem('token');
          navigate('/login', { replace: true });
        }
      };

      verifyToken();
    }
  }, [user, navigate]);

  // Show loading while checking authentication
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
