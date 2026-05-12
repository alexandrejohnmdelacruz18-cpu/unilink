// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Globe } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // If Supabase is still figuring out if the user is logged in, show a clean loading state
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f4ff', color: '#4f6cff' }}>
        <Globe size={40} className="spin-animation" style={{ marginBottom: '10px' }} />
        <p style={{ fontWeight: '600' }}>Verifying session...</p>
      </div>
    );
  }

  // If the loading is done and there is NO user, kick them to the login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If they are authenticated, render the page they were trying to visit!
  return children;
};

export default ProtectedRoute;