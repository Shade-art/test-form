export interface ApplicationFormData {
  fullName: string;
  email: string;
  phone: string;
  registrationNumber: string;
  branch: string;
  currentYear: string;
  preferredDepartment: string;
  motivation: string;
  skills: string;
  github: string;
  linkedin: string;
}

export type FormErrors = Partial<Record<keyof ApplicationFormData, string>>;

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>;
  field?: string;
}

export interface SubmittedApplication {
  id: string;
  fullName: string;
  email: string;
  registrationNumber: string;
  branch: string;
  currentYear: string;
  preferredDepartment: string;
  createdAt: string;
}

export interface HealthStatus {
  status: 'ok' | 'error' | 'checking';
  uptime?: number;
  timestamp?: string;
  database?: {
    status: string;
    latencyMs?: number;
    error?: string;
  };
}
