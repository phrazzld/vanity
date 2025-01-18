'use client'

import dynamic from 'next/dynamic'

// dynamic load your actual map
const DynamicMap = dynamic(() => import('@/app/components/Map'), {
  ssr: false,
})

export default function ClientMapWrapper() {
  return <DynamicMap />
}
