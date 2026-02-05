import { Droplets, Wind, AlertTriangle } from 'lucide-react';

const getAQIColor = (aqi) => {
  if (aqi <= 50) return 'bg-emerald-500';
  if (aqi <= 100) return 'bg-amber-500';
  if (aqi <= 150) return 'bg-orange-500';
  if (aqi <= 200) return 'bg-red-500';
  if (aqi <= 300) return 'bg-red-700';
  return 'bg-red-900';
};

const getAQIGradient = (aqi) => {
  if (aqi <= 50) return 'from-emerald-500 to-emerald-600';
  if (aqi <= 100) return 'from-amber-500 to-amber-600';
  if (aqi <= 150) return 'from-orange-500 to-orange-600';
  if (aqi <= 200) return 'from-red-500 to-red-600';
  if (aqi <= 300) return 'from-red-700 to-red-800';
  return 'from-red-900 to-red-950';
};

const getAQICategory = (aqi) => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
};

const getAQIDescription = (aqi) => {
  if (aqi <= 50) return 'Air quality is satisfactory, and air pollution poses little or no risk.';
  if (aqi <= 100) return 'Air quality is acceptable. However, there may be a risk for some people.';
  if (aqi <= 150) return 'Members of sensitive groups may experience health effects.';
  if (aqi <= 200) return 'Everyone may begin to experience health effects.';
  if (aqi <= 300) return 'Health alert: The risk of health effects is increased for everyone.';
  return 'Health warning of emergency conditions: everyone is more likely to be affected.';
};

export const AQICard = ({ aqi, location, pollutants, size = 'default' }) => {
  const colorClass = getAQIColor(aqi);
  const gradientClass = getAQIGradient(aqi);
  const category = getAQICategory(aqi);
  const description = getAQIDescription(aqi);

  if (size === 'large') {
    return (
      <div className="col-span-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 shadow-2xl text-white overflow-hidden relative" data-testid="aqi-card-large">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className={`bg-gradient-to-br ${gradientClass} p-4 rounded-2xl shadow-lg`}>
                <Wind className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold font-['Manrope']" data-testid="aqi-title">Current Air Quality</h2>
                <p className="text-slate-300 text-lg flex items-center gap-2 mt-1" data-testid="aqi-location">
                  <span className="text-teal-400">📍</span> {location}
                </p>
              </div>
            </div>
            <div className={`px-6 py-3 rounded-full bg-gradient-to-r ${gradientClass} shadow-lg`} data-testid="aqi-category">
              <span className="text-white font-bold text-lg">{category}</span>
            </div>
          </div>

          <div className="flex items-center gap-8 mb-6">
            <div>
              <div className="text-sm text-slate-400 uppercase tracking-wider mb-2">AQI Index</div>
              <div className={`text-8xl font-black font-['Manrope'] bg-gradient-to-br ${gradientClass} bg-clip-text text-transparent`} data-testid="aqi-value">
                {Math.round(aqi)}
              </div>
            </div>
            <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-amber-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Health Impact</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">{description}</p>
                </div>
              </div>
            </div>
          </div>

          {pollutants && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-slate-200">Pollutant Levels</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" data-testid="pollutants-grid">
                {Object.entries(pollutants).map(([key, value]) => (
                  value > 0 && (
                    <div key={key} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                      <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">{key}</div>
                      <div className="text-2xl font-bold font-['Manrope'] text-white" data-testid={`pollutant-${key}`}>{value}</div>
                      <div className="text-xs text-slate-400 mt-1">µg/m³</div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6" data-testid="aqi-card">
      <div className="flex items-center justify-between mb-4">
        <div className={`${colorClass} p-2 rounded-full`}>
          <Droplets className="h-5 w-5 text-white" />
        </div>
        <span className={`px-3 py-1 rounded-full text-white text-xs font-medium ${colorClass}`} data-testid="aqi-category-small">
          {category}
        </span>
      </div>
      <div className={`text-4xl font-bold font-['Manrope'] mb-2 ${colorClass.replace('bg-', 'text-')}`} data-testid="aqi-value-small">
        {Math.round(aqi)}
      </div>
      <p className="text-sm text-slate-600" data-testid="aqi-location-small">{location}</p>
    </div>
  );
};