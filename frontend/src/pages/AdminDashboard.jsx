import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { AQICard } from '../components/AQICard';
import { SourceContribution } from '../components/SourceContribution';
import { ForecastChart } from '../components/ForecastChart';
import { FileText, AlertCircle, CheckCircle, Clock, TrendingDown, Loader2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  viewed: 'bg-blue-100 text-blue-800 border-blue-200',
  processing: 'bg-purple-100 text-purple-800 border-purple-200',
  completed: 'bg-emerald-100 text-emerald-800 border-emerald-200'
};

const STATUS_ICONS = {
  pending: Clock,
  viewed: AlertCircle,
  processing: Loader2,
  completed: CheckCircle
};

const POLICY_OPTIONS = [
  { id: 'odd_even', name: 'Odd-Even Vehicle Policy', description: 'Restrict vehicles based on registration number' },
  { id: 'construction_halt', name: 'Construction Halt', description: 'Temporarily stop construction activities' },
  { id: 'firecracker_ban', name: 'Firecracker Ban', description: 'Ban firecrackers during festivals' },
  { id: 'stubble_control', name: 'Stubble Burning Control', description: 'Incentivize farmers to avoid stubble burning' }
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [aqiData, setAqiData] = useState(null);
  const [sources, setSources] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPolicy, setSelectedPolicy] = useState('odd_even');
  const [policyIntensity, setPolicyIntensity] = useState(0.8);
  const [policyImpact, setPolicyImpact] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [reportsRes, aqiRes, sourcesRes, forecastRes] = await Promise.all([
        axios.get(`${API}/reports`),
        axios.get(`${API}/aqi/current`),
        axios.get(`${API}/aqi/sources`),
        axios.get(`${API}/aqi/forecast`)
      ]);
      setReports(reportsRes.data);
      setAqiData(aqiRes.data);
      setSources(sourcesRes.data);
      setForecast(forecastRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId, newStatus) => {
    try {
      await axios.patch(`${API}/reports/${reportId}/status`, { status: newStatus });
      toast.success(`Report status updated to ${newStatus}`);
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const calculatePolicyImpact = async () => {
    try {
      const response = await axios.post(`${API}/policy/impact`, {
        policy_type: selectedPolicy,
        intensity: policyIntensity
      });
      setPolicyImpact(response.data);
    } catch (error) {
      console.error('Error calculating impact:', error);
      toast.error('Failed to calculate policy impact');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-teal-700" />
      </div>
    );
  }

  const pendingReports = reports.filter(r => r.status === 'pending').length;
  const processingReports = reports.filter(r => r.status === 'processing').length;
  const completedReports = reports.filter(r => r.status === 'completed').length;

  return (
    <div className="min-h-screen bg-slate-50" data-testid="admin-dashboard-page">
      <Navbar isAdmin={true} />
      <Toaster position="top-right" richColors />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-['Manrope'] text-slate-900 mb-2" data-testid="admin-dashboard-title">
            Policy Dashboard
          </h1>
          <p className="text-slate-600">
            Comprehensive insights and decision support for policymakers
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">Pending Reports</span>
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div className="text-3xl font-bold font-['Manrope'] text-slate-900" data-testid="pending-count">{pendingReports}</div>
          </div>

          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">In Progress</span>
              <Loader2 className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-3xl font-bold font-['Manrope'] text-slate-900" data-testid="processing-count">{processingReports}</div>
          </div>

          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">Completed</span>
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="text-3xl font-bold font-['Manrope'] text-slate-900" data-testid="completed-count">{completedReports}</div>
          </div>

          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">Total Reports</span>
              <FileText className="h-5 w-5 text-slate-500" />
            </div>
            <div className="text-3xl font-bold font-['Manrope'] text-slate-900" data-testid="total-count">{reports.length}</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {aqiData && <AQICard aqi={aqiData.aqi} location={aqiData.location} pollutants={aqiData.pollutants} />}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {sources && <SourceContribution sources={sources} />}
          {forecast && aqiData && <ForecastChart forecast={forecast} currentAQI={aqiData.aqi} />}
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 mb-8" data-testid="policy-impact-section">
          <h2 className="text-2xl font-semibold font-['Manrope'] mb-4 flex items-center gap-2">
            <TrendingDown className="h-6 w-6 text-teal-700" />
            Policy Impact Simulator
          </h2>
          <p className="text-slate-600 mb-6">
            Estimate the potential AQI reduction from implementing various policy measures
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Policy Type</label>
              <select
                value={selectedPolicy}
                onChange={(e) => setSelectedPolicy(e.target.value)}
                className="w-full bg-slate-50 border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent rounded-lg p-3"
                data-testid="policy-type-select"
              >
                {POLICY_OPTIONS.map(policy => (
                  <option key={policy.id} value={policy.id}>{policy.name}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-2">
                {POLICY_OPTIONS.find(p => p.id === selectedPolicy)?.description}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Implementation Intensity: {Math.round(policyIntensity * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={policyIntensity}
                onChange={(e) => setPolicyIntensity(parseFloat(e.target.value))}
                className="w-full"
                data-testid="policy-intensity-slider"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
            </div>
          </div>

          <button
            onClick={calculatePolicyImpact}
            className="bg-teal-700 hover:bg-teal-600 text-white rounded-full px-8 py-3 font-medium transition-all shadow-lg hover:shadow-xl mb-6"
            data-testid="calculate-impact-button"
          >
            Calculate Impact
          </button>

          {policyImpact && (
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200 rounded-xl p-6" data-testid="policy-impact-result">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <div className="text-sm text-slate-600 mb-1">Estimated AQI Reduction</div>
                  <div className="text-3xl font-bold font-['Manrope'] text-teal-700" data-testid="impact-reduction">
                    -{policyImpact.estimated_reduction}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">Impact Timeline</div>
                  <div className="text-3xl font-bold font-['Manrope'] text-slate-900" data-testid="impact-timeline">
                    {policyImpact.timeline_days} days
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">Affected Sources</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {policyImpact.affected_sources.map(source => (
                      <span key={source} className="px-3 py-1 bg-teal-700 text-white text-xs rounded-full capitalize">
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-teal-200">
                <p className="text-sm text-slate-700" data-testid="impact-description">{policyImpact.description}</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6" data-testid="reports-list-section">
          <h2 className="text-2xl font-semibold font-['Manrope'] mb-6">Citizen Reports Management</h2>

          {reports.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No reports submitted yet</p>
          ) : (
            <div className="space-y-4">
              {reports.map((report, idx) => {
                const StatusIcon = STATUS_ICONS[report.status] || FileText;
                return (
                  <div
                    key={report.id}
                    className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    data-testid={`report-${idx}`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <StatusIcon className="h-5 w-5 text-slate-400 mt-0.5" />
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900" data-testid={`report-name-${idx}`}>{report.name}</h3>
                            <p className="text-sm text-slate-600">{report.location}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              {report.email} • {report.mobile}
                            </p>
                          </div>
                        </div>

                        {report.description && (
                          <p className="text-sm text-slate-600 ml-8">{report.description}</p>
                        )}

                        <div className="flex items-center gap-4 mt-3 ml-8">
                          <span className="text-xs text-slate-500">
                            Severity: {report.severity}/5
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[report.status]}`} data-testid={`report-status-${idx}`}>
                            {report.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {report.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateReportStatus(report.id, 'viewed')}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                              data-testid={`mark-viewed-${idx}`}
                            >
                              Mark Viewed
                            </button>
                            <button
                              onClick={() => updateReportStatus(report.id, 'processing')}
                              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
                              data-testid={`mark-processing-${idx}`}
                            >
                              Start Processing
                            </button>
                          </>
                        )}
                        {(report.status === 'viewed' || report.status === 'processing') && (
                          <button
                            onClick={() => updateReportStatus(report.id, 'completed')}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition-colors"
                            data-testid={`mark-completed-${idx}`}
                          >
                            Mark Completed
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
