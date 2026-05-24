'use client';

import { useSyncExternalStore } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LocationMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  label?: string;
  height?: string;
}

function LocationMapInner({ lat, lng, zoom, label }: Omit<LocationMapProps, 'height'>) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const L = require('leaflet');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { MapContainer, TileLayer, Marker, Popup } = require('react-leaflet');

  // Create custom icon to avoid the default icon 404 issue
  const customIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={zoom || 15}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution=''
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]} icon={customIcon}>
        <Popup>
          <div className="text-center">
            <p className="font-bold text-sm">{label || 'Incident Location'}</p>
            <p className="text-xs text-gray-600">
              {lat.toFixed(4)}, {lng.toFixed(4)}
            </p>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}

const emptySubscribe = () => () => {};

export function LocationMap({ lat, lng, zoom, label, height = '350px' }: LocationMapProps) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <div style={{ height, width: '100%' }} className="relative">
        <Skeleton className="w-full h-full rounded-lg" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-pulse size-10 mx-auto mb-2 rounded-full bg-blue-200 dark:bg-blue-900/30" />
            <p className="text-sm text-muted-foreground">Loading location...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height, width: '100%' }} className="rounded-lg overflow-hidden">
      <LocationMapInner lat={lat} lng={lng} zoom={zoom} label={label} />
    </div>
  );
}

export default LocationMap;
