import { GET } from '../quotes/route';
import prisma from '@/lib/prisma';

// Mock the Prisma client
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    $queryRaw: jest.fn(),
  },
}));

// Mock the NextResponse
jest.mock('next/server', () => {
  return {
    __esModule: true,
    NextResponse: {
      json: jest.fn((data, options) => {
        return {
          status: options?.status || 200,
          headers: options?.headers || {},
          json: async () => data,
        };
      }),
    },
  };
});

describe('/api/quotes endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns quotes successfully', async () => {
    // Mock data
    const mockQuotes = [
      { id: 1, text: 'Quote 1', author: 'Author 1' },
      { id: 2, text: 'Quote 2', author: 'Author 2' },
    ];
    
    // Mock Prisma response
    (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce(mockQuotes);
    
    // Call the handler directly without request param
    const response = await GET();
    
    // Check the response
    expect(response.status).toBe(200);
    
    // Verify correct data was returned
    const data = await response.json();
    expect(data).toEqual(mockQuotes);
    
    // Verify Prisma query was called correctly
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it('handles database errors', async () => {
    // Mock database error
    (prisma.$queryRaw as jest.Mock).mockRejectedValueOnce(new Error('Database error'));
    
    // Call the handler directly without request param
    const response = await GET();
    
    // Check error response
    expect(response.status).toBe(500);
    
    // Verify error message
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });
});