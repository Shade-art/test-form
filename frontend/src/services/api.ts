import { ApplicationFormData, ApiResponse, SubmittedApplication, HealthStatus } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export async function checkBackendHealth(): Promise<HealthStatus> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    const data = await res.json();
    return data;
  } catch (error) {
    return {
      status: 'error',
      database: {
        status: 'disconnected',
        error: error instanceof Error ? error.message : 'Failed to connect to backend server',
      },
    };
  }
}

export async function submitApplication(
  formData: ApplicationFormData
): Promise<ApiResponse<SubmittedApplication>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const data: ApiResponse<SubmittedApplication> = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: data.message || `Request failed with status ${res.status}`,
        errors: data.errors,
        field: data.field,
      };
    }

    return data;
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? `Network error: ${error.message}. Is the backend server running?`
          : 'Failed to communicate with the server. Please check your network connection.',
    };
  }
}
