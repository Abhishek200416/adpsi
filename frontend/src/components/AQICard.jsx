import { Droplets } from 'lucide-react';

const getAQIColor = (aqi) => {
  if (aqi <= 50) return 'bg-emerald-500';
  if (aqi <= 100) return 'bg-amber-500';
  if (aqi <= 150) return 'bg-orange-500';
  if (aqi <= 200) return 'bg-red-500';
  if (aqi <= 300) return 'bg-red-700';
  return 'bg-red-900';
};

const getAQICategory = (aqi) => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
};

export const AQICard = ({ aqi, location, pollutants, size = 'default' }) => {
  const colorClass = getAQIColor(aqi);
  const category = getAQICategory(aqi);

  if (size === 'large') {
    return (
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-8" data-testid="aqi-card-large">
        <div className="flex items-center gap-3 mb-6">
          <div className={`${colorClass} p-3 rounded-full`}>
            <Droplets className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold font-['Manrope']" data-testid="aqi-title">Current AQI</h2>
            <p className="text-slate-500 text-sm" data-testid="aqi-location">{location}</p>
          </div>
        </div>

        <div className="flex items-end gap-4 mb-6">
          <div className={`text-6xl font-bold font-['Manrope'] ${colorClass.replace('bg-', 'text-')}`} data-testid="aqi-value">
            {Math.round(aqi)}
          </div>
          <div className="pb-2">
            <span className={`inline-block px-4 py-2 rounded-full text-white text-sm font-medium ${colorClass}`} data-testid="aqi-category">
              {category}
            </span>
          </div>
        </div>

        {pollutants && (
          <div className="grid grid-cols-3 gap-4" data-testid="pollutants-grid">
            {Object.entries(pollutants).map(([key, value]) => (
              value > 0 && (
                <div key={key} className="bg-slate-50 rounded-lg p-3">
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">{key}</div>
                  <div className="text-lg font-semibold font-['Manrope']" data-testid={`pollutant-${key}`}>{value}</div>
                </div>
              )
            ))}
          </div>
        )}
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