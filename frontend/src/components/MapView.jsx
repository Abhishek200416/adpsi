import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const getAQIColor = (aqi) => {
  if (aqi <= 50) return '#10B981';
  if (aqi <= 100) return '#F59E0B';
  if (aqi <= 150) return '#F97316';
  if (aqi <= 200) return '#EF4444';
  if (aqi <= 300) return '#DC2626';
  return '#7F1D1D';
};

const locations = [
  { name: 'Connaught Place', lat: 28.6315, lng: 77.2167, aqi: 165 },
  { name: 'India Gate', lat: 28.6129, lng: 77.2295, aqi: 178 },
  { name: 'Dwarka', lat: 28.5921, lng: 77.0460, aqi: 145 },
  { name: 'Rohini', lat: 28.7496, lng: 77.0689, aqi: 188 },
  { name: 'Noida', lat: 28.5355, lng: 77.3910, aqi: 172 },
  { name: 'Gurgaon', lat: 28.4595, lng: 77.0266, aqi: 156 }
];

export const MapView = ({ center = [28.6139, 77.2090], zoom = 11 }) => {
  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6" data-testid="map-view">
      <h3 className="text-xl font-semibold font-['Manrope'] mb-4" data-testid="map-title">Delhi NCR Air Quality Map</h3>
      <div style={{ height: '500px', width: '100%' }} className="rounded-xl overflow-hidden">
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          {locations.map((loc, idx) => (
            <Circle
              key={idx}
              center={[loc.lat, loc.lng]}
              radius={3000}
              pathOptions={{
                color: getAQIColor(loc.aqi),
                fillColor: getAQIColor(loc.aqi),
                fillOpacity: 0.4,
                weight: 2
              }}
            >
              <Popup>
                <div className="text-center" data-testid={`map-popup-${idx}`}>
                  <strong className="font-['Manrope']">{loc.name}</strong>
                  <div className="text-2xl font-bold font-['Manrope'] mt-2" style={{ color: getAQIColor(loc.aqi) }}>
                    {loc.aqi}
                  </div>
                  <div className="text-xs text-slate-500">AQI</div>
                </div>
              </Popup>
            </Circle>
          ))}
        </MapContainer>
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#10B981' }}></div>
          <span>Good (0-50)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#F59E0B' }}></div>
          <span>Moderate (51-100)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#F97316' }}></div>
          <span>Unhealthy (101-150)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#EF4444' }}></div>
          <span>Very Unhealthy (151+)</span>
        </div>
      </div>
    </div>
  );
};