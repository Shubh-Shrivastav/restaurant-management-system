import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - add token
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

// Response interceptor - handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    register: (data) => api.post('/auth/register', data),
    getUsers: () => api.get('/auth/users')
};

// Menu API
export const menuAPI = {
    getAll: (params) => api.get('/menu', { params }),
    getById: (id) => api.get(`/menu/${id}`),
    create: (data) => api.post('/menu', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, data) => api.put(`/menu/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (id) => api.delete(`/menu/${id}`)
};

// Order API
export const orderAPI = {
    getAll: (params) => api.get('/orders', { params }),
    getActive: () => api.get('/orders/active'),
    getById: (id) => api.get(`/orders/${id}`),
    create: (data) => api.post('/orders', data),
    updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status })
};

// Inventory API
export const inventoryAPI = {
    getAll: (params) => api.get('/inventory', { params }),
    getById: (id) => api.get(`/inventory/${id}`),
    create: (data) => api.post('/inventory', data),
    update: (id, data) => api.put(`/inventory/${id}`, data),
    delete: (id) => api.delete(`/inventory/${id}`),
    restock: (id, quantity) => api.patch(`/inventory/${id}/restock`, { quantity })
};

// Customer API
export const customerAPI = {
    getAll: (params) => api.get('/customers', { params }),
    getById: (id) => api.get(`/customers/${id}`),
    create: (data) => api.post('/customers', data),
    update: (id, data) => api.put(`/customers/${id}`, data),
    delete: (id) => api.delete(`/customers/${id}`),
    getOrders: (id) => api.get(`/customers/${id}/orders`),
    addLoyalty: (id, points) => api.patch(`/customers/${id}/loyalty`, { points })
};

// Dashboard API
export const dashboardAPI = {
    getStats: () => api.get('/dashboard/stats')
};

// Reports API
export const reportAPI = {
    getDailySales: (params) => api.get('/reports/daily-sales', { params }),
    getTopItems: (params) => api.get('/reports/top-items', { params }),
    getCancelled: (params) => api.get('/reports/cancelled', { params }),
    getRevenueByType: (params) => api.get('/reports/revenue-by-type', { params })
};

// AI API
export const aiAPI = {
    getPredictions: () => api.get('/ai/predictions')
};

// Super Admin API
export const superAdminAPI = {
    getRequests: (params) => api.get('/super-admin/requests', { params }),
    approveRequest: (id) => api.patch(`/super-admin/requests/${id}/approve`),
    rejectRequest: (id) => api.patch(`/super-admin/requests/${id}/reject`),
    getStats: () => api.get('/super-admin/stats'),
};

// Public Registration API
export const registrationAPI = {
    register: (data) => api.post('/auth/register-restaurant', data),
};

export default api;

