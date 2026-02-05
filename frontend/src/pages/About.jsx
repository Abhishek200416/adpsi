import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Wind, Brain, Database, Activity, Shield, Users } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50" data-testid="about-page">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-teal-600 to-teal-700 p-3 rounded-xl">
              <Wind className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold font-['Manrope'] text-slate-900 mb-4" data-testid="about-title">
            About Delhi Air Command
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto" data-testid="about-subtitle">
            Empowering citizens and policymakers with AI-driven insights for cleaner air
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-8 md:p-12 text-white mb-12">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold font-['Manrope'] mb-4">Our Mission</h2>
            <p className="text-lg text-teal-50 leading-relaxed">
              Delhi Air Command is dedicated to combating air pollution through advanced technology and data-driven insights. 
              We provide real-time air quality monitoring, AI-powered predictions, and actionable recommendations to help 
              Delhi NCR residents breathe easier and policymakers make informed decisions.
            </p>
          </div>
        </div>

        {/* Key Features */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold font-['Manrope'] text-slate-900 text-center mb-8">What We Offer</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                <Activity className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold font-['Manrope'] text-slate-900 mb-3">Real-Time Monitoring</h3>
              <p className="text-slate-600 leading-relaxed">
                Access live air quality data from monitoring stations across Delhi NCR, including AQI levels, 
                pollutant concentrations (PM2.5, PM10, NO2, SO2, CO, O3), and health advisories.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                <Brain className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold font-['Manrope'] text-slate-900 mb-3">AI Predictions</h3>
              <p className="text-slate-600 leading-relaxed">
                Our machine learning models analyze historical data, weather patterns, and pollution sources 
                to forecast air quality up to 72 hours in advance with high accuracy.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-lg transition-shadow">
              <div className="bg-emerald-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                <Shield className="h-7 w-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold font-['Manrope'] text-slate-900 mb-3">Smart Routes</h3>
              <p className="text-slate-600 leading-relaxed">
                Plan your travel with our safe route planner that finds paths with the best air quality, 
                helping you minimize pollution exposure during your daily commute.
              </p>
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold font-['Manrope'] text-slate-900 text-center mb-8">Technology We Use</h2>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Database className="h-6 w-6 text-teal-600" />
                  <h3 className="text-xl font-semibold font-['Manrope'] text-slate-900">Data Sources</h3>
                </div>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 mt-1">•</span>
                    <span>World Air Quality Index (WAQI) real-time API</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 mt-1">•</span>
                    <span>Central Pollution Control Board (CPCB) stations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 mt-1">•</span>
                    <span>Weather and meteorological data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 mt-1">•</span>
                    <span>Traffic and industrial emission reports</span>
                  </li>
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Brain className="h-6 w-6 text-purple-600" />
                  <h3 className="text-xl font-semibold font-['Manrope'] text-slate-900">AI & ML Models</h3>
                </div>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>Time-series forecasting for AQI predictions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>Multi-factor regression for source attribution</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>Route optimization algorithms</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>Pattern recognition from historical trends</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Impact Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold font-['Manrope'] text-slate-900 text-center mb-8">Our Impact</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 text-center border border-emerald-200">
              <div className="text-4xl font-bold font-['Manrope'] text-emerald-700 mb-2">24/7</div>
              <div className="text-sm text-emerald-600">Real-time Monitoring</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center border border-blue-200">
              <div className="text-4xl font-bold font-['Manrope'] text-blue-700 mb-2">72h</div>
              <div className="text-sm text-blue-600">Forecast Horizon</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 text-center border border-purple-200">
              <div className="text-4xl font-bold font-['Manrope'] text-purple-700 mb-2">15+</div>
              <div className="text-sm text-purple-600">Monitoring Locations</div>
            </div>
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-6 text-center border border-teal-200">
              <div className="text-4xl font-bold font-['Manrope'] text-teal-700 mb-2">85%</div>
              <div className="text-sm text-teal-600">Prediction Accuracy</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="h-8 w-8 text-teal-600" />
          </div>
          <h2 className="text-3xl font-bold font-['Manrope'] text-slate-900 mb-4">Join the Movement</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-6">
            Help us build a cleaner Delhi by reporting pollution incidents, using our safe routes, 
            and staying informed about air quality. Together, we can make a difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/dashboard"
              className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-full px-8 py-3 font-medium transition-all shadow-lg hover:shadow-xl"
            >
              View Dashboard
            </a>
            <a
              href="/report"
              className="bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-300 rounded-full px-8 py-3 font-medium transition-all shadow-lg hover:shadow-xl"
            >
              Report Pollution
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}