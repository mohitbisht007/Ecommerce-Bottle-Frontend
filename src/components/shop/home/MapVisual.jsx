"use client";
import { MapContainer, TileLayer, Polyline, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapVisual({ hubCoords, userCoords, resultColor }) {
  return (
    <MapContainer 
      center={hubCoords} 
      zoom={10} 
      zoomControl={false} 
      style={{ height: '100%', width: '100%', filter: 'invert(100%) hue-rotate(180deg) brightness(95%) contrast(85%)' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      {/* Hub Marker */}
      <CircleMarker center={hubCoords} radius={8} pathOptions={{ color: '#ec4899', fillColor: '#ec4899', fillOpacity: 1 }} />
      
      {userCoords && (
        <>
          {/* Destination Marker */}
          <CircleMarker center={userCoords} radius={6} pathOptions={{ color: resultColor || '#ec4899', fillColor: resultColor || '#ec4899', fillOpacity: 1 }} />
          
          {/* Dynamic Route Line */}
          <Polyline 
            positions={[hubCoords, userCoords]} 
            pathOptions={{ color: resultColor || '#ec4899', weight: 3, dashArray: '8, 12' }} 
            className="animated-polyline"
          />
        </>
      )}
    </MapContainer>
  );
}