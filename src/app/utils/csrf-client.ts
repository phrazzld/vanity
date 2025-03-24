/**
 * CSRF Client Utilities
 * 
 * Client-side utilities for managing CSRF tokens in API requests.
 */

'use client';

import { CSRF_TOKEN_HEADER } from './csrf';

let cachedToken: string | null = null;

/**
 * Fetches a new CSRF token from the server
 * 
 * @returns The CSRF token
 */
export async function fetchCsrfToken(): Promise<string> {
  try {
    const response = await fetch('/api/auth/csrf');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch CSRF token: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.csrfToken) {
      throw new Error('CSRF token not found in response');
    }
    
    // Cache the token for future use
    cachedToken = data.csrfToken;
    
    return data.csrfToken;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    throw error;
  }
}

/**
 * Gets the CSRF token, fetching a new one if needed
 * 
 * @returns The CSRF token
 */
export async function getCsrfToken(): Promise<string> {
  if (cachedToken) {
    return cachedToken;
  }
  
  return await fetchCsrfToken();
}

/**
 * Adds CSRF token and API token headers to fetch options
 * 
 * @param options - Fetch options
 * @returns Fetch options with CSRF token header
 */
export async function addSecurityHeaders(options: RequestInit = {}): Promise<RequestInit> {
  const csrfToken = await getCsrfToken();
  
  const headers = new Headers(options.headers);
  
  // Add CSRF token header
  headers.set(CSRF_TOKEN_HEADER, csrfToken);
  
  // If an API token exists in environment, add it
  // For security, we do not add the token directly here - the environment
  // variables will be used by the server
  
  return {
    ...options,
    headers
  };
}

/**
 * Creates a fetch function with CSRF protection
 * 
 * @returns A fetch function with CSRF protection
 */
export function createSecureFetch() {
  return async (url: string, options: RequestInit = {}) => {
    const secureOptions = await addSecurityHeaders(options);
    return fetch(url, secureOptions);
  };
}

// Export a singleton secure fetch instance
export const secureFetch = createSecureFetch();

// Default export for convenient importing
export default {
  fetchCsrfToken,
  getCsrfToken,
  addSecurityHeaders,
  createSecureFetch,
  secureFetch
};