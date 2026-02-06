import { useState, useEffect } from 'react';
import axios from 'axios';
import { Lightbulb, TrendingUp, Target, AlertCircle, Loader2, RefreshCw } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const InsightsSummary = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API}/insights/summary`);
      setInsights(response.data);
    } catch (err) {
      setError('Failed to load insights');
      console.error('Error fetching insights:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-teal-50 to-blue-50 border border-teal-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-teal-600 p-2 rounded-lg">
            <Lightbulb className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-['Manrope'] text-slate-900">
              Analytical Insights
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              {insights?.prediction_type === 'ai_enhanced' ? 'AI-Powered' : 'Auto-Generated'} summary of current patterns and predictions
            </p>
          </div>
        </div>
        <button
          onClick={fetchInsights}
          className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          title="Refresh insights"
        >
          <RefreshCw className="h-5 w-5 text-teal-600" />
        </button>
      </div>

      {insights && (
        <div className="space-y-4">
          {/* Key Insights Cards */}
          <div className="bg-white/80 backdrop-blur rounded-lg p-4 border border-teal-200">
            <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-teal-600" />
              Key Insights
            </h4>
            <ul className="space-y-2">
              {insights.key_insights.map((insight, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="text-teal-600 font-bold mt-0.5">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Summary Cards Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <span className="text-xs font-medium text-slate-600">DOMINANT SOURCE</span>
              </div>
              <p className="text-lg font-bold text-slate-900">{insights.dominant_source}</p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-medium text-slate-600">TREND</span>
              </div>
              <p className="text-lg font-bold text-slate-900">{insights.trend}</p>
            </div>
          </div>

          {/* Forecast Summary */}
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <h4 className="text-xs font-medium text-slate-600 mb-2">FORECAST SUMMARY</h4>
            <p className="text-sm text-slate-700 leading-relaxed">{insights.forecast_summary}</p>
          </div>

          {/* Recommendation Banner */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-4 text-white">
            <h4 className="text-xs font-medium mb-2 opacity-90">RECOMMENDED ACTION</h4>
            <p className="text-sm font-medium leading-relaxed">{insights.recommendation}</p>
          </div>

          {/* Confidence & Model Info */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-teal-200">
            <div className="flex items-center gap-2">
              <span className="font-medium">Confidence:</span>
              <div className="flex items-center gap-1">
                <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-600"
                    style={{ width: `${insights.confidence * 100}%` }}
                  ></div>
                </div>
                <span>{Math.round(insights.confidence * 100)}%</span>
              </div>
            </div>
            <span>
              {insights.prediction_type === 'ai_enhanced' ? '✨ AI-Enhanced' : '⚙️ Simulation'} • {insights.model_version}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
