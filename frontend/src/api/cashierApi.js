import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Table APIs
export const getTablesByStore = async (storeId) => {
    const response = await api.get(`/tables/store/${storeId}`);
    return response.data;
};

export const updateTableStatus = async (tableId, status) => {
    const response = await api.put(`/tables/${tableId}/status`, { status });
    return response.data;
};

// Order APIs
export const getOrdersByShift = async (shiftId) => {
    const response = await api.get(`/orders/shift/${shiftId}`);
    return response.data;
};

export const getOrderByTable = async (tableId) => {
    const response = await api.get(`/orders/table/${tableId}`);
    return response.data;
};

export const getOrdersByStore = async (storeId) => {
    const response = await api.get(`/orders/store/${storeId}`);
    return response.data;
};

export const createOrder = async (orderRequest) => {
    const response = await api.post('/orders', orderRequest);
    return response.data;
};

export const addItemToOrder = async (orderId, orderItemRequest) => {
    const response = await api.post(`/orders/${orderId}/items`, orderItemRequest);
    return response.data;
};

export const updateOrderStatus = async (orderId, status) => {
    const response = await api.put(`/orders/${orderId}/status`, { status });
    return response.data;
};

// Invoice APIs
export const createInvoice = async (invoiceRequest) => {
    const response = await api.post('/invoices', invoiceRequest);
    return response.data;
};

export const getInvoiceByOrder = async (orderId) => {
    const response = await api.get(`/invoices/order/${orderId}`);
    return response.data;
};

export const getInvoicesByStore = async (storeId) => {
    const response = await api.get(`/invoices/store/${storeId}`);
    return response.data;
};

export default api;
