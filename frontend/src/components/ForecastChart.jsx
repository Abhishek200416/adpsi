import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Clock } from 'lucide-react';
import { useState } from 'react';

export const ForecastChart = ({ forecast, currentAQI }) => {
  const [viewMode, setViewMode] = useState('trend'); // 'trend' or 'hourly'

  // Generate hourly data for 72 hours
  const generateHourlyData = () => {
    const hours = [];
    const now = new Date();
    
    for (let i = 0; i <= 72; i += 6) {
      const futureTime = new Date(now.getTime() + i * 60 * 60 * 1000);
      let aqi;
      
      if (i === 0) {
        aqi = currentAQI;
      } else if (i <= 24) {
        aqi = currentAQI + ((forecast.aqi_48h - currentAQI) / 48) * i;
      } else if (i <= 48) {
        aqi = currentAQI + ((forecast.aqi_48h - currentAQI) / 48) * 48 + ((forecast.aqi_48h - currentAQI) / 24) * (i - 24) * 0.3;
      } else {
        const trend48to72 = forecast.aqi_72h - forecast.aqi_48h;
        aqi = forecast.aqi_48h + (trend48to72 / 24) * (i - 48);
      }
      
      hours.push({
        time: i === 0 ? 'Now' : `+${i}h`,
        hour: futureTime.getHours(),
        aqi: Math.round(aqi),
        fullTime: futureTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      });
    }
    return hours;
  };

  const data = [
    { time: 'Now', aqi: currentAQI, label: 'Current' },
    { time: '24h', aqi: (currentAQI + forecast.aqi_48h) / 2, label: '24h' },
    { time: '48h', aqi: forecast.aqi_48h, label: '48 hours' },
    { time: '72h', aqi: forecast.aqi_72h, label: '72 hours' }
  ];

  const hourlyData = generateHourlyData();

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

  const getAQIColor = (aqi) => {
    if (aqi <= 50) return '#10B981';      // Green - Good
    if (aqi <= 100) return '#F59E0B';     // Yellow - Moderate
    if (aqi <= 150) return '#F97316';     // Orange - Unhealthy for Sensitive
    if (aqi <= 200) return '#EF4444';     // Red - Unhealthy
    if (aqi <= 300) return '#9333EA';     // Purple - Very Unhealthy
    return '#991B1B';                     // Maroon - Hazardous
  };

  const getAQICategory = (aqi) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  const getAQIBgColor = (aqi) => {
    if (aqi <= 50) return 'from-emerald-50 to-emerald-100 border-emerald-200';
    if (aqi <= 100) return 'from-yellow-50 to-yellow-100 border-yellow-200';
    if (aqi <= 150) return 'from-orange-50 to-orange-100 border-orange-200';
    if (aqi <= 200) return 'from-red-50 to-red-100 border-red-200';
    if (aqi <= 300) return 'from-purple-50 to-purple-100 border-purple-200';
    return 'from-red-900 to-red-950 border-red-900';
  };

  const getAQITextColor = (aqi) => {
    if (aqi <= 50) return 'text-emerald-700';
    if (aqi <= 100) return 'text-yellow-700';
    if (aqi <= 150) return 'text-orange-700';
    if (aqi <= 200) return 'text-red-700';
    if (aqi <= 300) return 'text-purple-700';
    return 'text-red-100';
  };

  const getAQITextColorDark = (aqi) => {
    if (aqi <= 50) return 'text-emerald-900';
    if (aqi <= 100) return 'text-yellow-900';
    if (aqi <= 150) return 'text-orange-900';
    if (aqi <= 200) return 'text-red-900';
    if (aqi <= 300) return 'text-purple-900';
    return 'text-white';
  };

  const getAQITextColorMedium = (aqi) => {
    if (aqi <= 50) return 'text-emerald-600';
    if (aqi <= 100) return 'text-yellow-600';
    if (aqi <= 150) return 'text-orange-600';
    if (aqi <= 200) return 'text-red-600';
    if (aqi <= 300) return 'text-purple-600';
    return 'text-red-200';
  };

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6" data-testid="forecast-chart">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold font-['Manrope']" data-testid="forecast-title">AQI Forecast</h3>
          <p className="text-sm text-slate-500 mt-1">Machine learning prediction for next 72 hours</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${getTrendColor()} capitalize`} data-testid="forecast-trend">
              {forecast.trend}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('trend')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'trend'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Trend View
            </button>
            <button
              onClick={() => setViewMode('hourly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'hourly'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Hourly View
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className={`bg-gradient-to-br ${getAQIBgColor(Math.round((currentAQI + forecast.aqi_48h) / 2))} rounded-lg p-4`}>
          <div className={`text-xs ${getAQITextColor(Math.round((currentAQI + forecast.aqi_48h) / 2))} font-medium mb-1 uppercase tracking-wide`}>24 Hour Forecast</div>
          <div className={`text-3xl font-bold font-['Manrope'] ${getAQITextColorDark(Math.round((currentAQI + forecast.aqi_48h) / 2))}`} data-testid="forecast-24h">
            {Math.round((currentAQI + forecast.aqi_48h) / 2)}
          </div>
          <div className={`text-xs ${getAQITextColorMedium(Math.round((currentAQI + forecast.aqi_48h) / 2))} mt-1 font-medium`}>
            {getAQICategory(Math.round((currentAQI + forecast.aqi_48h) / 2))}
          </div>
        </div>
        <div className={`bg-gradient-to-br ${getAQIBgColor(Math.round(forecast.aqi_48h))} rounded-lg p-4`}>
          <div className={`text-xs ${getAQITextColor(Math.round(forecast.aqi_48h))} font-medium mb-1 uppercase tracking-wide`}>48 Hour Forecast</div>
          <div className={`text-3xl font-bold font-['Manrope'] ${getAQITextColorDark(Math.round(forecast.aqi_48h))}`} data-testid="forecast-48h">
            {Math.round(forecast.aqi_48h)}
          </div>
          <div className={`text-xs ${getAQITextColorMedium(Math.round(forecast.aqi_48h))} mt-1 font-medium`}>
            {getAQICategory(Math.round(forecast.aqi_48h))}
          </div>
        </div>
        <div className={`bg-gradient-to-br ${getAQIBgColor(Math.round(forecast.aqi_72h))} rounded-lg p-4`}>
          <div className={`text-xs ${getAQITextColor(Math.round(forecast.aqi_72h))} font-medium mb-1 uppercase tracking-wide`}>72 Hour Forecast</div>
          <div className={`text-3xl font-bold font-['Manrope'] ${getAQITextColorDark(Math.round(forecast.aqi_72h))}`} data-testid="forecast-72h">
            {Math.round(forecast.aqi_72h)}
          </div>
          <div className={`text-xs ${getAQITextColorMedium(Math.round(forecast.aqi_72h))} mt-1 font-medium`}>
            {getAQICategory(Math.round(forecast.aqi_72h))}
          </div>
        </div>
      </div>

      {viewMode === 'trend' ? (
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0F766E" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0F766E" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis 
              dataKey="time" 
              tick={{ fill: '#64748B', fontSize: 13, fontWeight: 500 }} 
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis 
              tick={{ fill: '#64748B', fontSize: 13 }} 
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={{ stroke: '#e2e8f0' }}
              label={{ value: 'AQI Level', angle: -90, position: 'insideLeft', style: { fill: '#64748B', fontSize: 12 } }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                padding: '12px'
              }}
              labelStyle={{ fontWeight: 600, marginBottom: '4px' }}
            />
            <Area
              type="monotone"
              dataKey="aqi"
              stroke="#0F766E"
              strokeWidth={3}
              fill="url(#aqiGradient)"
              dot={{ fill: '#0F766E', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-4 text-sm text-slate-600">
            <Clock className="h-4 w-4" />
            <span>6-hour interval predictions</span>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis 
                dataKey="time" 
                tick={{ fill: '#64748B', fontSize: 11 }} 
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis 
                tick={{ fill: '#64748B', fontSize: 12 }} 
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={{ stroke: '#e2e8f0' }}
                label={{ value: 'AQI', angle: -90, position: 'insideLeft', style: { fill: '#64748B', fontSize: 11 } }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  padding: '12px'
                }}
                labelStyle={{ fontWeight: 600, marginBottom: '4px' }}
              />
              <Bar 
                dataKey="aqi" 
                fill="#0F766E"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between text-sm">
        <div className="text-slate-500">
          Model Confidence: <span className="font-semibold text-slate-700" data-testid="forecast-confidence">{forecast.confidence}%</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span>Good (0-50)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span>Moderate (51-100)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>Unhealthy (101-150)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Very Unhealthy (151+)</span>
          </div>
        </div>
      </div>
    </div>
  );
};