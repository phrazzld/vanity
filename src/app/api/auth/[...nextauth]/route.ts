/**
 * NextAuth route handler
 * 
 * This file exports the NextAuth handler for the API route.
 * The actual configuration is imported from the central auth.ts file.
 */

import NextAuth from "next-auth";
import { authOptions } from "@/auth";

// Create and export Route handlers
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };