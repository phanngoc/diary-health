// API utility functions to handle authentication and requests

/**
 * Get the JWT token from localStorage
 */
export const getToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null; // We're on the server, don't try to access localStorage
  }
  return localStorage.getItem('accessToken');
};

/**
 * Set the JWT token in localStorage
 */
export const setToken = (token: string): void => {
  if (typeof window === 'undefined') {
    return; // We're on the server, don't try to access localStorage
  }
  localStorage.setItem('accessToken', token);
};

/**
 * Remove the JWT token from localStorage
 */
export const removeToken = (): void => {
  if (typeof window === 'undefined') {
    return; // We're on the server, don't try to access localStorage
  }
  localStorage.removeItem('accessToken');
};

/**
 * Check if the user is authenticated
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') {
    return false; // We're on the server, can't check authentication this way
  }
  const token = getToken();
  return !!token;
};

/**
 * API request with authentication
 */
export const apiRequest = async <T>(
  url: string, 
  options: RequestInit = {}
): Promise<T> => {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    // Handle expired token, unauthorized, etc.
    if (response.status === 401) {
      removeToken();
      window.location.href = '/auth/login';
    }
    
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Something went wrong');
  }
  
  return response.json();
};
