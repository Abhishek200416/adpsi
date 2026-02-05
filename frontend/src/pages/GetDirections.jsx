import { useState } from 'react';
import axios from 'axios';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SafeRouteMap } from '../components/SafeRouteMap';
import { Navigation, MapPin, Loader2, AlertCircle, Route } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const delhiLocations = [
  { name: 'Connaught Place', lat: 28.6315, lng: 77.2167 },
  { name: 'India Gate', lat: 28.6129, lng: 77.2295 },
  { name: 'Dwarka', lat: 28.5921, lng: 77.0460 },
  { name: 'Rohini', lat: 28.7496, lng: 77.0689 },
  { name: 'Noida', lat: 28.5355, lng: 77.3910 },
  { name: 'Gurgaon', lat: 28.4595, lng: 77.0266 },
  { name: 'Nehru Place', lat: 28.5494, lng: 77.2501 },
  { name: 'Saket', lat: 28.5244, lng: 77.2066 },
  { name: 'Karol Bagh', lat: 28.6519, lng: 77.1906 },
  { name: 'Lajpat Nagar', lat: 28.5677, lng: 77.2433 }
];

export default function GetDirections() {
  const [routeLoading, setRouteLoading] = useState(false);
  const [safeRoute, setSafeRoute] = useState(null);
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');

  const calculateRoute = async () => {
    if (!startLocation || !endLocation) {
      alert('Please select both start and end locations');
      return;
    }

    if (startLocation === endLocation) {
      alert('Start and end locations must be different');
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
      alert('Failed to calculate safe route. Please try again.');
    } finally {
      setRouteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50" data-testid="directions-page">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-teal-600 to-teal-700 p-3 rounded-xl">
              <Navigation className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold font-['Manrope'] text-slate-900" data-testid="directions-title">
                Safe Route Planner
              </h1>
            </div>
          </div>
          <p className="text-slate-600 text-lg" data-testid="directions-subtitle">
            Find the cleanest air quality routes between locations in Delhi NCR
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <Route className="h-6 w-6 text-teal-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold font-['Manrope'] text-teal-900 mb-2">Smart Route Planning</h3>
              <p className="text-teal-800 text-sm leading-relaxed">
                Our AI analyzes real-time air quality data across multiple monitoring stations to suggest routes 
                with the best air quality. Perfect for cyclists, joggers, and anyone concerned about air pollution exposure.
              </p>
            </div>
          </div>
        </div>

        {/* Route Calculator */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 mb-8" data-testid="route-calculator">
          <h2 className="text-2xl font-semibold font-['Manrope'] mb-6 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-teal-600" />
            Calculate Safe Route
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2" data-testid="start-label">
                Start Location
              </label>
              <select
                value={startLocation}
                onChange={(e) => setStartLocation(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                data-testid="start-location-select"
              >
                <option value="">Select start location</option>
                {delhiLocations.map((loc) => (
                  <option key={loc.name} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2" data-testid="end-label">
                End Location
              </label>
              <select
                value={endLocation}
                onChange={(e) => setEndLocation(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                data-testid="end-location-select"
              >
                <option value="">Select end location</option>
                {delhiLocations.map((loc) => (
                  <option key={loc.name} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={calculateRoute}
            disabled={routeLoading || !startLocation || !endLocation}
            className="w-full md:w-auto bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-full px-8 py-3 font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            data-testid="calculate-route-button"
          >
            {routeLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                <Navigation className="h-5 w-5" />
                Find Safe Route
              </>
            )}
          </button>
        </div>

        {/* Route Result */}
        {safeRoute && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
              <h3 className="text-xl font-semibold font-['Manrope'] mb-4" data-testid="route-details-title">
                Route Details
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4">
                  <div className="text-sm text-emerald-700 font-medium mb-1">Distance</div>
                  <div className="text-3xl font-bold font-['Manrope'] text-emerald-900">
                    {safeRoute.distance ? safeRoute.distance.toFixed(1) : 'N/A'}
                  </div>
                  <div className="text-sm text-emerald-600 mt-1">kilometers</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                  <div className="text-sm text-blue-700 font-medium mb-1">Avg. AQI</div>
                  <div className="text-3xl font-bold font-['Manrope'] text-blue-900">
                    {safeRoute.avg_aqi ? Math.round(safeRoute.avg_aqi) : 'N/A'}
                  </div>
                  <div className="text-sm text-blue-600 mt-1">along route</div>
                </div>
                <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-4">
                  <div className="text-sm text-teal-700 font-medium mb-1">Quality</div>
                  <div className="text-2xl font-bold font-['Manrope'] text-teal-900 capitalize">
                    {safeRoute.quality || 'N/A'}
                  </div>
                  <div className="text-sm text-teal-600 mt-1">route rating</div>
                </div>
              </div>
            </div>

            <SafeRouteMap route={safeRoute} />
          </div>
        )}

        {/* Features Section */}
        <div className="mt-8 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-xl font-semibold font-['Manrope'] mb-4">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-teal-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🗺️</span>
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Real-Time Analysis</h4>
              <p className="text-sm text-slate-600">We analyze current AQI data from monitoring stations along potential routes</p>
            </div>
            <div className="text-center">
              <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🧠</span>
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Smart Algorithm</h4>
              <p className="text-sm text-slate-600">AI optimizes routes to minimize pollution exposure while keeping distance reasonable</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">✅</span>
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Best Path</h4>
              <p className="text-sm text-slate-600">Get a route with the cleanest air quality for your journey</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}