import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const getRouteColor = (aqi) => {
  if (aqi <= 100) return '#10B981';
  if (aqi <= 150) return '#F59E0B';
  return '#EF4444';
};

export const SafeRouteMap = ({ route }) => {
  if (!route || !route.route_points) {
    return (
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6" data-testid="safe-route-map-empty">
        <h3 className="text-xl font-semibold font-['Manrope'] mb-4">Safe Route</h3>
        <p className="text-slate-500">Select start and end locations to view route</p>
      </div>
    );
  }

  const center = [
    route.route_points[0].lat,
    route.route_points[0].lng
  ];

  const pathCoordinates = route.route_points.map(p => [p.lat, p.lng]);
  const routeColor = getRouteColor(route.avg_aqi);

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6" data-testid="safe-route-map">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold font-['Manrope']" data-testid="route-title">Recommended Route</h3>
        <div className="flex items-center gap-2">
          <Navigation className="h-4 w-4 text-teal-700" />
          <span className="text-sm font-medium" data-testid="route-avg-aqi">Avg AQI: {Math.round(route.avg_aqi)}</span>
        </div>
      </div>

      <div style={{ height: '400px', width: '100%' }} className="rounded-xl overflow-hidden mb-4">
        <MapContainer
          center={center}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          <Polyline
            positions={pathCoordinates}
            pathOptions={{ color: routeColor, weight: 4, opacity: 0.8 }}
          />
          {route.route_points.map((point, idx) => (
            <Marker key={idx} position={[point.lat, point.lng]}>
              <Popup>
                <div className="text-center">
                  <div className="font-semibold">{idx === 0 ? 'Start' : idx === route.route_points.length - 1 ? 'End' : 'Waypoint'}</div>
                  <div>AQI: {point.aqi}</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="bg-slate-50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="bg-teal-700 p-2 rounded-full">
            <Navigation className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="font-medium text-slate-900 mb-1">Route Recommendation</div>
            <p className="text-sm text-slate-600" data-testid="route-recommendation">{route.recommendation}</p>
          </div>
        </div>
      </div>
    </div>
  );
};