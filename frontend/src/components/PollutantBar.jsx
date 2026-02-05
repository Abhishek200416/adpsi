import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const PollutantBar = ({ pollutants }) => {
  const data = Object.entries(pollutants)
    .filter(([key, value]) => value > 0)
    .map(([name, value]) => ({
      name: name.toUpperCase(),
      value: value,
      fill: '#64748B'
    }));

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6" data-testid="pollutant-bar-chart">
      <h3 className="text-xl font-semibold font-['Manrope'] mb-4" data-testid="pollutant-chart-title">Pollutant Levels</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 12 }} />
          <YAxis tick={{ fill: '#64748B', fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Bar dataKey="value" fill="#64748B" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};