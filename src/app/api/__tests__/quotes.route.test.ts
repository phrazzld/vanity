import { GET, POST, PUT, DELETE } from '../quotes/route';
import { getQuotes } from '@/lib/data';
import { NextResponse } from 'next/server';

jest.mock('@/lib/data');
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, init })),
  },
}));

describe('/api/quotes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return quotes from getQuotes', async () => {
      const mockQuotes = [
        { id: 1, text: 'Test quote', author: 'Test Author' },
        { id: 2, text: 'Another quote', author: 'Another Author' },
      ];
      (getQuotes as jest.Mock).mockReturnValue(mockQuotes);

      await GET();

      expect(getQuotes).toHaveBeenCalledTimes(1);
      expect(NextResponse.json).toHaveBeenCalledWith(mockQuotes);
    });
  });

  describe('POST', () => {
    it('should return 405 with GitHub message', async () => {
      await POST();

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Use GitHub to add quotes' },
        { status: 405 }
      );
    });
  });

  describe('PUT', () => {
    it('should return 405 with GitHub message', async () => {
      await PUT();

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Use GitHub to update quotes' },
        { status: 405 }
      );
    });
  });

  describe('DELETE', () => {
    it('should return 405 with GitHub message', async () => {
      await DELETE();

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Use GitHub to delete quotes' },
        { status: 405 }
      );
    });
  });
});
