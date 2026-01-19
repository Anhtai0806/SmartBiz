import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, requiredRole }) => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    // Check if user is authenticated
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Check if user has required role
    if (requiredRole && userRole !== requiredRole) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                flexDirection: 'column',
                gap: '20px'
            }}>
                <h1>Access Denied</h1>
                <p>You do not have permission to access this page.</p>
                <button onClick={() => window.location.href = '/'}>Go Home</button>
            </div>
        );
    }

    return children;
};

export default PrivateRoute;
