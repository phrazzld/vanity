import { GET, POST, PUT, DELETE } from '../readings/route';
import { getReadings } from '@/lib/data';
import { NextResponse } from 'next/server';

jest.mock('@/lib/data');
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, init })),
  },
}));

describe('/api/readings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return readings with proper format', async () => {
      const mockReadings = [
        {
          title: 'Test Book',
          author: 'Test Author',
          finishedDate: '2024-01-01',
          thoughts: 'Great book',
        },
        {
          title: 'Another Book',
          author: 'Another Author',
          finishedDate: null,
          thoughts: '',
        },
      ];
      (getReadings as jest.Mock).mockReturnValue(mockReadings);

      await GET();

      expect(getReadings).toHaveBeenCalledTimes(1);
      expect(NextResponse.json).toHaveBeenCalledWith({
        data: mockReadings,
        totalCount: mockReadings.length,
        hasMore: false,
      });
    });

    it('should handle empty readings list', async () => {
      (getReadings as jest.Mock).mockReturnValue([]);

      await GET();

      expect(getReadings).toHaveBeenCalledTimes(1);
      expect(NextResponse.json).toHaveBeenCalledWith({
        data: [],
        totalCount: 0,
        hasMore: false,
      });
    });
  });

  describe('POST', () => {
    it('should return 405 with GitHub message', async () => {
      await POST();

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Use GitHub to add readings' },
        { status: 405 }
      );
    });
  });

  describe('PUT', () => {
    it('should return 405 with GitHub message', async () => {
      await PUT();

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Use GitHub to update readings' },
        { status: 405 }
      );
    });
  });

  describe('DELETE', () => {
    it('should return 405 with GitHub message', async () => {
      await DELETE();

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Use GitHub to delete readings' },
        { status: 405 }
      );
    });
  });
});
