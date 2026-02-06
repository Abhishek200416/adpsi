import { useEffect, useState } from 'react';
import axios from 'axios';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ForecastChart } from '../components/ForecastChart';
import { SourceContribution } from '../components/SourceContribution';
import { ConfidenceIndicator } from '../components/ConfidenceIndicator';
import { PredictionExplanation } from '../components/PredictionExplanation';
import { SeasonalOutlook } from '../components/SeasonalOutlook';
import { MethodologySection } from '../components/MethodologySection';
import { TrendingUp, Brain, AlertCircle, Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Prediction() {
  const [aqiData, setAqiData] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [sources, setSources] = useState(null);
  const [seasonalOutlook, setSeasonalOutlook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [aqiRes, forecastRes, sourcesRes, seasonalRes] = await Promise.all([
        axios.get(`${API}/aqi/current`),
        axios.get(`${API}/aqi/forecast`),
        axios.get(`${API}/aqi/sources`),
        axios.get(`${API}/seasonal-outlook`)
      ]);
      setAqiData(aqiRes.data);
      setForecast(forecastRes.data);
      setSources(sourcesRes.data);
      setSeasonalOutlook(seasonalRes.data);
    } catch (error) {
      console.error('Error fetching prediction data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-teal-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" data-testid="prediction-page">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-3 rounded-xl">
              <Brain className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold font-['Manrope'] text-slate-900" data-testid="prediction-title">
                AI-Powered Predictions
              </h1>
            </div>
          </div>
          <p className="text-slate-600 text-lg" data-testid="prediction-subtitle">
            Machine learning-based air quality forecasting and pollution source analysis
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <TrendingUp className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold font-['Manrope'] text-purple-900 mb-2">Advanced ML Forecasting</h3>
              <p className="text-purple-800 text-sm leading-relaxed">
                Our AI models analyze historical data, weather patterns, traffic conditions, and industrial activity 
                to predict air quality trends up to 72 hours in advance. Use these insights to plan outdoor activities 
                and take preventive health measures.
              </p>
            </div>
          </div>
        </div>

        {/* Forecast Section */}
        <div className="mb-8">
          {forecast && aqiData && (
            <div className="space-y-6">
              <ForecastChart forecast={forecast} currentAQI={aqiData.aqi} />
              
              {/* Forecast Details Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-xl font-semibold font-['Manrope'] mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  Forecast Details
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                    <div className="text-sm text-blue-700 font-medium mb-1">48-Hour Forecast</div>
                    <div className="text-3xl font-bold font-['Manrope'] text-blue-900">{Math.round(forecast.aqi_48h)}</div>
                    <div className="text-sm text-blue-600 mt-1">AQI Level</div>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4">
                    <div className="text-sm text-indigo-700 font-medium mb-1">72-Hour Forecast</div>
                    <div className="text-3xl font-bold font-['Manrope'] text-indigo-900">{Math.round(forecast.aqi_72h)}</div>
                    <div className="text-sm text-indigo-600 mt-1">AQI Level</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                    <div className="text-sm text-purple-700 font-medium mb-1">Trend</div>
                    <div className="text-2xl font-bold font-['Manrope'] text-purple-900 capitalize">{forecast.trend}</div>
                    <div className="text-sm text-purple-600 mt-1">{Math.round(forecast.confidence * 100)}% Confidence</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Source Attribution Section */}
        <div className="mb-8">
          {sources && <SourceContribution sources={sources} />}
        </div>

        {/* Methodology Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-xl font-semibold font-['Manrope'] mb-4">Our Prediction Methodology</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-slate-600">
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Data Sources</h4>
              <ul className="space-y-2 list-disc list-inside">
                <li>Real-time air quality monitoring stations</li>
                <li>Weather and meteorological data</li>
                <li>Traffic density patterns</li>
                <li>Industrial emission reports</li>
                <li>Seasonal agricultural activities</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">ML Techniques</h4>
              <ul className="space-y-2 list-disc list-inside">
                <li>Time-series forecasting algorithms</li>
                <li>Multi-factor regression analysis</li>
                <li>Pattern recognition from historical data</li>
                <li>Source attribution modeling</li>
                <li>Continuous model refinement</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}