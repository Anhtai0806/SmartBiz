import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
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
              <main className="main-content">
                <Index />
              </main>
              <Footer />
            </>
          } />
          <Route path="/login" element={
            <>
              <Navbar />
              <main className="main-content">
                <Login />
              </main>
              <Footer />
            </>
          } />
          <Route path="/register" element={
            <>
              <Navbar />
              <main className="main-content">
                <Register />
              </main>
              <Footer />
            </>
          } />

          {/* Admin routes - protected */}
          <Route path="/admin/*" element={
            <PrivateRoute requiredRole="ADMIN">
              <AdminDashboard />
            </PrivateRoute>
          } />

          {/* Placeholder routes for other roles */}
          <Route path="/owner/dashboard" element={
            <PrivateRoute requiredRole="BUSINESS_OWNER">
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <h1>Business Owner Dashboard</h1>
                <p>Coming soon...</p>
              </div>
            </PrivateRoute>
          } />
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
