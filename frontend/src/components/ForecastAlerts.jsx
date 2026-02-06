import { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, AlertCircle, Info, TrendingUp, Loader2, Clock } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const severityConfig = {
  critical: {
    icon: AlertTriangle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-500',
    textColor: 'text-red-700',
    badgeColor: 'bg-red-100 text-red-800',
    iconColor: 'text-red-600'
  },
  high: {
    icon: AlertCircle,
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-500',
    textColor: 'text-orange-700',
    badgeColor: 'bg-orange-100 text-orange-800',
    iconColor: 'text-orange-600'
  },
  medium: {
    icon: TrendingUp,
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-500',
    textColor: 'text-amber-700',
    badgeColor: 'bg-amber-100 text-amber-800',
    iconColor: 'text-amber-600'
  },
  low: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-700',
    badgeColor: 'bg-blue-100 text-blue-800',
    iconColor: 'text-blue-600'
  },
  info: {
    icon: Info,
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-300',
    textColor: 'text-slate-700',
    badgeColor: 'bg-slate-100 text-slate-800',
    iconColor: 'text-slate-600'
  }
};

export const ForecastAlerts = () => {
  const [alerts, setAlerts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API}/alerts`);
      setAlerts(response.data);
    } catch (err) {
      setError('Failed to load alerts');
      console.error('Error fetching alerts:', err);
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
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold font-['Manrope'] text-slate-900">
            Forecast-Based Alerts
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            {alerts?.forecast_period} forecast analysis with risk assessment
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Clock className="h-4 w-4" />
          {alerts && new Date(alerts.generated_at).toLocaleTimeString()}
        </div>
      </div>

      <div className="space-y-3">
        {alerts?.alerts.map((alert) => {
          const config = severityConfig[alert.severity] || severityConfig.info;
          const Icon = config.icon;

          return (
            <div
              key={alert.id}
              className={`${config.bgColor} border-l-4 ${config.borderColor} rounded-lg p-4 transition-all hover:shadow-md`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-white/50`}>
                  <Icon className={`h-5 w-5 ${config.iconColor}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-slate-900">{alert.title}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.badgeColor}`}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className={`text-sm ${config.textColor} mb-3`}>{alert.message}</p>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-medium text-slate-600">Time Window:</span>
                      <p className="text-slate-700 mt-1">{alert.time_window}</p>
                    </div>
                    <div>
                      <span className="font-medium text-slate-600">AQI Range:</span>
                      <p className="text-slate-700 mt-1">{alert.aqi_range}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-white/50">
                    <span className="font-medium text-xs text-slate-600">Affected Groups:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {alert.affected_groups.map((group, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-white/60 rounded text-xs text-slate-700"
                        >
                          {group}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Refresh Button */}
      <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between items-center">
        <span className="text-xs text-slate-500">
          Model: {alerts?.prediction_type} • {alerts?.model_version}
        </span>
        <button
          onClick={fetchAlerts}
          className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
        >
          Refresh Alerts
        </button>
      </div>
    </div>
  );
};
