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
import { ForecastAlerts } from '../components/ForecastAlerts';
import { InsightsSummary } from '../components/InsightsSummary';
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

  const getAQIBgColor = (aqi) => {
    if (aqi <= 50) return 'from-emerald-50 to-emerald-100 border-emerald-200';
    if (aqi <= 100) return 'from-yellow-50 to-yellow-100 border-yellow-200';
    if (aqi <= 150) return 'from-orange-50 to-orange-100 border-orange-200';
    if (aqi <= 200) return 'from-red-50 to-red-100 border-red-200';
    if (aqi <= 300) return 'from-purple-50 to-purple-100 border-purple-200';
    return 'from-red-900 to-red-950 border-red-900';
  };

  const getAQITextColor = (aqi) => {
    if (aqi <= 50) return 'text-emerald-700';
    if (aqi <= 100) return 'text-yellow-700';
    if (aqi <= 150) return 'text-orange-700';
    if (aqi <= 200) return 'text-red-700';
    if (aqi <= 300) return 'text-purple-700';
    return 'text-red-100';
  };

  const getAQITextColorDark = (aqi) => {
    if (aqi <= 50) return 'text-emerald-900';
    if (aqi <= 100) return 'text-yellow-900';
    if (aqi <= 150) return 'text-orange-900';
    if (aqi <= 200) return 'text-red-900';
    if (aqi <= 300) return 'text-purple-900';
    return 'text-white';
  };

  const getAQITextColorMedium = (aqi) => {
    if (aqi <= 50) return 'text-emerald-600';
    if (aqi <= 100) return 'text-yellow-600';
    if (aqi <= 150) return 'text-orange-600';
    if (aqi <= 200) return 'text-red-600';
    if (aqi <= 300) return 'text-purple-600';
    return 'text-red-200';
  };

  const getAQICategory = (aqi) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
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
              <h3 className="font-semibold font-['Manrope'] text-purple-900 mb-2">Advanced ML-Ready Forecasting</h3>
              <p className="text-purple-800 text-sm leading-relaxed">
                Our system analyzes real-time AQI, weather patterns, traffic conditions, and seasonal factors 
                to predict air quality trends up to 72 hours in advance. The simulation-based approach is designed 
                to seamlessly transition to machine learning models when available.
              </p>
            </div>
          </div>
        </div>

        {/* Prediction Explanation Section - NEW */}
        {forecast && (
          <div className="mb-8">
            <PredictionExplanation 
              explanation={forecast.explanation}
              trend={forecast.trend}
              weatherConditions={forecast.weather_conditions}
            />
          </div>
        )}

        {/* Forecast Section with Confidence */}
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
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className={`bg-gradient-to-br ${getAQIBgColor(Math.round(forecast.aqi_48h))} rounded-lg p-4 border`}>
                    <div className={`text-sm ${getAQITextColor(Math.round(forecast.aqi_48h))} font-medium mb-1`}>48-Hour Forecast</div>
                    <div className={`text-3xl font-bold font-['Manrope'] ${getAQITextColorDark(Math.round(forecast.aqi_48h))}`}>{Math.round(forecast.aqi_48h)}</div>
                    <div className={`text-sm ${getAQITextColorMedium(Math.round(forecast.aqi_48h))} mt-1 font-medium`}>{getAQICategory(Math.round(forecast.aqi_48h))}</div>
                  </div>
                  <div className={`bg-gradient-to-br ${getAQIBgColor(Math.round(forecast.aqi_72h))} rounded-lg p-4 border`}>
                    <div className={`text-sm ${getAQITextColor(Math.round(forecast.aqi_72h))} font-medium mb-1`}>72-Hour Forecast</div>
                    <div className={`text-3xl font-bold font-['Manrope'] ${getAQITextColorDark(Math.round(forecast.aqi_72h))}`}>{Math.round(forecast.aqi_72h)}</div>
                    <div className={`text-sm ${getAQITextColorMedium(Math.round(forecast.aqi_72h))} mt-1 font-medium`}>{getAQICategory(Math.round(forecast.aqi_72h))}</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                    <div className="text-sm text-purple-700 font-medium mb-1">Trend</div>
                    <div className="text-2xl font-bold font-['Manrope'] text-purple-900 capitalize">{forecast.trend}</div>
                    <div className="text-sm text-purple-600 mt-1">{Math.round(forecast.confidence)}% Confidence</div>
                  </div>
                </div>

                {/* Confidence Indicator - NEW */}
                <ConfidenceIndicator 
                  level={forecast.confidence_level}
                  score={forecast.confidence}
                  explanation={forecast.confidence_explanation}
                />
              </div>
            </div>
          )}
        </div>

        {/* Seasonal Pollution Outlook - NEW */}
        {seasonalOutlook && (
          <div className="mb-8">
            <SeasonalOutlook seasonalData={seasonalOutlook} />
          </div>
        )}

        {/* Forecast-Based Alerts */}
        <div className="mb-8">
          <ForecastAlerts />
        </div>

        {/* Analytical Insights Summary */}
        <div className="mb-8">
          <InsightsSummary />
        </div>

        {/* Source Attribution Section with Confidence */}
        <div className="mb-8">
          {sources && (
            <div className="space-y-6">
              <SourceContribution sources={sources} />
              
              {/* Source Confidence - NEW */}
              <ConfidenceIndicator 
                level={sources.confidence_level}
                score={sources.confidence}
                explanation={sources.confidence_explanation}
              />
            </div>
          )}
        </div>

        {/* Methodology Section - NEW */}
        {forecast && (
          <div className="mb-8">
            <MethodologySection 
              predictionType={forecast.prediction_type}
              modelVersion={forecast.model_version}
            />
          </div>
        )}

      </div>

      <Footer />
    </div>
  );
}