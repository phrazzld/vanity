'use client';

import type { Place } from './data';
import dynamic from 'next/dynamic';

// dynamic load your actual map
const DynamicMap = dynamic(() => import('@/app/components/Map'), {
  ssr: false,
});

interface ClientMapWrapperProps {
  places: Place[];
}

export default function ClientMapWrapper({ places }: ClientMapWrapperProps) {
  return <DynamicMap places={places} />;
}
