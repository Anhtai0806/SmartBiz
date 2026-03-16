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

export const checkCashierWorkingHours = async () => {
    const response = await api.get('/tables/working-hours/check');
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

// Cashier Dashboard APIs
export const getCashierDashboardStats = async (storeId) => {
    const response = await api.get(`/cashier/dashboard/stats`, {
        params: { storeId }
    });
    return response.data;
};

export const getTodayOrders = async (storeId) => {
    const response = await api.get(`/cashier/orders/today`, {
        params: { storeId }
    });
    return response.data;
};

export const getPendingPaymentOrders = async (storeId) => {
    const response = await api.get(`/cashier/orders/pending-payment`, {
        params: { storeId }
    });
    return response.data;
};

export const getTablesWithOrders = async (storeId) => {
    const response = await api.get(`/cashier/tables/with-orders`, {
        params: { storeId }
    });
    return response.data;
};

export const createCashierInvoice = async (invoiceData) => {
    const response = await api.post('/cashier/invoices', invoiceData);
    return response.data;
};

export const getStoreQR = async (storeId) => {
    const response = await api.get(`/cashier/qr-payment/store/${storeId}`);
    return response.data;
};

// Order Item Management APIs
export const removeOrderItem = async (orderId, itemId) => {
    const response = await api.delete(`/orders/${orderId}/items/${itemId}`);
    return response.data;
};

export const updateOrderItem = async (orderId, itemId, quantity) => {
    const response = await api.put(`/orders/${orderId}/items/${itemId}`, {
        quantity
    });
    return response.data;
};

// Menu APIs
export const getMenuItemsByStore = async (storeId) => {
    const response = await api.get(`/menu-items/store/${storeId}`);
    return response.data;
};

// Schedule APIs
export const getStoreStaff = async (storeId) => {
    const response = await api.get('/cashier/staff', {
        params: { storeId }
    });
    return response.data;
};

export const getShiftsByDateRange = async (storeId, startDate, endDate) => {
    const token = localStorage.getItem('token');
    // Direct call to ShiftController
    const response = await axios.get(`http://localhost:8080/api/shifts/store/${storeId}/calendar`, {
        params: { startDate, endDate },
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

export default api;
