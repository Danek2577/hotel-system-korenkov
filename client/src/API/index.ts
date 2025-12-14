import axios from 'axios';

const API_URL = process.env.APP_API_URL || 'http://localhost:5000/api';

// Public API instance
export const $host = axios.create({
    baseURL: API_URL,
});

// Authorized API instance
export const $authHost = axios.create({
    baseURL: API_URL,
});

// Request interceptor - add token
$authHost.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers = config.headers || {};
            config.headers.authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Response interceptor - handle 401 errors
$authHost.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export { API_URL };
