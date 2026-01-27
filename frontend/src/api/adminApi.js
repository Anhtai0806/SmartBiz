const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Get auth token from localStorage
const getAuthToken = () => {
    return localStorage.getItem('token');
};

// Create headers with auth token
const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

// Get all users
export const getAllUsers = async () => {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        throw new Error('Failed to fetch users');
    }

    return response.json();
};

// Update user status (lock/unlock)
export const updateUserStatus = async (userId, status) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update user status');
    }

    return response.json();
};

// Delete user
export const deleteUser = async (userId) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        throw new Error('Failed to delete user');
    }

    return response.text();
};

// Get all stores
export const getAllStores = async () => {
    const response = await fetch(`${API_BASE_URL}/admin/stores`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        throw new Error('Failed to fetch stores');
    }

    return response.json();
};

// Get store by ID
export const getStoreById = async (storeId) => {
    const response = await fetch(`${API_BASE_URL}/admin/stores/${storeId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        throw new Error('Failed to fetch store details');
    }

    return response.json();
};

// Get dashboard statistics
export const getDashboardStats = async () => {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        throw new Error('Failed to fetch dashboard statistics');
    }

    return response.json();
};

// Get stores owned by a specific business owner
export const getStoresByOwnerId = async (userId) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/stores`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        throw new Error('Failed to fetch stores for business owner');
    }

    return response.json();
};

