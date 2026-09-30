import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, IS_DEMO_MODE } from '../utils/constants';

// Create central Axios client
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  // Axios chooses JSON or multipart headers from the request body.
  timeout: 30000,
});

// Request Interceptor: Attach JWT token if available & strip duplicate /api prefix
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (config.url && config.url.startsWith('/api/')) {
      config.url = config.url.substring(4);
    }
    const token = localStorage.getItem('cpse_auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized / 403 Forbidden & Unwrap ApiResponse
apiClient.interceptors.response.use(
  (response) => {
    if (
      response.data &&
      typeof response.data === 'object' &&
      'success' in response.data &&
      'data' in response.data
    ) {
      const envelope = response.data;
      // PaginatedResponse also has success/data fields, but its data array is
      // only one field of the response. Keep page metadata intact.
      const isPaginated = 'page' in envelope && ('totalElements' in envelope || 'total' in envelope);
      if (!isPaginated) {
        const unwrapped = envelope.data !== undefined && envelope.data !== null ? envelope.data : envelope;
        if (unwrapped && typeof unwrapped === 'object' && !('message' in unwrapped) && 'message' in envelope) {
          unwrapped.message = envelope.message;
        }
        response.data = unwrapped;
      }
    }
    return response;
  },
  (error: AxiosError) => {
    const serverMessage = (error.response?.data as { message?: unknown } | undefined)?.message;
    if (typeof serverMessage === 'string' && serverMessage.trim()) {
      error.message = serverMessage;
    }

    if (error.response?.status === 401) {
      // Clear token and redirect to login if not already there
      localStorage.removeItem('cpse_auth_token');
      localStorage.removeItem('cpse_auth_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

// Helper for simulated latency in demo mode
export const simulateLatency = (ms = 300): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export { IS_DEMO_MODE };
