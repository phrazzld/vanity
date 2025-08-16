// app/map/page.tsx
import { getPlaces } from '@/lib/data';
import ClientMapWrapper from './ClientMapWrapper';

export default function MapPage() {
  const places = getPlaces();
  return <ClientMapWrapper places={places} />;
}
