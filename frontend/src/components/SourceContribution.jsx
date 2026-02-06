import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Factory, Car, Flame, HardHat, TrendingUp } from 'lucide-react';

const COLORS = {
  traffic: '#EF4444',
  industry: '#8B5CF6',
  stubble_burning: '#F59E0B',
  construction: '#06B6D4'
};

const SOURCE_LABELS = {
  traffic: 'Traffic',
  industry: 'Industry',
  stubble_burning: 'Stubble Burning',
  construction: 'Construction/Dust'
};

const SOURCE_ICONS = {
  traffic: Car,
  industry: Factory,
  stubble_burning: Flame,
  construction: HardHat
};

const SOURCE_DESCRIPTIONS = {
  traffic: 'Vehicle emissions including PM2.5, NOx, and CO from transportation',
  industry: 'Industrial emissions from factories, power plants, and manufacturing',
  stubble_burning: 'Agricultural waste burning contributing to seasonal pollution spikes',
  construction: 'Dust and particulate matter from construction sites and road work'
};

export const SourceContribution = ({ sources }) => {
  // Handle ML model not loaded state
  if (sources && sources.prediction_type === 'not_loaded') {
    return (
      <div className="bg-white border-2 border-amber-200 shadow-sm rounded-xl p-6">
        <div className="mb-4">
          <h3 className="text-xl font-semibold font-['Manrope'] mb-2 text-amber-900">
            Pollution Source Attribution
          </h3>
        </div>
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-6 text-center">
          <Factory className="h-12 w-12 text-amber-500 mx-auto mb-3" />
          <h4 className="font-semibold text-amber-900 mb-2">ML Model Not Configured</h4>
          <p className="text-sm text-amber-800">
            {sources.message || 'Source attribution model is not available. Please upload model files to enable predictions.'}
          </p>
        </div>
      </div>
    );
  }

  const data = Object.entries(sources.contributions)
    .map(([key, value]) => ({
      name: SOURCE_LABELS[key] || key,
      key: key,
      value: value,
      fill: COLORS[key] || '#64748B'
    }))
    .sort((a, b) => b.value - a.value);

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6" data-testid="source-contribution-chart">
      <div className="mb-6">
        <h3 className="text-xl font-semibold font-['Manrope'] mb-2" data-testid="source-chart-title">
          Pollution Source Attribution
        </h3>
        <p className="text-sm text-slate-500">
          AI-powered analysis of pollution contributors
        </p>
      </div>

      {/* Dominant Source Highlight */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-purple-600 p-3 rounded-lg">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-xs text-purple-700 font-medium uppercase tracking-wide mb-1">Dominant Source</div>
            <div className="font-bold text-lg text-purple-900 capitalize" data-testid="dominant-source">
              {SOURCE_LABELS[sources.dominant_source] || sources.dominant_source}
            </div>
            <div className="text-xs text-purple-600 mt-1">
              Contributing {sources.contributions[sources.dominant_source]}% to current pollution
            </div>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
          <XAxis 
            type="number" 
            tick={{ fill: '#64748B', fontSize: 12 }} 
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={{ stroke: '#e2e8f0' }}
            label={{ value: 'Contribution (%)', position: 'insideBottom', offset: -5, style: { fill: '#64748B', fontSize: 12 } }}
          />
          <YAxis 
            type="category" 
            dataKey="name" 
            tick={{ fill: '#64748B', fontSize: 13, fontWeight: 500 }} 
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={{ stroke: '#e2e8f0' }}
            width={140}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              padding: '12px'
            }}
            formatter={(value) => [`${value}%`, 'Contribution']}
          />
          <Bar dataKey="value" radius={[0, 8, 8, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Detailed Breakdown */}
      <div className="mt-6 space-y-3">
        {data.map((item) => {
          const Icon = SOURCE_ICONS[item.key] || Car;
          const percentage = (item.value / maxValue) * 100;
          
          return (
            <div key={item.key} className="bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition-colors">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${item.fill}20` }}>
                  <Icon className="h-5 w-5" style={{ color: item.fill }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-900">{item.name}</span>
                    <span className="text-lg font-bold" style={{ color: item.fill }}>{item.value}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: item.fill
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-600">{SOURCE_DESCRIPTIONS[item.key]}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-200 text-center">
        <div className="text-xs text-slate-500">
          Model Confidence: <span className="font-semibold text-slate-700" data-testid="source-confidence">{sources.confidence}%</span>
        </div>
        <div className="text-xs text-slate-400 mt-1">Based on real-time data and ML analysis</div>
      </div>
    </div>
  );
};