/**
 * Client-side authentication utilities
 * This file is specifically for client-side use and avoids any server-only APIs
 */

// Check if we're on the client side
const isClient = typeof window !== 'undefined';

/**
 * Get the JWT token from localStorage (client-side only)
 */
export const getClientToken = (): string | null => {
  if (!isClient) return null;
  return localStorage.getItem('accessToken');
};

/**
 * Set the JWT token in localStorage (client-side only)
 */
export const setClientToken = (token: string): void => {
  if (!isClient) return;
  localStorage.setItem('accessToken', token);
};

/**
 * Remove the JWT token from localStorage (client-side only)
 */
export const removeClientToken = (): void => {
  if (!isClient) return;
  localStorage.removeItem('accessToken');
};

/**
 * Check if the user is authenticated (client-side only)
 */
export const isClientAuthenticated = (): boolean => {
  if (!isClient) return false;
  const token = getClientToken();
  return !!token;
};
