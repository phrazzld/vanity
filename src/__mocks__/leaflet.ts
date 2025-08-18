/* eslint-env jest */
/* global jest */

/**
 * Mock implementation of leaflet for Jest testing environment
 *
 * This mock provides the minimal Leaflet API needed for testing,
 * particularly the Icon configuration used in Map.tsx
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

// Mock Icon class
class MockIcon {
  static Default = {
    prototype: {
      _getIconUrl: undefined,
      _options: {} as any,
    },
    mergeOptions: jest.fn((options: any) => {
      // Store options for testing if needed
      MockIcon.Default.prototype._options = options;
    }),
    _options: {},
  };
}

// Mock LatLng class
class MockLatLng {
  lat: number;
  lng: number;

  constructor(lat: number, lng: number) {
    this.lat = lat;
    this.lng = lng;
  }
}

// Mock Map class
class MockMap {
  setView = jest.fn();
  getCenter = jest.fn(() => new MockLatLng(0, 0));
  getZoom = jest.fn(() => 10);
  on = jest.fn();
  off = jest.fn();
  invalidateSize = jest.fn();
  fitBounds = jest.fn();
  panTo = jest.fn();
  setZoom = jest.fn();
  addLayer = jest.fn();
  removeLayer = jest.fn();
}

// Mock marker function
const mockMarker = jest.fn((latlng: any, _options?: any) => ({
  addTo: jest.fn(),
  bindPopup: jest.fn(),
  openPopup: jest.fn(),
  closePopup: jest.fn(),
  setLatLng: jest.fn(),
  getLatLng: jest.fn(() => latlng),
  on: jest.fn(),
  off: jest.fn(),
}));

// Mock control namespace
const mockControl = {
  zoom: jest.fn(() => ({
    addTo: jest.fn(),
    remove: jest.fn(),
  })),
  layers: jest.fn(() => ({
    addTo: jest.fn(),
    remove: jest.fn(),
  })),
  scale: jest.fn(() => ({
    addTo: jest.fn(),
    remove: jest.fn(),
  })),
};

// Mock tileLayer function
const mockTileLayer = jest.fn((_url: string, _options?: any) => ({
  addTo: jest.fn(),
  remove: jest.fn(),
  setUrl: jest.fn(),
  setOpacity: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
}));

// Main export
const L = {
  Icon: MockIcon,
  LatLng: MockLatLng,
  Map: MockMap,
  marker: mockMarker,
  control: mockControl,
  tileLayer: mockTileLayer,
  latLng: (lat: number, lng: number) => new MockLatLng(lat, lng),
  latLngBounds: jest.fn((_corner1: any, _corner2: any) => ({
    extend: jest.fn(),
    getCenter: jest.fn(() => new MockLatLng(0, 0)),
    contains: jest.fn(() => true),
  })),
  bounds: jest.fn(),
  point: jest.fn((x: number, y: number) => ({ x, y })),
  DomUtil: {
    create: jest.fn(),
    remove: jest.fn(),
    addClass: jest.fn(),
    removeClass: jest.fn(),
  },
};

export default L;

// Also export individual items for named imports
export const Icon = MockIcon;
export const LatLng = MockLatLng;
export const Map = MockMap;
export const marker = mockMarker;
export const control = mockControl;
export const tileLayer = mockTileLayer;
