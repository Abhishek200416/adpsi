import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = {
  traffic: '#64748B',
  industry: '#475569',
  stubble_burning: '#D97706',
  construction: '#B45309'
};

const SOURCE_LABELS = {
  traffic: 'Traffic',
  industry: 'Industry',
  stubble_burning: 'Stubble Burning',
  construction: 'Construction/Dust'
};

export const SourceContribution = ({ sources }) => {
  const data = Object.entries(sources.contributions).map(([key, value]) => ({
    name: SOURCE_LABELS[key] || key,
    value: value,
    fill: COLORS[key] || '#64748B'
  }));

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6" data-testid="source-contribution-chart">
      <h3 className="text-xl font-semibold font-['Manrope'] mb-2" data-testid="source-chart-title">Pollution Source Attribution</h3>
      <p className="text-sm text-slate-500 mb-6">
        Dominant Source: <span className="font-semibold text-slate-700 capitalize" data-testid="dominant-source">
          {SOURCE_LABELS[sources.dominant_source] || sources.dominant_source}
        </span>
      </p>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }}></div>
            <span className="text-sm text-slate-600">{item.name}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 text-center text-xs text-slate-500">
        Model Confidence: <span className="font-semibold" data-testid="source-confidence">{sources.confidence}%</span>
      </div>
    </div>
  );
};