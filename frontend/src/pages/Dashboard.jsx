import { useEffect, useState } from 'react';
import axios from 'axios';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { AQICard } from '../components/AQICard';
import { PollutantBar } from '../components/PollutantBar';
import { ForecastChart } from '../components/ForecastChart';
import { SourceContribution } from '../components/SourceContribution';
import { MapView } from '../components/MapView';
import { SafeRouteMap } from '../components/SafeRouteMap';
import { AlertTriangle, Navigation, Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const delhiLocations = [
  { name: 'Connaught Place', lat: 28.6315, lng: 77.2167 },
  { name: 'India Gate', lat: 28.6129, lng: 77.2295 },
  { name: 'Dwarka', lat: 28.5921, lng: 77.0460 },
  { name: 'Rohini', lat: 28.7496, lng: 77.0689 },
  { name: 'Noida', lat: 28.5355, lng: 77.3910 },
  { name: 'Gurgaon', lat: 28.4595, lng: 77.0266 }
];

export default function Dashboard() {
  const [aqiData, setAqiData] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [sources, setSources] = useState(null);
  const [loading, setLoading] = useState(true);
  const [routeLoading, setRouteLoading] = useState(false);
  const [safeRoute, setSafeRoute] = useState(null);
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [aqiRes, forecastRes, sourcesRes] = await Promise.all([
        axios.get(`${API}/aqi/current`),
        axios.get(`${API}/aqi/forecast`),
        axios.get(`${API}/aqi/sources`)
      ]);
      setAqiData(aqiRes.data);
      setForecast(forecastRes.data);
      setSources(sourcesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRoute = async () => {
    if (!startLocation || !endLocation) {
      alert('Please select both start and end locations');
      return;
    }

    const start = delhiLocations.find(loc => loc.name === startLocation);
    const end = delhiLocations.find(loc => loc.name === endLocation);

    if (!start || !end) return;

    setRouteLoading(true);
    try {
      const response = await axios.post(`${API}/routes/safe`, {
        start_lat: start.lat,
        start_lng: start.lng,
        end_lat: end.lat,
        end_lng: end.lng
      });
      setSafeRoute(response.data);
    } catch (error) {
      console.error('Error calculating route:', error);
    } finally {
      setRouteLoading(false);
    }
  };

  const getHealthRecommendation = (aqi) => {
    if (aqi <= 50) {
      return { text: 'Air quality is good. Enjoy outdoor activities!', icon: '🌿', color: 'text-emerald-600' };
    } else if (aqi <= 100) {
      return { text: 'Air quality is acceptable. Sensitive groups should limit prolonged outdoor exertion.', icon: '⚠️', color: 'text-amber-600' };
    } else if (aqi <= 150) {
      return { text: 'Unhealthy for sensitive groups. Consider reducing outdoor activities.', icon: '😷', color: 'text-orange-600' };
    } else if (aqi <= 200) {
      return { text: 'Unhealthy. Everyone should reduce outdoor activities. Wear N95 masks.', icon: '🚨', color: 'text-red-600' };
    } else {
      return { text: 'Very unhealthy or hazardous. Avoid outdoor activities. Stay indoors.', icon: '☠️', color: 'text-red-800' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-teal-700" />
      </div>
    );
  }

  const healthRec = aqiData ? getHealthRecommendation(aqiData.aqi) : null;

  return (
    <div className="min-h-screen bg-slate-50" data-testid="dashboard-page">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-['Manrope'] text-slate-900 mb-2" data-testid="dashboard-title">
            Live Air Quality Dashboard
          </h1>
          <p className="text-slate-600" data-testid="dashboard-subtitle">
            Real-time pollution data and AI-powered forecasting for Delhi NCR
          </p>
        </div>

        {healthRec && (
          <div className={`bg-white border-l-4 ${healthRec.color.replace('text-', 'border-')} rounded-xl p-6 mb-8 shadow-sm`} data-testid="health-recommendation">
            <div className="flex items-start gap-4">
              <span className="text-3xl">{healthRec.icon}</span>
              <div>
                <h3 className="font-semibold font-['Manrope'] mb-1">Health Advisory</h3>
                <p className={`${healthRec.color}`}>{healthRec.text}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {aqiData && <AQICard aqi={aqiData.aqi} location={aqiData.location} pollutants={aqiData.pollutants} size="large" />}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {forecast && aqiData && <ForecastChart forecast={forecast} currentAQI={aqiData.aqi} />}
          {sources && <SourceContribution sources={sources} />}
        </div>

        <div className="mb-8">
          {aqiData && <PollutantBar pollutants={aqiData.pollutants} />}
        </div>

        <div className="mb-8">
          <MapView />
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 mb-8" data-testid="route-calculator">
          <h3 className="text-xl font-semibold font-['Manrope'] mb-4 flex items-center gap-2">
            <Navigation className="h-5 w-5 text-teal-700" />
            Safe Route Recommendation
          </h3>
          <p className="text-sm text-slate-600 mb-6">
            Get route recommendations based on real-time AQI levels to minimize pollution exposure.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="start-location">
                Start Location
              </label>
              <select
                id="start-location"
                className="w-full bg-slate-50 border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent rounded-lg p-3"
                value={startLocation}
                onChange={(e) => setStartLocation(e.target.value)}
                data-testid="start-location-select"
              >
                <option value="">Select start location</option>
                {delhiLocations.map((loc) => (
                  <option key={loc.name} value={loc.name}>{loc.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="end-location">
                Destination
              </label>
              <select
                id="end-location"
                className="w-full bg-slate-50 border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent rounded-lg p-3"
                value={endLocation}
                onChange={(e) => setEndLocation(e.target.value)}
                data-testid="end-location-select"
              >
                <option value="">Select destination</option>
                {delhiLocations.map((loc) => (
                  <option key={loc.name} value={loc.name}>{loc.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={calculateRoute}
            disabled={routeLoading}
            className="bg-teal-700 hover:bg-teal-600 text-white rounded-full px-8 py-3 font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="calculate-route-button"
          >
            {routeLoading ? 'Calculating...' : 'Calculate Safe Route'}
          </button>
        </div>

        {safeRoute && (
          <div className="mb-8">
            <SafeRouteMap route={safeRoute} />
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
