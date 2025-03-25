// Import Jest DOM extensions
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/',
    query: {},
    asPath: '/',
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn()
  }),
  useSearchParams: () => ({
    get: jest.fn()
  }),
  usePathname: () => '/',
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: { name: 'Admin', email: 'admin@example.com', role: 'admin', id: '1' },
      expires: new Date(Date.now() + 30 * 60 * 1000).toISOString()
    },
    status: 'authenticated'
  })),
  signIn: jest.fn(() => Promise.resolve({ ok: true, error: null })),
  signOut: jest.fn(() => Promise.resolve(true)),
  SessionProvider: ({ children }) => children
}));

// Mock NextAuth server session
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(() => ({
    user: { name: 'Admin', email: 'admin@example.com', role: 'admin', id: '1' },
    expires: new Date(Date.now() + 30 * 60 * 1000).toISOString()
  }))
}));

// Mock NextAuth middleware
jest.mock('next-auth/middleware', () => ({
  withAuth: jest.fn((middleware) => middleware)
}));

// Mock window.matchMedia for testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock environment variables
process.env.NEXT_PUBLIC_SPACES_BASE_URL = 'https://test-space.com';
process.env.ADMIN_USERNAME = 'admin';
process.env.ADMIN_PASSWORD = 'password123';