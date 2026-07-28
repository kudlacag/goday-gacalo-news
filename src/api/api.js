// src/api/api.js
// ✅ Remove trailing slash from API_URL if it exists
export const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

// ✅ Updated helper function for API requests with proper error handling
const apiRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };
    
    try {
        // ✅ Ensure endpoint starts with a single slash and no double slashes
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        const url = `${API_URL}${cleanEndpoint}`;
        
        console.log(`📡 API Request: ${url}`); // Debug log
        
        const response = await fetch(url, {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        });

        // ✅ Check if response is OK
        if (!response.ok) {
            console.error(`❌ HTTP Error ${response.status}: ${response.statusText} for ${endpoint}`);
            return {
                success: false,
                error: `HTTP error ${response.status}: ${response.statusText}`,
                status: response.status
            };
        }

        // ✅ Check content type to ensure it's JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error(`❌ Non-JSON response for ${endpoint}:`, text.substring(0, 200));
            return {
                success: false,
                error: 'Server returned HTML instead of JSON. Please check your backend.',
                isHtml: true
            };
        }

        const data = await response.json();
        return data;
        
    } catch (error) {
        console.error(`❌ API request failed for ${endpoint}:`, error.message);
        return {
            success: false,
            error: error.message || 'Network error. Please try again.'
        };
    }
};

// ✅ FormData helper for file uploads (no Content-Type header)
const apiRequestFormData = async (endpoint, formData, options = {}) => {
    const token = localStorage.getItem('token');
    
    try {
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        const url = `${API_URL}${cleanEndpoint}`;
        
        console.log(`📡 API Request (FormData): ${url}`);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
                // ✅ NO 'Content-Type' header - browser sets it for FormData
            },
            body: formData,
            ...options
        });

        // ✅ Check if response is OK
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error(`❌ HTTP Error ${response.status}: ${response.statusText} for ${endpoint}`);
            return {
                success: false,
                error: errorData.error || `HTTP error ${response.status}: ${response.statusText}`,
                status: response.status
            };
        }

        const data = await response.json();
        return data;
        
    } catch (error) {
        console.error(`❌ API request failed for ${endpoint}:`, error.message);
        return {
            success: false,
            error: error.message || 'Network error. Please try again.'
        };
    }
};

// ========== NEWS API ==========
export const getNews = async (page = 1, limit = 15, category = 'All') => {
    const params = new URLSearchParams({ 
        page: page.toString(), 
        limit: limit.toString(), 
        category 
    });
    return apiRequest(`/api/news?${params}`);
};

export const getSingleNews = async (id) => {
    return apiRequest(`/api/news/${id}`);
};

export const getFeaturedNews = async () => {
    return apiRequest('/api/news/featured');
};

export const searchNews = async (query, page = 1, limit = 15) => {
    const params = new URLSearchParams({ q: query, page: page.toString(), limit: limit.toString() });
    return apiRequest(`/api/news/search?${params}`);
};

export const getNewsByCategory = async (category, page = 1, limit = 15) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString(), category });
    return apiRequest(`/api/news/category?${params}`);
};

// ========== AUTH API ==========
export const authAPI = {
    register: (userData) => apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
    }),
    login: (credentials) => apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
    }),
    getProfile: () => apiRequest('/api/auth/me'), // ✅ Fixed: use /me instead of /profile
    updateProfile: (userData) => apiRequest('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(userData)
    }),
    changePassword: (passwordData) => apiRequest('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(passwordData)
    }),
    forgotPassword: (email) => apiRequest('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
    }),
    resetPassword: (token, password) => apiRequest(`/api/auth/reset-password/${token}`, {
        method: 'POST',
        body: JSON.stringify({ password })
    })
};

// ========== ADMIN API ==========
export const adminAPI = {
    login: (credentials) => apiRequest('/api/auth/admin-login', {
        method: 'POST',
        body: JSON.stringify(credentials)
    }),
    
    // ✅ createNews - uses FormData, not JSON
    createNews: (formData) => apiRequestFormData('/api/admin/news', formData),
    
    // For backward compatibility - also accepts options
    createNewsWithOptions: (formData, options = {}) => {
        return apiRequestFormData('/api/admin/news', formData, options);
    },
    
    // ✅ Get all news (for admin management)
    getNews: () => apiRequest('/api/admin/news'),
    
    updateNews: (id, newsData) => {
        // If newsData is FormData, use FormData handler
        if (newsData instanceof FormData) {
            return apiRequestFormData(`/api/admin/news/${id}`, newsData, { method: 'PUT' });
        }
        // Otherwise use regular JSON
        return apiRequest(`/api/admin/news/${id}`, {
            method: 'PUT',
            body: JSON.stringify(newsData)
        });
    },
    
    deleteNews: (id) => apiRequest(`/api/admin/news/${id}`, {
        method: 'DELETE'
    }),
    
    // ✅ User Management endpoints
    getUsers: () => apiRequest('/api/admin/users'),
    createUser: (userData) => apiRequest('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(userData)
    }),
    updateUserRole: (id, role) => apiRequest(`/api/admin/users/${id}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role })
    }),
    deleteUser: (id) => apiRequest(`/api/admin/users/${id}`, {
        method: 'DELETE'
    }),
    
    // ✅ Stats endpoint
    getStats: () => apiRequest('/api/admin/stats')
};

// ========== ADMIN LOGIN (Named Export) ==========
export const adminLogin = (credentials) => apiRequest('/api/auth/admin-login', {
    method: 'POST',
    body: JSON.stringify(credentials)
});

// ========== IMAGE URL HELPER ==========
export const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads')) {
        return `${API_URL}${imagePath}`;
    }
    return `${API_URL}/uploads/${imagePath}`;
};

// ========== DEFAULT EXPORT ==========
export default {
    API_URL,
    getNews,
    getSingleNews,
    getFeaturedNews,
    searchNews,
    getNewsByCategory,
    authAPI,
    adminAPI,
    adminLogin,
    getImageUrl
};