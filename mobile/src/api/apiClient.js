import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONSTANTS } from '../theme';

// ─── Create Axios Instance ────────────────────────────
const apiClient = axios.create({
  baseURL: CONSTANTS.API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ─────────────────────────────
apiClient.interceptors.request.use(
  async (config) => {
    // Load custom API URL from settings
    try {
      const settings = await AsyncStorage.getItem('app_settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        if (parsed.apiUrl) {
          config.baseURL = parsed.apiUrl;
        }
      }
    } catch (e) {
      // Use default URL
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 
                    error.message || 
                    'Network error - Server se connect nahi ho pa raha';
    console.error('API Error:', message);
    return Promise.reject({ message, status: error.response?.status });
  }
);

export default apiClient;

// ─── API Helpers ──────────────────────────────────────

// Customer APIs
export const customerAPI = {
  getAll: (params) => apiClient.get('/customers', { params }),
  getById: (id) => apiClient.get(`/customers/${id}`),
  create: (data) => apiClient.post('/customers', data),
  update: (id, data) => apiClient.put(`/customers/${id}`, data),
  updateLocation: (id, location) => apiClient.put(`/customers/${id}/location`, location),
  delete: (id) => apiClient.delete(`/customers/${id}`),
  deletePermanent: (id) => apiClient.delete(`/customers/${id}/permanent`),
  getHistory: (id) => apiClient.get(`/customers/${id}/history`),
};

// Delivery APIs
export const deliveryAPI = {
  getToday: () => apiClient.get('/deliveries/today'),
  getByDate: (date) => apiClient.get(`/deliveries/date/${date}`),
  startDay: () => apiClient.post('/deliveries/start'),
  startTrip: (data) => apiClient.post('/deliveries/trip/start', data),
  deliverToCustomer: (data) => apiClient.put('/deliveries/deliver', data),
  completeTrip: (data) => apiClient.put('/deliveries/trip/complete', data),
  endDelivery: (data) => apiClient.put('/deliveries/end', data),
};

// Billing APIs
export const billingAPI = {
  getCustomerBills: (customerId) => apiClient.get(`/billing/customer/${customerId}`),
  getCurrentMonth: () => apiClient.get('/billing/current-month'),
  getByMonth: (monthKey) => apiClient.get(`/billing/month/${monthKey}`),
  addPayment: (data) => apiClient.post('/billing/payment', data),
  getSummary: () => apiClient.get('/billing/summary'),
};

// Report APIs
export const reportAPI = {
  getDailyReport: (date) => apiClient.get(`/reports/daily/${date}`),
  getRecentReports: (limit) => apiClient.get('/reports/daily', { params: { limit } }),
  getMonthlyReport: (year, month) => apiClient.get(`/reports/monthly/${year}/${month}`),
  getWhatsAppDailyText: (date) => apiClient.get(`/reports/whatsapp/daily/${date}`),
  getWhatsAppMonthlyText: (year, month) => apiClient.get(`/reports/whatsapp/monthly/${year}/${month}`),
};
