/**
 * Map Component Tests
 *
 * Tests for the interactive map component that displays places visited.
 * Mocks Leaflet library to avoid "window is not defined" errors in Jest.
 */

import { render, screen } from '@testing-library/react';
import WhereIveBeenMap from '../Map';
import type { Place } from '@/app/map/data';

// Using global mocks from src/__mocks__/leaflet.ts and src/__mocks__/react-leaflet.tsx
// These are configured in jest.config.js moduleNameMapper

describe('Map Component', () => {
  const mockPlaces: Place[] = [
    {
      id: '1',
      name: 'Tokyo',
      lat: 35.6762,
      lng: 139.6503,
      note: 'Amazing sushi',
    },
    {
      id: '2',
      name: 'Paris',
      lat: 48.8566,
      lng: 2.3522,
      note: 'Eiffel Tower visit',
    },
    {
      id: '3',
      name: 'New York',
      lat: 40.7128,
      lng: -74.006,
      // No note for this place
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(<WhereIveBeenMap places={[]} />);
      expect(screen.getByTestId('map-container')).toBeInTheDocument();
    });

    it('renders map container with correct dimensions', () => {
      render(<WhereIveBeenMap places={mockPlaces} />);
      const container = screen.getByTestId('map-container');

      expect(container).toHaveStyle({
        width: '100%',
        height: '100%',
      });
    });

    it('renders with correct initial center and zoom', () => {
      render(<WhereIveBeenMap places={mockPlaces} />);
      const mapContainer = screen.getByTestId('map-container');

      expect(mapContainer).toHaveAttribute('data-center', '[40,-20]');
      expect(mapContainer).toHaveAttribute('data-zoom', '3');
    });
  });

  describe('Marker Rendering', () => {
    it('displays correct number of markers', () => {
      render(<WhereIveBeenMap places={mockPlaces} />);
      const markers = screen.getAllByTestId('marker');

      expect(markers).toHaveLength(3);
    });

    it('renders markers at correct positions', () => {
      render(<WhereIveBeenMap places={mockPlaces} />);
      const markers = screen.getAllByTestId('marker');

      expect(markers[0]).toHaveAttribute('data-position', '[35.6762,139.6503]');
      expect(markers[1]).toHaveAttribute('data-position', '[48.8566,2.3522]');
      expect(markers[2]).toHaveAttribute('data-position', '[40.7128,-74.006]');
    });

    it('handles empty places array', () => {
      render(<WhereIveBeenMap places={[]} />);
      const markers = screen.queryAllByTestId('marker');

      expect(markers).toHaveLength(0);
    });

    it('handles large number of places', () => {
      const manyPlaces: Place[] = Array.from({ length: 73 }, (_, i) => ({
        id: `place-${i}`,
        name: `Place ${i}`,
        lat: i,
        lng: i,
      }));

      render(<WhereIveBeenMap places={manyPlaces} />);
      const markers = screen.getAllByTestId('marker');

      expect(markers).toHaveLength(73);
    });
  });

  describe('Popup Content', () => {
    it('shows place name in popup', () => {
      render(<WhereIveBeenMap places={mockPlaces} />);
      const popups = screen.getAllByTestId('popup');

      expect(popups[0]).toHaveTextContent('Tokyo');
      expect(popups[1]).toHaveTextContent('Paris');
      expect(popups[2]).toHaveTextContent('New York');
    });

    it('shows note when available', () => {
      render(<WhereIveBeenMap places={mockPlaces} />);
      const popups = screen.getAllByTestId('popup');

      expect(popups[0]).toHaveTextContent('Amazing sushi');
      expect(popups[1]).toHaveTextContent('Eiffel Tower visit');
    });

    it('shows "no note" when note is missing', () => {
      render(<WhereIveBeenMap places={mockPlaces} />);
      const popups = screen.getAllByTestId('popup');

      expect(popups[2]).toHaveTextContent('no note');
    });
  });

  describe('Map Configuration', () => {
    it('renders OpenStreetMap tile layer', () => {
      render(<WhereIveBeenMap places={mockPlaces} />);
      const tileLayer = screen.getByTestId('tile-layer');

      expect(tileLayer).toHaveAttribute(
        'data-url',
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      );
    });

    it('includes proper attribution', () => {
      render(<WhereIveBeenMap places={mockPlaces} />);
      const tileLayer = screen.getByTestId('tile-layer');

      expect(tileLayer).toHaveAttribute(
        'data-attribution',
        '© <a href="http://openstreetmap.org">openstreetmap</a> contributors'
      );
    });

    it('has correct container styling', () => {
      const { container } = render(<WhereIveBeenMap places={mockPlaces} />);
      const mapWrapper = container.firstChild as HTMLElement;

      expect(mapWrapper).toHaveStyle({
        width: '100%',
        height: '90vh',
        border: '2px solid hotpink',
        position: 'absolute',
        top: '0',
        left: '0',
      });
    });

    it('enables scroll wheel zoom', () => {
      render(<WhereIveBeenMap places={mockPlaces} />);
      const mapContainer = screen.getByTestId('map-container');

      expect(mapContainer).toHaveAttribute('data-scroll-wheel-zoom', 'true');
    });

    it('sets world bounds correctly', () => {
      render(<WhereIveBeenMap places={mockPlaces} />);
      const mapContainer = screen.getByTestId('map-container');

      expect(mapContainer).toHaveAttribute('data-max-bounds', '[[-85,-180],[85,180]]');
      expect(mapContainer).toHaveAttribute('data-max-bounds-viscosity', '1');
    });
  });

  describe('Edge Cases', () => {
    it('handles places with special characters in names', () => {
      const specialPlaces: Place[] = [
        {
          id: '1',
          name: 'São Paulo',
          lat: -23.5505,
          lng: -46.6333,
          note: "Brazil's largest city",
        },
        {
          id: '2',
          name: 'Zürich',
          lat: 47.3769,
          lng: 8.5417,
          note: 'Swiss banking & chocolate',
        },
      ];

      render(<WhereIveBeenMap places={specialPlaces} />);
      const popups = screen.getAllByTestId('popup');

      expect(popups[0]).toHaveTextContent('São Paulo');
      expect(popups[1]).toHaveTextContent('Zürich');
    });

    it('handles places at extreme coordinates', () => {
      const extremePlaces: Place[] = [
        {
          id: '1',
          name: 'North Pole',
          lat: 90,
          lng: 0,
        },
        {
          id: '2',
          name: 'South Pole',
          lat: -90,
          lng: 0,
        },
        {
          id: '3',
          name: 'International Date Line',
          lat: 0,
          lng: 180,
        },
      ];

      render(<WhereIveBeenMap places={extremePlaces} />);
      const markers = screen.getAllByTestId('marker');

      expect(markers).toHaveLength(3);
      expect(markers[0]).toHaveAttribute('data-position', '[90,0]');
      expect(markers[1]).toHaveAttribute('data-position', '[-90,0]');
      expect(markers[2]).toHaveAttribute('data-position', '[0,180]');
    });

    it('handles duplicate place IDs gracefully', () => {
      const duplicatePlaces: Place[] = [
        {
          id: '1',
          name: 'Place A',
          lat: 0,
          lng: 0,
        },
        {
          id: '1', // Duplicate ID
          name: 'Place B',
          lat: 1,
          lng: 1,
        },
      ];

      // Should not crash even with duplicate keys
      expect(() => {
        render(<WhereIveBeenMap places={duplicatePlaces} />);
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('renders efficiently with many markers', () => {
      const startTime = performance.now();

      const manyPlaces: Place[] = Array.from({ length: 100 }, (_, i) => ({
        id: `place-${i}`,
        name: `Place ${i}`,
        lat: (i % 180) - 90,
        lng: (i % 360) - 180,
        note: `Note for place ${i}`,
      }));

      render(<WhereIveBeenMap places={manyPlaces} />);

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render in reasonable time (< 1 second)
      expect(renderTime).toBeLessThan(1000);

      const markers = screen.getAllByTestId('marker');
      expect(markers).toHaveLength(100);
    });
  });
});
