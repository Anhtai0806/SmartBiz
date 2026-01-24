import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import BusinessOwnerDashboard from './pages/owner/BusinessOwnerDashboard';
import CashierDashboard from './pages/cashier/CashierDashboard';
import './App.css';

function App() {
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
            <>
              <Navbar />
              <Login />
              <Footer />
            </>
          } />
          <Route path="/register" element={
            <>
              <Navbar />
              <Register />
              <Footer />
            </>
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
              <BusinessOwnerDashboard />
            </PrivateRoute>
          } />

          {/* Cashier routes - protected */}
          <Route path="/cashier/*" element={
            <PrivateRoute requiredRole="CASHIER">
              <CashierDashboard />
            </PrivateRoute>
          } />

          {/* Staff routes - placeholder */}
          <Route path="/staff/dashboard" element={
            <PrivateRoute>
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <h1>Staff Dashboard</h1>
                <p>Coming soon...</p>
              </div>
            </PrivateRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
