import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';

// Validate API URL at startup
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10);

try {
  if (API_BASE_URL !== '/api') {
    new URL(API_BASE_URL);
  }
} catch (error) {
  console.error('[API] Invalid VITE_API_BASE_URL:', API_BASE_URL);
}

// Extend AxiosRequestConfig to include retry count
interface RetryConfig extends AxiosRequestConfig {
  __retryCount?: number;
}

const client = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Retry interceptor with exponential backoff
// Only retries on network errors or 5xx server errors, not 4xx client errors
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config as RetryConfig;
    
    // Don't retry if no config or if it's a client error (4xx)
    if (!config || !error.response || error.response.status < 500) {
      return Promise.reject(error);
    }

    const retryCount = config.__retryCount || 0;
    if (retryCount >= 3) {
      return Promise.reject(error);
    }

    config.__retryCount = retryCount + 1;
    const delay = Math.pow(2, retryCount + 1) * 100;
    await new Promise((resolve) => setTimeout(resolve, delay));

    return client(config);
  }
);

export default client;
