/**
 * Auth helpers for NextAuth
 * 
 * This file provides helper functions and types for authentication.
 */

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Type for user session information
 */
export interface UserSession {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  expires: string;
}

/**
 * Gets the current session on the server
 * 
 * @returns The user session or null if not authenticated
 */
export async function getSession() {
  const session = await getServerSession(authOptions) as UserSession | null;
  return session;
}

/**
 * Checks if the current user is authenticated
 * 
 * @returns Boolean indicating if user is authenticated
 */
export async function isAuthenticated() {
  const session = await getSession();
  return !!session?.user;
}

/**
 * Checks if the current user has admin role
 * 
 * @returns Boolean indicating if user is an admin
 */
export async function isAdmin() {
  const session = await getSession();
  return session?.user?.role === 'admin';
}

/**
 * Auth helper functions for client components
 */
const auth = {
  /**
   * Helper for validating environment variables
   * This is used by the NextAuth configuration
   */
  getAuthEnv() {
    // Get environment variables with fallbacks for development
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'password123';
    
    // Check for insecure defaults in production
    if (process.env.NODE_ENV === 'production') {
      if (adminUsername === 'admin' || adminPassword === 'password123') {
        console.warn('WARNING: Using default admin credentials in production environment!');
      }
    }
    
    return {
      adminUsername,
      adminPassword,
      isConfigured: !!(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD)
    };
  }
};

export default auth;