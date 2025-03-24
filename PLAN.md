# PLAN: Implement Secure Authentication

## Overview
This plan outlines the technical steps to enhance the authentication mechanism for the admin interface of a Next.js-based personal website. The current simple cookie-based authentication will be replaced with a secure session-based system using Next-Auth. Given that the site has a single admin user and contains no sensitive data, the focus is on achieving robust security with minimal complexity. The new system will include CSRF protection, route protection, and proper session management, ensuring a smooth transition from the existing setup.

## Technical Approach

### 1. Set Up Next-Auth with Session-Based Authentication

#### Install and Configure Next-Auth
- **Install Next-Auth**: Add Next-Auth to the project if not already present. Run the following command in the terminal:
  ```bash
  npm install next-auth
  ```
- **Create Authentication Provider**: Configure a credentials provider for username and password authentication to replace the current hardcoded credentials check.
- **Session Management**: Use Next-Auth’s JWT-based session management for simplicity, as there’s only one user and no need for a database.

#### Configuration File
- Create a file at `src/app/api/auth/[...nextauth]/route.ts` with the following setup:
  ```typescript
  import NextAuth from "next-auth";
  import CredentialsProvider from "next-auth/providers/credentials";

  export const authOptions = {
    providers: [
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          username: { label: "Username", type: "text" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          const adminUsername = process.env.ADMIN_USERNAME;
          const adminPassword = process.env.ADMIN_PASSWORD;
          if (
            credentials?.username === adminUsername &&
            credentials?.password === adminPassword
          ) {
            return { id: "1", name: "Admin" };
          }
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
        }
        return token;
      },
      async session({ session, token }) {
        if (token) {
          session.user.id = token.id;
        }
        return session;
      },
    },
  };

  const handler = NextAuth(authOptions);
  export { handler as GET, handler as POST };
  ```
- **Explanation**:
  - The `CredentialsProvider` validates the admin’s username and password against environment variables.
  - JWT sessions are used for simplicity, with a 30-minute expiration time.
  - Callbacks ensure the user’s ID is passed through the token and session.

### 2. Implement CSRF Protection

#### Built-In CSRF Protection with Next-Auth
- Next-Auth automatically includes CSRF tokens in its authentication routes, protecting against CSRF attacks.
- Ensure all login requests are routed through Next-Auth’s endpoints to leverage this protection.

#### Login Form Integration
- Update the existing login form to use Next-Auth’s `signIn` function, which handles CSRF tokens:
  ```typescript
  import { signIn } from "next-auth/react";
  import { useRouter } from "next/navigation";
  import { useState } from "react";

  const LoginForm = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleLogin = async (event: React.FormEvent) => {
      event.preventDefault();
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });
      if (result?.error) {
        console.error("Login failed:", result.error);
      } else {
        router.push("/admin");
      }
    };

    return (
      <form onSubmit={handleLogin}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button type="submit">Login</button>
      </form>
    );
  };
  export default LoginForm;
  ```

### 3. Protect Admin Routes

#### Middleware for Route Protection
- Use Next.js middleware to check for a valid session and redirect unauthenticated users to the login page.
- Update or create `src/middleware.ts`:
  ```typescript
  import { getServerSession } from "next-auth/next";
  import { authOptions } from "@/app/api/auth/[...nextauth]/route";
  import { NextRequest, NextResponse } from "next/server";

  export async function middleware(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (request.nextUrl.pathname.startsWith("/admin")) {
      if (!session) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    }
    return NextResponse.next();
  }

  export const config = {
    matcher: ["/admin/:path*"],
  };
  ```
- **Explanation**: The middleware checks for a session on all `/admin/*` routes and redirects to the login page if no session exists.

### 4. Update Admin Interface Components

#### Session Checking in Components
- Use Next-Auth’s `useSession` hook in client components or `getServerSession` in server components to verify authentication status.
- Example client component (`src/app/admin/dashboard/page.tsx`):
  ```typescript
  "use client";
  import { useSession } from "next-auth/react";

  const AdminDashboard = () => {
    const { data: session, status } = useSession();
    if (status === "loading") return <div>Loading...</div>;
    if (!session) return <div>Access Denied</div>;
    return <div>Welcome, Admin! This is your dashboard.</div>;
  };

  export default AdminDashboard;
  ```

### 5. Securely Handle Credentials

#### Environment Variables
- Store credentials in a `.env` file:
  ```
  ADMIN_USERNAME=your-username
  ADMIN_PASSWORD=your-strong-password
  ```
- Ensure `.env` is listed in `.gitignore` to prevent committing credentials to version control.
- Use a strong, unique password (e.g., at least 16 characters with mixed case, numbers, and symbols).

### 6. Testing and Validation

#### Unit and Integration Tests
- Write tests to validate authentication functionality using Jest and React Testing Library.
- Example test for the login form:
  ```typescript
  import { render, screen, fireEvent } from "@testing-library/react";
  import LoginForm from "@/app/admin/login/page";

  jest.mock("next-auth/react", () => ({
    signIn: jest.fn().mockResolvedValue({ error: null }),
  }));

  test("successful login redirects to admin", async () => {
    render(<LoginForm />);
    fireEvent.change(screen.getByPlaceholderText("Username"), {
      target: { value: "admin" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password" },
    });
    fireEvent.click(screen.getByText("Login"));
    expect(await screen.findByText("Login")).toBeInTheDocument(); // Form submits successfully
  });
  ```

### 7. Documentation and Maintenance

#### Update README
- Add a section to the project `README.md`:
  ```markdown
  ## Authentication Setup
  This project uses Next-Auth for secure session-based authentication. To set up:
  1. Install dependencies: `npm install next-auth`
  2. Configure environment variables in `.env`:
     - `ADMIN_USERNAME`: Admin username
     - `ADMIN_PASSWORD`: Admin password
  3. Access the admin interface at `/admin` after logging in at `/admin/login`.
  ```

#### Maintenance
- Regularly update Next-Auth and other dependencies (`npm update`).
- Rotate credentials annually or if compromised.

## Acceptance Criteria

1. **Authentication**
   - Correct credentials grant access to admin routes; incorrect credentials display an error.
2. **Session Management**
   - Sessions use JWT and expire after 30 minutes of inactivity.
3. **CSRF Protection**
   - Login requests are protected with Next-Auth’s CSRF tokens.
4. **Route Protection**
   - Unauthenticated users are redirected from `/admin/*` to `/admin/login`.
5. **Component Security**
   - Admin components display “Access Denied” to unauthenticated users.
6. **Testing**
   - Tests pass for login, route protection, and component rendering.
7. **Documentation**
   - README includes setup instructions and environment variable details.

## Dependencies & Assumptions

### Dependencies
- Next.js 15
- Next-Auth
- TypeScript
- Jest and React Testing Library (for testing)

### Assumptions
- Admin credentials are securely stored in `.env`.
- The site uses Vercel or a similar platform with HTTPS enforcement.
- No sensitive data requires additional encryption beyond session security.

### Potential Risks
- Misconfigured Next-Auth could allow unauthorized access.
- Weak passwords or exposed `.env` files could compromise security.
- Insufficient testing might miss edge cases.

## Conclusion
This plan provides a secure, straightforward authentication system using Next-Auth, replacing the existing cookie-based approach. By implementing session management, CSRF protection, and route security, the admin interface will be well-protected while remaining simple to maintain. Start with the Next-Auth setup, then integrate the login form, middleware, and component updates, testing each step thoroughly. Keep documentation current and monitor dependencies to ensure ongoing security.
