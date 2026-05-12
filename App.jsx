// src/App.jsx
import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';
import { AuthProvider } from './AuthContext';
import Auth from './pages/Auth';
import ProtectedRoute from './components/ProtectedRoute'; // 1. Import the bouncer
import Dashboard from './pages/Dashboard';

// Pages
import Home from './pages/Home';
import Messages from './pages/Messages';
import Post from './pages/Post';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import Quests from './pages/Quests';
import Achievements from './pages/Achievements';
import AccountSettings from './pages/AccountSettings';
import Favorites from './pages/Favorites';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import EditListing from './pages/EditListing';
import TransactionDashboard from './pages/TransactionDashboard';

const AppContent = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const layoutProps = { sidebarCollapsed, onToggleSidebar: () => setSidebarCollapsed(!sidebarCollapsed) };

  return (
    <Routes>
      {/* PUBLIC ROUTE */}
      <Route path="/login" element={<Auth />} />

      {/* PROTECTED ROUTES */}
      <Route path="/" element={<ProtectedRoute><Home {...layoutProps} /></ProtectedRoute>} />
      <Route path="/transactions" element={<ProtectedRoute><TransactionDashboard {...layoutProps} /></ProtectedRoute>} />
      
      {/* ... wrap the rest of your routes in <ProtectedRoute> exactly like above! ... */}
    </Routes>
  );
};

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);
  
  const layoutProps = { sidebarCollapsed, onToggleSidebar: toggleSidebar };

  useEffect(() => {
    if (localStorage.getItem('theme') === 'dark') {
      document.body.classList.add('dark-mode');
    }
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Route - Anyone can see the login page */}
            <Route path="/login" element={<Auth />} />
            
            {/* Protected Routes - Only logged-in students can access these */}
            <Route 
              path="/" 
              element={<ProtectedRoute><Home {...layoutProps} /></ProtectedRoute>} 
            />

            {/* The NEW Dashboard route */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard {...layoutProps} /></ProtectedRoute>} />

            <Route 
              path="/messages" 
              element={<ProtectedRoute><Messages {...layoutProps} /></ProtectedRoute>} 
            />
            <Route 
              path="/post" 
              element={<ProtectedRoute><Post {...layoutProps} /></ProtectedRoute>} 
            />
            <Route 
              path="/post/create" 
              element={<ProtectedRoute><Post createMode={true} {...layoutProps} /></ProtectedRoute>} 
            />
            <Route 
              path="/profile/*" 
              element={<ProtectedRoute><Profile {...layoutProps} /></ProtectedRoute>} 
            />

        <Route path="/profile" element={<ProtectedRoute><Profile {...layoutProps} /></ProtectedRoute>} />
        <Route path="/quests" element={<ProtectedRoute><Quests {...layoutProps} /></ProtectedRoute>} />
        <Route path="/achievements" element={<ProtectedRoute><Achievements {...layoutProps} /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><AccountSettings {...layoutProps} /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><TransactionDashboard {...layoutProps} /></ProtectedRoute>} />

            <Route 
              path="/favorites" 
              element={<ProtectedRoute><Favorites {...layoutProps} /></ProtectedRoute>} /><Route path="/favorites" element={<ProtectedRoute><Favorites {...layoutProps} /></ProtectedRoute>} 
            />

            <Route 
              path="/cart" 
              element={<ProtectedRoute><Cart {...layoutProps} /></ProtectedRoute>} 
            />

            <Route 
              path="/checkout" 
              element={<ProtectedRoute><Checkout {...layoutProps} /></ProtectedRoute>} 
            />

            <Route 
              path="/edit-listing" 
              element={<ProtectedRoute><EditListing {...layoutProps} /></ProtectedRoute>} 
            />

            {/* Catch-all: Redirect unknown URLs to the homepage (which will redirect to login if unauthenticated) */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;