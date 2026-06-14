import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const getAvailabilityShiftTemplates = async (storeId) => {
    const response = await api.get('/availability/shift-templates', {
        params: { storeId }
    });
    return response.data;
};

export const getMyAvailability = async (storeId, weekStart) => {
    const response = await api.get('/availability/week', {
        params: { storeId, weekStart }
    });
    return response.data;
};

export const submitMyAvailability = async (availabilityData) => {
    const response = await api.put('/availability/week', availabilityData);
    return response.data;
};
