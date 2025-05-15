// API client for making authenticated requests to the backend
import { getToken } from "./api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

class ApiClient {
  async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      method: "GET",
      ...options,
    });
  }

  async post<T>(
    endpoint: string,
    data: any,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
      ...options,
    });
  }

  async put<T>(
    endpoint: string,
    data: any,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
      ...options,
    });
  }

  async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
      ...options,
    });
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Only try to get token on client side
    const token = typeof window !== 'undefined' ? getToken() : null;

    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText,
      }));
      
      // Handle 401 Unauthorized errors (token expired, etc.)
      if (response.status === 401 && typeof window !== 'undefined') {
        // Only redirect on client side
        console.error("Unauthorized: Please login again");
      }
      
      throw new Error(error.detail || error.message || "An error occurred");
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();
