/* eslint-env jest */
/* global jest */

/**
 * Mock implementation of react-leaflet for Jest testing environment
 *
 * This mock provides testable React components that mimic the structure of
 * react-leaflet components without requiring the actual Leaflet library.
 * This allows tests to run without complex browser APIs and WebGL dependencies.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
 

 

import React from 'react';

/**
 * Mock MapContainer component
 * Renders a div with test attributes and passes through children
 */
export const MapContainer = ({
  children,
  center,
  zoom,
  style,
  scrollWheelZoom,
  maxBounds,
  maxBoundsViscosity,
  ...props
}: any) => {
  return (
    <div
      data-testid="map-container"
      data-center={JSON.stringify(center)}
      data-zoom={zoom}
      data-scroll-wheel-zoom={scrollWheelZoom}
      data-max-bounds={JSON.stringify(maxBounds)}
      data-max-bounds-viscosity={maxBoundsViscosity}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Mock TileLayer component
 * Renders a div representing the tile layer with attribution
 */
export const TileLayer = ({ url, attribution, noWrap, ...props }: any) => {
  return (
    <div
      data-testid="tile-layer"
      data-url={url}
      data-attribution={attribution}
      data-no-wrap={noWrap}
      {...props}
    />
  );
};

/**
 * Mock Marker component
 * Renders a div with position data and passes through children (Popup)
 */
export const Marker = ({ position, children, ...props }: any) => {
  return (
    <div data-testid="marker" data-position={JSON.stringify(position)} {...props}>
      {children}
    </div>
  );
};

/**
 * Mock Popup component
 * Renders the popup content in a testable div
 */
export const Popup = ({ children, ...props }: any) => {
  return (
    <div data-testid="popup" {...props}>
      {children}
    </div>
  );
};

/**
 * Mock useMap hook
 * Returns a mock map instance for tests that use the hook
 */
export const useMap = () => {
  return {
    setView: jest.fn(),
    getCenter: jest.fn(() => ({ lat: 0, lng: 0 })),
    getZoom: jest.fn(() => 10),
    on: jest.fn(),
    off: jest.fn(),
    invalidateSize: jest.fn(),
    fitBounds: jest.fn(),
    panTo: jest.fn(),
    setZoom: jest.fn(),
  };
};

/**
 * Mock useMapEvents hook
 * Returns a mock map instance with event handling
 */
export const useMapEvents = (handlers: Record<string, Function>) => {
  // Call handlers immediately for testing if needed
  return {
    on: jest.fn((event: string, _handler: Function) => {
      if (handlers[event]) {
        // Store for potential testing
      }
    }),
    off: jest.fn(),
  };
};

/**
 * Mock CircleMarker component
 */
export const CircleMarker = ({ center, radius, children, ...props }: any) => {
  return (
    <div
      data-testid="circle-marker"
      data-center={JSON.stringify(center)}
      data-radius={radius}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Mock Polyline component
 */
export const Polyline = ({ positions, ...props }: any) => {
  return <div data-testid="polyline" data-positions={JSON.stringify(positions)} {...props} />;
};

/**
 * Mock Rectangle component
 */
export const Rectangle = ({ bounds, ...props }: any) => {
  return <div data-testid="rectangle" data-bounds={JSON.stringify(bounds)} {...props} />;
};

/**
 * Mock Circle component
 */
export const Circle = ({ center, radius, ...props }: any) => {
  return (
    <div
      data-testid="circle"
      data-center={JSON.stringify(center)}
      data-radius={radius}
      {...props}
    />
  );
};
