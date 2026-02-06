import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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

const HeatmapLayer = ({ data }) => {
  const mapRef = useRef(null);
  const heatLayerRef = useRef(null);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !data || data.length === 0) return;

    // Remove existing heat layer
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }

    // Create heat layer
    const heatData = data.map(point => [point.lat, point.lng, point.intensity]);
    heatLayerRef.current = L.heatLayer(heatData, {
      radius: 35,
      blur: 25,
      maxZoom: 13,
      max: 1.0,
      gradient: {
        0.0: '#10B981',
        0.2: '#F59E0B',
        0.4: '#F97316',
        0.6: '#EF4444',
        0.8: '#DC2626',
        1.0: '#7F1D1D'
      }
    }).addTo(map);

    return () => {
      if (heatLayerRef.current && map) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [data]);

  return null;
};

const MapContent = ({ viewMode, heatmapData }) => {
  const mapInstance = useRef(null);

  useEffect(() => {
    if (mapInstance.current) {
      const map = mapInstance.current;
      if (viewMode === 'heatmap' && heatmapData && heatmapData.length > 0) {
        // Create heat layer
        const heatData = heatmapData.map(point => [point.lat, point.lng, point.intensity]);
        const heatLayer = L.heatLayer(heatData, {
          radius: 35,
          blur: 25,
          maxZoom: 13,
          max: 1.0,
          gradient: {
            0.0: '#10B981',
            0.2: '#F59E0B',
            0.4: '#F97316',
            0.6: '#EF4444',
            0.8: '#DC2626',
            1.0: '#7F1D1D'
          }
        });
        heatLayer.addTo(map);
        return () => {
          map.removeLayer(heatLayer);
        };
      }
    }
  }, [viewMode, heatmapData]);

  return (
    <MapContainer
      center={[28.6139, 77.2090]}
      zoom={11}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={false}
      ref={mapInstance}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      {viewMode === 'markers' && locations.map((loc, idx) => (
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
  );
};

export const MapView = ({ center = [28.6139, 77.2090], zoom = 11 }) => {
  const [viewMode, setViewMode] = useState('markers');
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHeatmapData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/aqi/heatmap`);
      setHeatmapData(response.data.points);
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'heatmap') {
      fetchHeatmapData();
    }
  }, [viewMode]);

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6" data-testid="map-view">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold font-['Manrope']" data-testid="map-title">
            Delhi NCR Air Quality Map
          </h3>
          {viewMode === 'heatmap' && (
            <p className="text-sm text-slate-600 mt-1">
              <span className="font-semibold text-red-600">High Pollution Zone Heatmap</span> - Intensity based on AQI severity
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('markers')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'markers'
                ? 'bg-teal-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Markers
          </button>
          <button
            onClick={() => setViewMode('heatmap')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'heatmap'
                ? 'bg-teal-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Heatmap
          </button>
        </div>
      </div>
      
      <div style={{ height: '500px', width: '100%' }} className="rounded-xl overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-white/80 z-[1000] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          </div>
        )}
        <MapContent viewMode={viewMode} heatmapData={heatmapData} />
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
