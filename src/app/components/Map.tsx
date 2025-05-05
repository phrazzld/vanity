'use client';

import { PLACES } from '@/app/map/data';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

// fix default marker icon weirdness in next + leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function WhereIveBeenMap() {
  const centerPosition: [number, number] = [40, -20];

  return (
    <div
      style={{
        width: '100%',
        height: '90vh',
        border: '2px solid hotpink',
        position: 'absolute',
        top: 0,
        left: 0,
      }}
    >
      <MapContainer
        center={centerPosition}
        zoom={3}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={true}
        maxBounds={[
          [-85, -180],
          [85, 180],
        ]} // near full world
        maxBoundsViscosity={1.0} // fully “locks” the user from panning beyond
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          noWrap={true}
          attribution='&copy; <a href="http://openstreetmap.org">openstreetmap</a> contributors'
        />
        {PLACES.map(place => (
          <Marker key={place.id} position={[place.lat, place.lng]}>
            <Popup>
              <strong>{place.name}</strong>
              <br />
              {place.note ? place.note : 'no note'}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
