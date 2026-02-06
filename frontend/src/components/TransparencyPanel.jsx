import { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronUp, Database, Cpu, TrendingUp, AlertTriangle, Clock, Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const TransparencyPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [transparency, setTransparency] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && !transparency) {
      fetchTransparency();
    }
  }, [isOpen]);

  const fetchTransparency = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API}/model/transparency`);
      setTransparency(response.data);
    } catch (err) {
      setError('Failed to load transparency information');
      console.error('Error fetching transparency:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-2 rounded-lg">
            <Database className="h-5 w-5 text-slate-600" />
          </div>
          <div className="text-left">
            <h3 className="font-bold font-['Manrope'] text-slate-900">
              Data & Model Transparency
            </h3>
            <p className="text-sm text-slate-600 mt-0.5">
              Learn about our data sources, methodology, and ML upgrade path
            </p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-slate-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-slate-400" />
        )}
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="px-6 pb-6 border-t border-slate-200">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4 text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && transparency && (
            <div className="space-y-6 mt-6">
              {/* Data Sources */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Database className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-slate-900">Data Sources</h4>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {transparency.data_sources.map((source, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <h5 className="font-semibold text-slate-900 mb-2">{source.name}</h5>
                      <div className="space-y-1 text-sm text-slate-600">
                        <p><span className="font-medium">Type:</span> {source.type}</p>
                        <p><span className="font-medium">Coverage:</span> {source.coverage}</p>
                        <p><span className="font-medium">Updates:</span> {source.update_frequency}</p>
                        <div className="mt-2 pt-2 border-t border-slate-200">
                          <span className="font-medium">Parameters:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {source.parameters.map((param, pidx) => (
                              <span
                                key={pidx}
                                className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs"
                              >
                                {param}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Model Approach */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Cpu className="h-5 w-5 text-purple-600" />
                  <h4 className="font-semibold text-slate-900">Current Model Approach</h4>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <p className="font-semibold text-purple-900 mb-2">{transparency.model_approach}</p>
                  <p className="text-sm text-slate-600">{transparency.current_version}</p>
                </div>
              </div>

              {/* ML Upgrade Path */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-slate-900">Machine Learning Upgrade Path</h4>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-line">
                    {transparency.ml_upgrade_path}
                  </div>
                </div>
              </div>

              {/* Limitations */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <h4 className="font-semibold text-slate-900">Current Limitations</h4>
                </div>
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <ul className="space-y-2">
                    {transparency.limitations.map((limitation, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-amber-900">
                        <span className="text-amber-600 font-bold mt-0.5">•</span>
                        <span>{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Update Frequency */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-5 w-5 text-teal-600" />
                  <h4 className="font-semibold text-slate-900">Update Frequency</h4>
                </div>
                <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
                  <p className="text-sm text-teal-900">{transparency.update_frequency}</p>
                </div>
              </div>

              {/* Footer Note */}
              <div className="bg-slate-100 rounded-lg p-4 border border-slate-200">
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Note:</strong> This platform is designed with ML-readiness at its core. 
                  All API endpoints and data structures are built to support seamless transition 
                  from simulation-based models to trained ML models without disrupting the user experience. 
                  The architecture ensures that model upgrades can be deployed transparently, maintaining 
                  consistent interfaces and response formats.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
