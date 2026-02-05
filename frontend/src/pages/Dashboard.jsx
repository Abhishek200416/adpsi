import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { AQICard } from '../components/AQICard';
import { PollutantBar } from '../components/PollutantBar';
import { MapView } from '../components/MapView';
import { Loader2, TrendingUp, Navigation } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Dashboard() {
  const [aqiData, setAqiData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const aqiRes = await axios.get(`${API}/aqi/current`);
      setAqiData(aqiRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
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

        <div className="mb-8">
          {aqiData && <PollutantBar pollutants={aqiData.pollutants} />}
        </div>

        <div className="mb-8">
          <MapView />
        </div>

        {/* Quick Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Link
            to="/prediction"
            className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white hover:shadow-xl transition-all group"
            data-testid="prediction-card"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold font-['Manrope'] mb-2 group-hover:translate-x-1 transition-transform">
                  View AI Predictions
                </h3>
                <p className="text-purple-100 text-sm">
                  See 48-72 hour forecasts and pollution source analysis
                </p>
              </div>
              <TrendingUp className="h-8 w-8 opacity-80" />
            </div>
          </Link>

          <Link
            to="/directions"
            className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl p-6 text-white hover:shadow-xl transition-all group"
            data-testid="directions-card"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold font-['Manrope'] mb-2 group-hover:translate-x-1 transition-transform">
                  Get Safe Routes
                </h3>
                <p className="text-teal-100 text-sm">
                  Find routes with the best air quality for your journey
                </p>
              </div>
              <Navigation className="h-8 w-8 opacity-80" />
            </div>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
