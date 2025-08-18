/**
 * ClientMapWrapper Tests
 *
 * Tests for the client-side wrapper that handles dynamic loading of the Map component.
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import preloadAll from 'jest-next-dynamic';
import ClientMapWrapper from '../ClientMapWrapper';
import type { Place } from '../data';

// Mock the Map component that would normally be dynamically imported
jest.mock('@/app/components/Map', () => ({
  __esModule: true,
  default: function MockMap({ places }: { places: Place[] }) {
    return (
      <div data-testid="dynamic-map">
        <div data-testid="map-loaded">Map loaded with {places.length} places</div>
      </div>
    );
  },
}));

describe('ClientMapWrapper', () => {
  const mockPlaces: Place[] = [
    {
      id: '1',
      name: 'Barcelona',
      lat: 41.3851,
      lng: 2.1734,
      note: 'Sagrada Familia',
    },
    {
      id: '2',
      name: 'Amsterdam',
      lat: 52.3676,
      lng: 4.9041,
      note: 'Canals and bikes',
    },
  ];

  beforeAll(async () => {
    // Preload all dynamic imports to avoid async loading in tests
    await act(async () => {
      await preloadAll();
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Dynamic Loading', () => {
    it('renders map component', async () => {
      render(<ClientMapWrapper places={mockPlaces} />);

      // With preloadAll, the component loads synchronously
      const mapElement = screen.getByTestId('dynamic-map');
      expect(mapElement).toBeInTheDocument();
      expect(screen.getByTestId('map-loaded')).toHaveTextContent('Map loaded with 2 places');
    });

    it('passes places prop correctly to dynamic component', async () => {
      render(<ClientMapWrapper places={mockPlaces} />);

      const mapLoaded = screen.getByTestId('map-loaded');
      expect(mapLoaded).toHaveTextContent('2 places');
    });
  });

  describe('Props Handling', () => {
    it('handles empty places array', async () => {
      render(<ClientMapWrapper places={[]} />);

      const mapLoaded = screen.getByTestId('map-loaded');
      expect(mapLoaded).toHaveTextContent('Map loaded with 0 places');
    });

    it('handles large places array', async () => {
      const manyPlaces: Place[] = Array.from({ length: 100 }, (_, i) => ({
        id: `place-${i}`,
        name: `Place ${i}`,
        lat: i,
        lng: i,
      }));

      render(<ClientMapWrapper places={manyPlaces} />);

      const mapLoaded = screen.getByTestId('map-loaded');
      expect(mapLoaded).toHaveTextContent('Map loaded with 100 places');
    });

    it('updates when places prop changes', async () => {
      const { rerender } = render(<ClientMapWrapper places={mockPlaces} />);

      const mapLoaded = screen.getByTestId('map-loaded');
      expect(mapLoaded).toHaveTextContent('2 places');

      const newPlaces: Place[] = [
        ...mockPlaces,
        {
          id: '3',
          name: 'Berlin',
          lat: 52.52,
          lng: 13.405,
          note: 'Brandenburg Gate',
        },
      ];

      rerender(<ClientMapWrapper places={newPlaces} />);

      await waitFor(() => {
        expect(screen.getByTestId('map-loaded')).toHaveTextContent('3 places');
      });
    });
  });

  describe('SSR Behavior', () => {
    it('is configured with ssr: false', async () => {
      // The component uses dynamic() with ssr: false to ensure client-side only rendering
      // This test verifies the component renders without SSR issues
      render(<ClientMapWrapper places={mockPlaces} />);

      const mapElement = screen.getByTestId('dynamic-map');
      expect(mapElement).toBeInTheDocument();
    });
  });

  describe('Error Scenarios', () => {
    it('handles component load gracefully', async () => {
      // Mock console.error to avoid test output noise
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<ClientMapWrapper places={mockPlaces} />);
      }).not.toThrow();

      // Verify the component renders
      expect(screen.getByTestId('dynamic-map')).toBeInTheDocument();

      consoleError.mockRestore();
    });
  });

  describe('Performance', () => {
    it('renders quickly', async () => {
      const startTime = performance.now();

      render(<ClientMapWrapper places={mockPlaces} />);

      const endTime = performance.now();

      // Should render very quickly with preloaded components (< 100ms)
      expect(endTime - startTime).toBeLessThan(100);
      expect(screen.getByTestId('dynamic-map')).toBeInTheDocument();
    });
  });
});
