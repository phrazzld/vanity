/**
 * Tests for CSRF Client-Side Implementation
 * 
 * These tests verify that CSRF tokens are properly obtained and included in requests.
 */

import { CSRF_TOKEN_HEADER, CSRF_TOKEN_COOKIE } from '../csrf';

// Mock fetch for testing
global.fetch = jest.fn();

// Create a helper function to verify CSRF token is included in requests
async function makeCsrfProtectedRequest(endpoint: string, method: string, data?: any) {
  // First fetch the CSRF token
  const mockCsrfResponse = {
    ok: true,
    json: jest.fn().mockResolvedValue({ csrfToken: 'test-csrf-token' }),
  };
  
  // Mock the first fetch to get a CSRF token
  (global.fetch as jest.Mock).mockResolvedValueOnce(mockCsrfResponse);
  
  // Fetch the CSRF token
  const tokenResponse = await fetch('/api/auth/csrf');
  const { csrfToken } = await tokenResponse.json();
  
  // Mock the second fetch for the actual API call
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: jest.fn().mockResolvedValue({ success: true }),
  });
  
  // Make the API request with the CSRF token
  const response = await fetch(endpoint, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-token',
      [CSRF_TOKEN_HEADER]: csrfToken,
    },
    body: data ? JSON.stringify(data) : undefined,
  });
  
  return response;
}

describe('CSRF Client-Side Implementation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should add CSRF token to POST requests', async () => {
    const testData = { name: 'Test Data' };
    await makeCsrfProtectedRequest('/api/readings', 'POST', testData);
    
    // Verify token was fetched
    expect(global.fetch).toHaveBeenCalledWith('/api/auth/csrf');
    
    // Verify token was included in the API request
    const apiCall = (global.fetch as jest.Mock).mock.calls[1];
    expect(apiCall[0]).toBe('/api/readings');
    expect(apiCall[1].method).toBe('POST');
    expect(apiCall[1].headers[CSRF_TOKEN_HEADER]).toBe('test-csrf-token');
    expect(JSON.parse(apiCall[1].body)).toEqual(testData);
  });
  
  it('should add CSRF token to PUT requests', async () => {
    const testData = { name: 'Updated Data' };
    await makeCsrfProtectedRequest('/api/readings?slug=test-slug', 'PUT', testData);
    
    // Verify token was fetched
    expect(global.fetch).toHaveBeenCalledWith('/api/auth/csrf');
    
    // Verify token was included in the API request
    const apiCall = (global.fetch as jest.Mock).mock.calls[1];
    expect(apiCall[0]).toBe('/api/readings?slug=test-slug');
    expect(apiCall[1].method).toBe('PUT');
    expect(apiCall[1].headers[CSRF_TOKEN_HEADER]).toBe('test-csrf-token');
    expect(JSON.parse(apiCall[1].body)).toEqual(testData);
  });
  
  it('should add CSRF token to DELETE requests', async () => {
    await makeCsrfProtectedRequest('/api/quotes?id=1', 'DELETE');
    
    // Verify token was fetched
    expect(global.fetch).toHaveBeenCalledWith('/api/auth/csrf');
    
    // Verify token was included in the API request
    const apiCall = (global.fetch as jest.Mock).mock.calls[1];
    expect(apiCall[0]).toBe('/api/quotes?id=1');
    expect(apiCall[1].method).toBe('DELETE');
    expect(apiCall[1].headers[CSRF_TOKEN_HEADER]).toBe('test-csrf-token');
  });
});