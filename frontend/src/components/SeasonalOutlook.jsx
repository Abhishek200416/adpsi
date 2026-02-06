import { Calendar, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

export const SeasonalOutlook = ({ seasonalData }) => {
  if (!seasonalData) return null;

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'very_high':
        return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' };
      case 'high':
        return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' };
      case 'moderate':
        return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' };
      case 'low':
        return { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' };
      default:
        return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' };
    }
  };

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <h3 className="text-xl font-semibold font-['Manrope'] mb-4 flex items-center gap-2">
        <Calendar className="h-5 w-5 text-purple-600" />
        Seasonal Pollution Outlook
      </h3>

      {/* Current Season Status */}
      <div className={`${seasonalData.high_risk_season ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'} border rounded-lg p-4 mb-6`}>
        <div className="flex items-start gap-3">
          {seasonalData.high_risk_season ? (
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          ) : (
            <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <h4 className={`font-semibold mb-1 ${seasonalData.high_risk_season ? 'text-red-900' : 'text-emerald-900'}`}>
              {seasonalData.current_month_name} - {seasonalData.high_risk_season ? 'High Risk Season' : 'Better Air Quality Season'}
            </h4>
            <p className={`text-sm ${seasonalData.high_risk_season ? 'text-red-700' : 'text-emerald-700'}`}>
              {seasonalData.current_outlook}
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Trends Chart */}
      <div className="mb-6">
        <h4 className="font-semibold text-slate-900 mb-3 text-sm">Historical Monthly AQI Patterns</h4>
        <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
          {Object.entries(seasonalData.monthly_patterns).map(([month, data]) => {
            const riskColors = getRiskColor(data.risk);
            const isCurrentMonth = parseInt(month) === seasonalData.current_month;
            
            return (
              <div
                key={month}
                className={`relative group cursor-pointer ${isCurrentMonth ? 'ring-2 ring-purple-500' : ''}`}
              >
                <div
                  className={`${riskColors.bg} ${riskColors.border} border rounded-lg p-2 transition-all hover:shadow-md`}
                >
                  <div className="text-xs font-medium text-slate-600 text-center mb-1">
                    {monthNames[parseInt(month) - 1]}
                  </div>
                  <div className={`text-lg font-bold ${riskColors.text} text-center`}>
                    {data.avg_aqi}
                  </div>
                </div>
                
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10 w-48">
                  <div className="bg-slate-900 text-white text-xs rounded-lg p-3 shadow-xl">
                    <div className="font-semibold mb-1">{monthNames[parseInt(month) - 1]}</div>
                    <div className="mb-1">Avg AQI: {data.avg_aqi}</div>
                    <div className="text-slate-300">{data.description}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Risk Seasons Summary */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <h5 className="font-semibold text-red-900 text-sm">High Risk Months</h5>
          </div>
          <div className="flex flex-wrap gap-1 mb-2">
            {seasonalData.high_risk_months.map((month) => (
              <span key={month} className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded">
                {month}
              </span>
            ))}
          </div>
          <p className="text-xs text-red-700">
            Winter months with stubble burning, low temperatures, and poor dispersion lead to severe pollution spikes.
          </p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <h5 className="font-semibold text-emerald-900 text-sm">Better Air Quality</h5>
          </div>
          <div className="flex flex-wrap gap-1 mb-2">
            {seasonalData.low_risk_months.map((month) => (
              <span key={month} className="text-xs bg-emerald-200 text-emerald-800 px-2 py-1 rounded">
                {month}
              </span>
            ))}
          </div>
          <p className="text-xs text-emerald-700">
            Monsoon season brings regular rainfall that washes away pollutants and significantly improves air quality.
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="flex flex-wrap gap-3 justify-center text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-emerald-100 border border-emerald-300 rounded"></div>
            <span className="text-slate-600">Low Risk</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-amber-100 border border-amber-300 rounded"></div>
            <span className="text-slate-600">Moderate</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded"></div>
            <span className="text-slate-600">High Risk</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
            <span className="text-slate-600">Very High Risk</span>
          </div>
        </div>
      </div>
    </div>
  );
};
