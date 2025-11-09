import axios from 'axios';

//const API_BASE_URL = 'http://localhost/mtpsaas/public/api/v1';
  const API_BASE_URL = 'https://seemii.mytutorpod.org/mtpsaas/public/api/v1/';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
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

// Auth API
export const authAPI = {
  login: (credentials) => {
    const formData = new FormData();
    formData.append('user_name', credentials.username);
    formData.append('password', credentials.password);
    formData.append('browser', navigator.userAgent);
    formData.append('operatingSystem', navigator.platform);
    formData.append('ipaddress', '127.0.0.1');
    formData.append('location', 'Local');
    
    console.log('Login request data:', {
      username: credentials.username,
      password: '***',
      browser: navigator.userAgent,
      os: navigator.platform
    });
    
    // Log FormData contents
    for (let [key, value] of formData.entries()) {
      console.log(`FormData ${key}:`, value);
    }
    
    return axios.post(`${API_BASE_URL}/login`, formData);
  },
  
  getUserProfile: () => api.get('/user-profile'),
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
  },
};

// Widget API
export const widgetAPI = {
  // Widget CRUD operations
  createWidget: (data) => api.post('/widgets/create', data),
  listWidgets: (params) => api.get('/widgets/list', { params }),
  getWidget: (id) => api.get(`/widgets/show?widget_id=${id}`),
  updateWidget: (id, data) => api.post(`/widgets/update?widget_id=${id}`, data),
  deleteWidget: (id) => api.get(`/widgets/delete?widget_id=${id}`),
  
  // Widget settings
  saveSettings: (data) => api.post('/widgets/settings/save', data),
  getSettings: () => api.get('/widgets/settings/get'),
  
  // Widget submission endpoints (used by widget components)
  submitWidget: (data, apiBaseUrl = 'http://localhost/mtpsaas/public') => {
    return axios.post(`${apiBaseUrl}/public/widgets/submit`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
  
  // Signup widget submission
  submitSignup: (data, apiBaseUrl = 'http://localhost/mtpsaas/public') => {
    return axios.post(`${apiBaseUrl}/public/widgets/submit`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
  
  // Login widget submission
  submitLogin: (credentials, apiBaseUrl = 'http://localhost/mtpsaas/public') => {
    const formData = new FormData();
    formData.append('user_name', credentials.username);
    formData.append('password', credentials.password);
    formData.append('browser', credentials.browser || 'unknown');
    formData.append('operatingSystem', credentials.operatingSystem || 'unknown');
    formData.append('ipaddress', credentials.ipaddress || '');
    formData.append('location', credentials.location || '');
    
    return axios.post(`${apiBaseUrl}/public/api/v1/login`, formData);
  },
  
  // Contact widget submission
  submitContact: (data, apiBaseUrl = 'http://localhost/mtpsaas/public') => {
    return axios.post(`${apiBaseUrl}/public/widgets/submit`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
  
  // Booking widget submission
  submitBooking: (data, apiBaseUrl = 'http://localhost/mtpsaas/public') => {
    return axios.post(`${apiBaseUrl}/public/widgets/submit`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
  
  // Get available slots for booking
  getAvailableSlots: (widgetId, params) => {
    return api.get(`/widgets/available-slots?widget_id=${widgetId}`, { params });
  },
};

// Custom Fields API
export const customFieldsAPI = {
  listCustomFields: (appDetailId) => api.get(`/custom-fields/list?app_detail_id=${appDetailId}`),
  createCustomField: (data) => api.post('/custom-fields/create', data),
  updateCustomField: (id, data) => api.post(`/custom-fields/update?field_id=${id}`, data),
  deleteCustomField: (id) => api.get(`/custom-fields/delete?field_id=${id}`),
};

export default api;
