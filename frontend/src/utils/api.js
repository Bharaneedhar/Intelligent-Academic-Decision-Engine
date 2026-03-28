import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Clean AI text to remove any single or double quotes
const sanitizeData = (data) => {
    if (typeof data === 'string') {
        return data.replace(/['"]/g, '');
    }
    if (Array.isArray(data)) {
        return data.map(sanitizeData);
    }
    if (data !== null && typeof data === 'object') {
        const cleaned = {};
        for (const [key, value] of Object.entries(data)) {
            cleaned[key] = sanitizeData(value);
        }
        return cleaned;
    }
    return data;
};

api.interceptors.response.use((response) => {
    // Skip sanitization for Blobs/binary data (PDFs, images)
    if (response.data && !(response.data instanceof Blob)) {
        response.data = sanitizeData(response.data);
    }
    return response;
});

export default api;
