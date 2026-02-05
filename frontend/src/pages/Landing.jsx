import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wind, TrendingUp, Map, AlertCircle, FileText, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getAQIColor = (aqi) => {
  if (aqi <= 50) return 'from-emerald-500 to-emerald-600';
  if (aqi <= 100) return 'from-amber-500 to-amber-600';
  if (aqi <= 150) return 'from-orange-500 to-orange-600';
  if (aqi <= 200) return 'from-red-500 to-red-600';
  return 'from-red-700 to-red-800';
};

const getAQICategory = (aqi) => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
};

export default function Landing() {
  const [aqiData, setAqiData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAQI();
  }, []);

  const fetchAQI = async () => {
    try {
      const response = await axios.get(`${API}/aqi/current`);
      setAqiData(response.data);
    } catch (error) {
      console.error('Error fetching AQI:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <section
        className="relative bg-slate-900 text-white overflow-hidden"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1766405531756-b1290ba82619?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODh8MHwxfHNlYXJjaHwyfHxkZWxoaSUyMGluZGlhJTIwZ2F0ZSUyMHNtb2clMjBwb2xsdXRpb258ZW58MHx8fHwxNzcwMjkxNTAwfDA&ixlib=rb-4.1.0&q=85)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
        data-testid="hero-section"
      >
        <div className="absolute inset-0 bg-slate-900/80"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-['Manrope'] tracking-tight mb-6" data-testid="hero-title">
              Delhi Air Command
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8" data-testid="hero-description">
              AI-driven pollution monitoring, forecasting, and policy decision support for Delhi NCR.
              Real-time insights to breathe easier.
            </p>

            {!loading && aqiData && (
              <div className="inline-block bg-white/90 backdrop-blur-xl rounded-2xl p-8 mb-8 shadow-2xl" data-testid="hero-aqi-card">
                <div className="text-sm text-slate-600 uppercase tracking-wider mb-2">Current AQI - Delhi NCR</div>
                <div className={`text-6xl font-bold font-['Manrope'] bg-gradient-to-br ${getAQIColor(aqiData.aqi)} bg-clip-text text-transparent mb-2`} data-testid="hero-aqi-value">
                  {Math.round(aqiData.aqi)}
                </div>
                <div className={`inline-block px-4 py-2 rounded-full text-white text-sm font-medium bg-gradient-to-br ${getAQIColor(aqiData.aqi)}`} data-testid="hero-aqi-category">
                  {getAQICategory(aqiData.aqi)}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/dashboard"
                className="bg-teal-700 hover:bg-teal-600 text-white rounded-full px-8 py-3 font-medium transition-all shadow-lg hover:shadow-xl"
                data-testid="hero-dashboard-button"
              >
                View Dashboard
              </Link>
              <Link
                to="/report"
                className="bg-white hover:bg-slate-100 text-slate-900 rounded-full px-8 py-3 font-medium transition-all shadow-lg hover:shadow-xl"
                data-testid="hero-report-button"
              >
                Report Pollution Issue
              </Link>
              <Link
                to="/admin/login"
                className="bg-slate-800 hover:bg-slate-700 text-white rounded-full px-8 py-3 font-medium transition-all shadow-lg hover:shadow-xl border border-slate-700"
                data-testid="hero-admin-button"
              >
                Policy Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white" data-testid="why-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-['Manrope'] text-slate-900 mb-4">Why This Matters</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Delhi NCR faces severe air pollution challenges. Our platform provides real-time insights
              and AI-powered forecasting to help citizens and policymakers take action.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold font-['Manrope'] mb-3">Health Impact</h3>
              <p className="text-slate-600">
                Poor air quality affects millions, leading to respiratory issues and reduced quality of life.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <div className="bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold font-['Manrope'] mb-3">Seasonal Peaks</h3>
              <p className="text-slate-600">
                Winter months and stubble burning season see AQI levels spike to hazardous levels.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <div className="bg-teal-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold font-['Manrope'] mb-3">Data-Driven Action</h3>
              <p className="text-slate-600">
                AI forecasting and source attribution help policymakers make informed decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50" data-testid="features-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-['Manrope'] text-slate-900 mb-4">Platform Features</h2>
            <p className="text-lg text-slate-600">
              Comprehensive tools for citizens, researchers, and policymakers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-br from-teal-700 to-teal-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Wind className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold font-['Manrope'] mb-2">Live AQI Monitoring</h3>
              <p className="text-sm text-slate-600">
                Real-time air quality data from CPCB stations across Delhi NCR with pollutant breakdowns.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-br from-blue-600 to-blue-500 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold font-['Manrope'] mb-2">AI Forecasting</h3>
              <p className="text-sm text-slate-600">
                48-72 hour AQI predictions using LSTM models trained on historical data and weather patterns.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-br from-amber-600 to-amber-500 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Map className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold font-['Manrope'] mb-2">Interactive Maps</h3>
              <p className="text-sm text-slate-600">
                Pollution heatmaps showing AQI levels across different areas with safe route recommendations.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-br from-orange-600 to-orange-500 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold font-['Manrope'] mb-2">Source Attribution</h3>
              <p className="text-sm text-slate-600">
                ML models identify pollution contributions from traffic, industry, stubble burning, and construction.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-br from-red-600 to-red-500 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold font-['Manrope'] mb-2">Citizen Reporting</h3>
              <p className="text-sm text-slate-600">
                Report pollution issues directly with location, photos, and severity ratings.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-br from-purple-600 to-purple-500 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold font-['Manrope'] mb-2">Policy Impact Analysis</h3>
              <p className="text-sm text-slate-600">
                Simulate policy decisions like odd-even schemes to estimate AQI reduction impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-teal-700 to-teal-600 text-white" data-testid="cta-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold font-['Manrope'] mb-6">
            Join the Fight for Cleaner Air
          </h2>
          <p className="text-lg text-teal-100 mb-8 leading-relaxed">
            Every report matters. Every insight counts. Together, we can make Delhi NCR breathe easier.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/dashboard"
              className="bg-white hover:bg-slate-100 text-teal-700 rounded-full px-8 py-3 font-medium transition-all shadow-lg hover:shadow-xl"
              data-testid="cta-dashboard-button"
            >
              Explore Dashboard
            </Link>
            <Link
              to="/report"
              className="bg-teal-800 hover:bg-teal-900 text-white rounded-full px-8 py-3 font-medium transition-all shadow-lg hover:shadow-xl border border-teal-600"
              data-testid="cta-report-button"
            >
              Report an Issue
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
