import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/business';

// Create axios instance with auth token
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

// Dashboard
export const getDashboardStats = async () => {
    const response = await api.get('/dashboard');
    return response.data;
};

// Stores
export const getStores = async () => {
    const response = await api.get('/stores');
    return response.data;
};

export const createStore = async (storeData) => {
    const response = await api.post('/stores', storeData);
    return response.data;
};

export const getStoreDetails = async (storeId) => {
    const response = await api.get(`/stores/${storeId}`);
    return response.data;
};

// Staff
export const getStoreStaff = async (storeId) => {
    const response = await api.get(`/stores/${storeId}/staff`);
    return response.data;
};

export const createStaff = async (staffData) => {
    const response = await api.post('/staff', staffData);
    return response.data;
};

export const assignStaffToStore = async (storeId, userId) => {
    const response = await api.post('/staff/assign', { storeId, userId });
    return response.data;
};

export const removeStaffFromStore = async (storeId, staffId) => {
    const response = await api.delete(`/stores/${storeId}/staff/${staffId}`);
    return response.data;
};

export const updateStaffStatus = async (staffId, status) => {
    const response = await api.put(`/staff/${staffId}/status`, { status });
    return response.data;
};

// Menu Items
export const createMenuItem = async (storeId, menuItemData) => {
    const response = await api.post(`/stores/${storeId}/menu-items`, menuItemData);
    return response.data;
};

export const updateMenuItem = async (itemId, menuItemData) => {
    const response = await api.put(`/menu-items/${itemId}`, menuItemData);
    return response.data;
};

export const deleteMenuItem = async (itemId) => {
    const response = await api.delete(`/menu-items/${itemId}`);
    return response.data;
};

// Get categories for a store
export const getStoreCategories = async (storeId) => {
    const response = await api.get(`/stores/${storeId}/categories`);
    return response.data;
};

// Get all categories for current business owner
export const getAllCategories = async () => {
    const response = await api.get('/categories');
    return response.data;
};

// Get all stores for current business owner
export const getAllStores = async () => {
    const response = await api.get('/stores');
    return response.data;
};

// Create category
export const createCategory = async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
};

// Update category
export const updateCategory = async (categoryId, categoryData) => {
    const response = await api.put(`/categories/${categoryId}`, categoryData);
    return response.data;
};

// Delete category
export const deleteCategory = async (categoryId) => {
    const response = await api.delete(`/categories/${categoryId}`);
    return response.data;
};

// Table Management
// Note: Table endpoints are at /api/tables, not /business/api/tables
export const getStoreTables = async (storeId) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`http://localhost:8080/api/tables/store/${storeId}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

export const createTable = async (tableData) => {
    const token = localStorage.getItem('token');
    const response = await axios.post('http://localhost:8080/api/tables', tableData, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

export const updateTable = async (tableId, tableData) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`http://localhost:8080/api/tables/${tableId}`, tableData, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

export const deleteTable = async (tableId) => {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`http://localhost:8080/api/tables/${tableId}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};



// Shift Management
// Note: Shift endpoints are at /api/shifts, not /business/api/shifts
// So we need to use axios directly with absolute URLs
export const getShiftsByDateRange = async (storeId, startDate, endDate) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`http://localhost:8080/api/shifts/store/${storeId}/calendar`, {
        params: { startDate, endDate },
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

export const createShift = async (storeId, shiftData) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`http://localhost:8080/api/shifts/store/${storeId}`, shiftData, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

export const updateShift = async (storeId, shiftId, shiftData) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`http://localhost:8080/api/shifts/store/${storeId}/${shiftId}`, shiftData, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

export const deleteShift = async (shiftId) => {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`http://localhost:8080/api/shifts/${shiftId}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};


const businessOwnerApi = {
    getDashboardStats,
    getStores,
    createStore,
    getStoreDetails,
    getStoreStaff,
    createStaff,
    assignStaffToStore,
    removeStaffFromStore,
    updateStaffStatus,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getStoreCategories,
    getShiftsByDateRange,
    createShift,
    updateShift,
    deleteShift
};

export default businessOwnerApi;
