/**
 * Auth helpers for NextAuth
 * 
 * This file provides helper functions, types, and configuration for authentication.
 */

import { getServerSession } from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

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
 * NextAuth configuration options
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Get environment variables with fallbacks for development
        const adminUsername = process.env.ADMIN_USERNAME || 'admin';
        const adminPassword = process.env.ADMIN_PASSWORD || 'password123';
        
        // Log auth attempt (without printing actual passwords)
        console.log(`Auth attempt for user: ${credentials?.username}`);
        console.log(`Expected admin username: ${adminUsername}`);
        console.log(`Environment variables present: ${!!process.env.ADMIN_USERNAME}, ${!!process.env.ADMIN_PASSWORD}`);
        
        // Check if someone is trying to use the demo credentials shown on the page
        if (credentials?.username === 'admin' && credentials?.password === 'password123' && 
            (adminUsername !== 'admin' || adminPassword !== 'password123')) {
          console.log('Authentication failed: someone tried using the demo credentials');
          throw new Error("lol i can't believe you thought that would work");
        }
        
        if (
          credentials?.username === adminUsername &&
          credentials?.password === adminPassword
        ) {
          console.log('Authentication successful');
          return {
            id: "1",
            name: "Admin",
            email: "admin@example.com",
            role: "admin"
          };
        }
        
        // Invalid credentials
        console.log('Authentication failed: invalid credentials');
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 60, // 30 minutes session expiration
  },
  // Configure secure cookies based on environment
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        // Secure in production, but allow non-HTTPS in development
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Cast to any to handle custom user fields
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        // Use type assertion for the entire user object
        const user = session.user as any;
        user.id = token.id as string;
        user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/admin/login',
    signOut: '/admin/login',
    error: '/admin/login', 
  },
  debug: process.env.NODE_ENV === 'development',
};

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