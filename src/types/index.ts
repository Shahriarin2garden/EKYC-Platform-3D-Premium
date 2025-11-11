// Type definitions for EKYC Theme

export interface KycFormData {
  name: string;
  email: string;
  address?: string;
  nid?: string;
  occupation?: string;
}

export interface AdminCredentials {
  email: string;
  password: string;
}

export interface AdminRegistrationData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  summary?: string;
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface FormStatus {
  type: 'success' | 'error' | '';
  message: string;
  summary?: string;
}
