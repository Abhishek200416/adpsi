import { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, Users, Building2, Loader2, ChevronRight } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const priorityColors = {
  high: 'border-red-500 bg-red-50',
  medium: 'border-amber-500 bg-amber-50',
  low: 'border-blue-500 bg-blue-50'
};

const priorityBadges = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-blue-100 text-blue-700'
};

export const RecommendationAssistant = () => {
  const [userType, setUserType] = useState('citizen');
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  }, [userType]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API}/recommendations`, {
        params: { user_type: userType }
      });
      setRecommendations(response.data);
    } catch (err) {
      setError('Failed to load recommendations');
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-purple-600 p-2 rounded-lg">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-['Manrope'] text-slate-900">
              AI Recommendation Assistant
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Personalized, explainable guidance based on current conditions
            </p>
          </div>
        </div>
      </div>

      {/* User Type Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setUserType('citizen')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            userType === 'citizen'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Users className="h-4 w-4" />
          For Citizens
        </button>
        <button
          onClick={() => setUserType('policymaker')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            userType === 'policymaker'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Building2 className="h-4 w-4" />
          For Policymakers
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && recommendations && (
        <div className="space-y-4">
          {/* Context Banner */}
          <div className="bg-white/80 backdrop-blur rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Current Context</p>
                <p className="text-xs text-slate-500 mt-1">{recommendations.context}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">{Math.round(recommendations.current_aqi)}</div>
                <div className="text-xs text-slate-500">AQI</div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="space-y-3">
            {recommendations.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className={`bg-white border-l-4 rounded-lg p-4 shadow-sm transition-all hover:shadow-md ${priorityColors[rec.priority]}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl" role="img" aria-label="icon">{rec.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-900">{rec.title}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityBadges[rec.priority]}`}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{rec.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>

          {/* Model Info */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-purple-200">
            <span>
              {recommendations.prediction_type === 'ai_enhanced' ? '✨ AI-Enhanced' : '⚙️ Simulation-Based'} • {recommendations.model_version}
            </span>
            <span>{new Date(recommendations.generated_at).toLocaleTimeString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};
