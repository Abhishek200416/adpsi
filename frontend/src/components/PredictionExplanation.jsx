import { TrendingUp, TrendingDown, Minus, Cloud, Wind, Droplets, Clock } from 'lucide-react';

export const PredictionExplanation = ({ explanation, trend, weatherConditions }) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'increasing':
        return { icon: TrendingUp, color: 'text-red-600', bg: 'bg-red-50', label: 'Worsening' };
      case 'decreasing':
        return { icon: TrendingDown, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Improving' };
      default:
        return { icon: Minus, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Stable' };
    }
  };

  const trendConfig = getTrendIcon();
  const TrendIcon = trendConfig.icon;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <h3 className="text-xl font-semibold font-['Manrope'] mb-4 flex items-center gap-2">
        <div className={`${trendConfig.bg} p-2 rounded-lg`}>
          <TrendIcon className={`h-5 w-5 ${trendConfig.color}`} />
        </div>
        Why Air Quality is {trendConfig.label}
      </h3>

      {/* Main Explanation */}
      <div className="bg-slate-50 rounded-lg p-4 mb-6">
        <p className="text-slate-700 leading-relaxed">{explanation}</p>
      </div>

      {/* Weather Factors Card */}
      {weatherConditions && (
        <div className="border-t border-slate-200 pt-6">
          <h4 className="font-semibold text-slate-900 mb-4 text-sm">Current Weather Factors</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
              <div className="flex items-center gap-2 mb-1">
                <Cloud className="h-4 w-4 text-orange-600" />
                <span className="text-xs text-orange-700 font-medium">Temperature</span>
              </div>
              <div className="text-2xl font-bold text-orange-900">{weatherConditions.temperature}°C</div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <Droplets className="h-4 w-4 text-blue-600" />
                <span className="text-xs text-blue-700 font-medium">Humidity</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">{weatherConditions.humidity}%</div>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-3 border border-teal-200">
              <div className="flex items-center gap-2 mb-1">
                <Wind className="h-4 w-4 text-teal-600" />
                <span className="text-xs text-teal-700 font-medium">Wind Speed</span>
              </div>
              <div className="text-2xl font-bold text-teal-900">{weatherConditions.wind_speed} km/h</div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-purple-600" />
                <span className="text-xs text-purple-700 font-medium">Time</span>
              </div>
              <div className="text-2xl font-bold text-purple-900">
                {weatherConditions.hour_of_day}:00
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
