import axios, { AxiosInstance } from 'axios';
import { KycFormData, AdminCredentials, AdminRegistrationData, ApiResponse } from '../types';

// Use environment variable for API URL, fallback to localhost for development
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Disabled to avoid CORS issues with wildcard origin
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
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

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      globalThis.location.href = '/admin';
    }
    return Promise.reject(error);
  }
);

// KYC API endpoints
export const kycApi = {
  submit: (data: KycFormData) => 
    apiClient.post<ApiResponse>('/kyc/submit', data),
  
  getAll: () => 
    apiClient.get<ApiResponse>('/kyc'),
  
  getById: (id: string) => 
    apiClient.get<ApiResponse>(`/kyc/${id}`),
  
  update: (id: string, data: Partial<KycFormData>) => 
    apiClient.put<ApiResponse>(`/kyc/${id}`, data),
  
  delete: (id: string) => 
    apiClient.delete<ApiResponse>(`/kyc/${id}`),
};

// Admin API endpoints
export const adminApi = {
  login: (credentials: AdminCredentials) => 
    apiClient.post<ApiResponse>('/admin/login', credentials),
  
  register: (data: AdminRegistrationData) => 
    apiClient.post<ApiResponse>('/admin/register', data),
  
  logout: () => 
    apiClient.post<ApiResponse>('/admin/logout'),
  
  getCurrentUser: () => 
    apiClient.get<ApiResponse>('/admin/me'),
};

// PDF API endpoints
export const pdfApi = {
  generate: (kycId: string, priority: number = 5) => 
    apiClient.post<ApiResponse>(`/admin/kyc/${kycId}/generate-pdf`, { priority }),
  
  download: async (kycId: string) => {
    const response = await apiClient.get(`/admin/kyc/${kycId}/download-pdf`, {
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `kyc_report_${kycId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return response.data;
  },
  
  getStatus: (kycId: string) => 
    apiClient.get<ApiResponse>(`/admin/kyc/${kycId}/pdf-status`),
  
  batchGenerate: (kycIds: string[], priority: number = 3) => 
    apiClient.post<ApiResponse>('/admin/kyc/batch-generate-pdf', { kycIds, priority }),
  
  getQueueStatus: () => 
    apiClient.get<ApiResponse>('/admin/pdf-queue-status'),
};

export default apiClient;
