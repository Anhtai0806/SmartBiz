import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const createAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

// Get all pending orders (NEW and PROCESSING)
export const getPendingOrders = async () => {
    const response = await axios.get(`${API_BASE_URL}/kitchen/orders/pending`, {
        headers: createAuthHeader()
    });
    return response.data;
};

// Mark order as completed
export const completeOrder = async (orderId) => {
    const response = await axios.put(
        `${API_BASE_URL}/kitchen/orders/${orderId}/complete`,
        {},
        { headers: createAuthHeader() }
    );
    return response.data;
};

// Get kitchen dashboard stats
export const getKitchenStats = async () => {
    const response = await axios.get(`${API_BASE_URL}/kitchen/dashboard/stats`, {
        headers: createAuthHeader()
    });
    return response.data;
};
