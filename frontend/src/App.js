import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterOtpVerify from './pages/RegisterOtpVerify';
import AdminDashboard from './pages/admin/AdminDashboard';
import BusinessOwnerHeader from './pages/owner/BusinessOwnerHeader';
import CashierDashboard from './pages/cashier/CashierDashboard';
import StaffDashboard from './pages/staff/StaffDashboard';
import KitchenDashboard from './pages/kitchen/KitchenDashboard';
import './App.css';
import './responsive.css';

function App() {
  useEffect(() => {
    // Check if it's a new session
    if (!sessionStorage.getItem('sessionActive')) {
      const rememberMe = localStorage.getItem('rememberMe');
      if (rememberMe !== 'true') {
        // Clear auth data on new session if not remembered
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('email');
        localStorage.removeItem('userId');
        localStorage.removeItem('fullName');
        localStorage.removeItem('storeName');
        localStorage.removeItem('storeId');
        localStorage.removeItem('onboardingCompleted');
        localStorage.removeItem('rememberMe');
      }
      // Mark session as active
      sessionStorage.setItem('sessionActive', 'true');
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes with Navbar and Footer */}
          <Route path="/" element={
            <>
              <Navbar />
              <Index />
              <Footer />
            </>
          } />
          <Route path="/login" element={
            <Login />
          } />
          <Route path="/register" element={
            <Register />
          } />
          <Route path="/register/verify" element={
            <RegisterOtpVerify />
          } />

          {/* Admin routes - protected */}
          <Route path="/admin/*" element={
            <PrivateRoute requiredRole="ADMIN">
              <AdminDashboard />
            </PrivateRoute>
          } />

          {/* Business Owner routes - protected */}
          <Route path="/owner/*" element={
              <PrivateRoute requiredRole="BUSINESS_OWNER">
              <BusinessOwnerHeader />
            </PrivateRoute>
          } />

          {/* Cashier routes - protected */}
          <Route path="/cashier/*" element={
            <PrivateRoute requiredRole="CASHIER">
              <CashierDashboard />
            </PrivateRoute>
          } />

          {/* Staff routes - protected */}
          <Route path="/staff/*" element={
            <PrivateRoute requiredRole="STAFF">
              <StaffDashboard />
            </PrivateRoute>
          } />

          {/* Kitchen routes - protected */}
          <Route path="/kitchen/*" element={
            <PrivateRoute requiredRole="KITCHEN">
              <KitchenDashboard />
            </PrivateRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
