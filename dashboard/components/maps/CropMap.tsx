'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapMarker } from '@/lib/types'
import { format } from 'date-fns'

// Fix for default marker icon issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface CropMapProps {
  markers: MapMarker[]
  center?: [number, number]
  zoom?: number
  height?: string
}

// Custom marker icons based on health status
const createCustomIcon = (type: 'healthy' | 'stressed' | 'damaged' | 'critical') => {
  const colors = {
    healthy: '#22c55e',
    stressed: '#eab308',
    damaged: '#f97316',
    critical: '#ef4444',
  }

  const svgIcon = `
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="${colors[type]}" stroke="white" stroke-width="3"/>
      <circle cx="16" cy="16" r="8" fill="white" opacity="0.5"/>
    </svg>
  `

  return L.divIcon({
    html: svgIcon,
    className: 'custom-map-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  })
}

// Component to update map view when markers change
function MapUpdater({ markers }: { markers: MapMarker[] }) {
  const map = useMap()

  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(m => m.position))
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [markers, map])

  return null
}

export default function CropMap({ 
  markers, 
  center = [20.5937, 78.9629], // Center of India
  zoom = 5,
  height = '600px'
}: CropMapProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div 
        className="bg-gray-200 rounded-lg animate-pulse flex items-center justify-center"
        style={{ height }}
      >
        <p className="text-gray-500">Loading map...</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg overflow-hidden shadow-lg" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {markers.length > 0 && <MapUpdater markers={markers} />}
        
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={marker.position}
            icon={createCustomIcon(marker.type)}
          >
            <Popup>
              <div className="w-64">
                <div className="relative h-32 w-full mb-2 bg-gray-200 rounded overflow-hidden">
                  {marker.popupContent.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={marker.popupContent.imageUrl}
                      alt="Crop"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No image
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-gray-900 capitalize">
                    {marker.cropType}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Farmer: {marker.popupContent.farmerName}
                  </p>
                  <p className="text-xs text-gray-500">
                    Captured: {format(new Date(marker.popupContent.capturedAt), 'MMM dd, yyyy')}
                  </p>
                  <div className="pt-2">
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                      marker.type === 'healthy' ? 'bg-green-100 text-green-800' :
                      marker.type === 'stressed' ? 'bg-yellow-100 text-yellow-800' :
                      marker.type === 'damaged' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {marker.type}
                    </span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

