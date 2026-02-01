import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance with auth header
const createAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Dashboard Stats
export const getStaffDashboardStats = async (storeId) => {
    const response = await axios.get(`${API_BASE_URL}/staff/dashboard/stats`, {
        params: { storeId },
        headers: createAuthHeader()
    });
    return response.data;
};

// Get today's shift
export const getMyTodayShift = async () => {
    const response = await axios.get(`${API_BASE_URL}/staff/shifts/today`, {
        headers: createAuthHeader()
    });
    return response.data;
};

// Tables
export const getTablesByStore = async (storeId) => {
    const response = await axios.get(`${API_BASE_URL}/tables/store/${storeId}`, {
        headers: createAuthHeader()
    });
    return response.data;
};

export const updateTableStatus = async (tableId, status) => {
    const response = await axios.put(
        `${API_BASE_URL}/tables/${tableId}/status`,
        { status },
        { headers: createAuthHeader() }
    );
    return response.data;
};

// Orders
export const getOrderByTable = async (tableId) => {
    const response = await axios.get(`${API_BASE_URL}/orders/table/${tableId}`, {
        headers: createAuthHeader()
    });
    return response.data;
};

export const getMyOrders = async () => {
    const response = await axios.get(`${API_BASE_URL}/staff/orders/my-orders`, {
        headers: createAuthHeader()
    });
    return response.data;
};

export const createOrder = async (orderData) => {
    const response = await axios.post(
        `${API_BASE_URL}/orders`,
        orderData,
        { headers: createAuthHeader() }
    );
    return response.data;
};

export const addItemToOrder = async (orderId, item) => {
    const response = await axios.post(
        `${API_BASE_URL}/orders/${orderId}/items`,
        item,
        { headers: createAuthHeader() }
    );
    return response.data;
};

export const updateOrderItem = async (orderId, itemId, quantity) => {
    const response = await axios.put(
        `${API_BASE_URL}/orders/${orderId}/items/${itemId}`,
        { quantity },
        { headers: createAuthHeader() }
    );
    return response.data;
};

export const removeOrderItem = async (orderId, itemId) => {
    const response = await axios.delete(
        `${API_BASE_URL}/orders/${orderId}/items/${itemId}`,
        { headers: createAuthHeader() }
    );
    return response.data;
};

// Menu
export const getMenuItemsByStore = async (storeId) => {
    const response = await axios.get(`${API_BASE_URL}/menu/store/${storeId}`, {
        headers: createAuthHeader()
    });
    return response.data;
};

// Shifts
export const getMyShifts = async (startDate, endDate) => {
    const response = await axios.get(`${API_BASE_URL}/staff/shifts/my-shifts`, {
        params: { startDate, endDate },
        headers: createAuthHeader()
    });
    return response.data;
};

// Profile
export const getUserProfile = async () => {
    const response = await axios.get(`${API_BASE_URL}/users/profile`, {
        headers: createAuthHeader()
    });
    return response.data;
};

export const changePassword = async (passwordData) => {
    const response = await axios.put(
        `${API_BASE_URL}/users/change-password`,
        passwordData,
        { headers: createAuthHeader() }
    );
    return response.data;
};
