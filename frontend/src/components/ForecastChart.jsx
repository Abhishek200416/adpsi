import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const ForecastChart = ({ forecast, currentAQI }) => {
  const data = [
    { time: 'Now', aqi: currentAQI, label: 'Current' },
    { time: '24h', aqi: (currentAQI + forecast.aqi_48h) / 2, label: '24h' },
    { time: '48h', aqi: forecast.aqi_48h, label: '48 hours' },
    { time: '72h', aqi: forecast.aqi_72h, label: '72 hours' }
  ];

  const getTrendIcon = () => {
    if (forecast.trend === 'increasing') return <TrendingUp className="h-5 w-5 text-red-500" />;
    if (forecast.trend === 'decreasing') return <TrendingDown className="h-5 w-5 text-emerald-500" />;
    return <Minus className="h-5 w-5 text-amber-500" />;
  };

  const getTrendColor = () => {
    if (forecast.trend === 'increasing') return 'text-red-600';
    if (forecast.trend === 'decreasing') return 'text-emerald-600';
    return 'text-amber-600';
  };

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6" data-testid="forecast-chart">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold font-['Manrope']" data-testid="forecast-title">AQI Forecast</h3>
        <div className="flex items-center gap-2">
          {getTrendIcon()}
          <span className={`text-sm font-medium ${getTrendColor()} capitalize`} data-testid="forecast-trend">
            {forecast.trend}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="text-sm text-slate-500 mb-1">48 Hour Forecast</div>
          <div className="text-2xl font-bold font-['Manrope'] text-slate-900" data-testid="forecast-48h">
            {Math.round(forecast.aqi_48h)}
          </div>
        </div>
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="text-sm text-slate-500 mb-1">72 Hour Forecast</div>
          <div className="text-2xl font-bold font-['Manrope'] text-slate-900" data-testid="forecast-72h">
            {Math.round(forecast.aqi_72h)}
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0F766E" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0F766E" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="time" tick={{ fill: '#64748B', fontSize: 12 }} />
          <YAxis tick={{ fill: '#64748B', fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Area
            type="monotone"
            dataKey="aqi"
            stroke="#0F766E"
            strokeWidth={3}
            fill="url(#aqiGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-4 text-center text-sm text-slate-500">
        Confidence: <span className="font-semibold text-slate-700" data-testid="forecast-confidence">{forecast.confidence}%</span>
      </div>
    </div>
  );
};