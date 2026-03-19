import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children, requiredRole }) => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);

    const oauthError = params.get('error');
    const oauthToken = params.get('token');
    const oauthRole = params.get('role');

    if (oauthError) {
        return <Navigate to={`/login?error=${encodeURIComponent(oauthError)}`} replace />;
    }

    // Support OAuth callback params on protected routes (e.g. /owner/dashboard?token=...)
    if (oauthToken && oauthRole) {
        localStorage.setItem('token', oauthToken);
        localStorage.setItem('role', oauthRole);
        localStorage.setItem('email', params.get('email') || '');
        localStorage.setItem('userId', params.get('userId') || '');
        localStorage.setItem('fullName', params.get('fullName') || '');

        const storeId = params.get('storeId');
        if (storeId && storeId !== 'null') {
            localStorage.setItem('storeId', storeId);
        } else {
            localStorage.removeItem('storeId');
        }

        // Keep the oauth session by default (same behavior as Login.jsx OAuth flow).
        localStorage.setItem('rememberMe', 'true');

        // Remove sensitive query params from URL after storing.
        return <Navigate to={location.pathname} replace />;
    }

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
