import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import AIMatches from './pages/AIMatches';
import Products from './pages/Products';
import Requests from './pages/Requests';
import Negotiations from './pages/Negotiations';
import NegotiationChat from './pages/NegotiationChat';
import CompanyProfile from './pages/CompanyProfile';
import Profile from './pages/Profile';
import Analytics from './pages/Analytics';

function PrivateRoute({ children }) {
  const { company, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full" />
    </div>
  );
  return company ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { company } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={company ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={company ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/" element={<Navigate to={company ? '/dashboard' : '/login'} />} />
      <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
      <Route path="/marketplace" element={<PrivateRoute><Layout><Marketplace /></Layout></PrivateRoute>} />
      <Route path="/matches" element={<PrivateRoute><Layout><AIMatches /></Layout></PrivateRoute>} />
      <Route path="/products" element={<PrivateRoute><Layout><Products /></Layout></PrivateRoute>} />
      <Route path="/requests" element={<PrivateRoute><Layout><Requests /></Layout></PrivateRoute>} />
      <Route path="/negotiations" element={<PrivateRoute><Layout><Negotiations /></Layout></PrivateRoute>} />
      <Route path="/negotiations/:id" element={<PrivateRoute><Layout><NegotiationChat /></Layout></PrivateRoute>} />
      <Route path="/company/:id" element={<PrivateRoute><Layout><CompanyProfile /></Layout></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Layout><Profile /></Layout></PrivateRoute>} />
      <Route path="/analytics" element={<PrivateRoute><Layout><Analytics /></Layout></PrivateRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
