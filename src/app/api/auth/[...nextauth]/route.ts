/**
 * NextAuth configuration and route handler
 * 
 * This file implements secure session-based authentication for the admin interface
 * using Next-Auth with a credentials provider.
 */

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextRequest } from "next/server";

export const authOptions = {
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
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        // Add role to session
        session.user.role = token.role;
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

// Use NextAuth handler for GET and POST requests
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };