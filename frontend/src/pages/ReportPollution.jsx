import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { AlertCircle, Upload, MapPin, Loader2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const delhiLocations = [
  'Connaught Place',
  'India Gate',
  'Dwarka',
  'Rohini',
  'Noida',
  'Gurgaon',
  'Vasant Vihar',
  'Karol Bagh',
  'Lajpat Nagar',
  'Janakpuri',
  'Mayur Vihar',
  'Other'
];

export default function ReportPollution() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    location: '',
    severity: 3,
    description: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API}/reports`, formData);
      toast.success('Report submitted successfully! You will receive a confirmation email.');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50" data-testid="report-page">
      <Navbar />
      <Toaster position="top-right" richColors />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-['Manrope'] text-slate-900 mb-2" data-testid="report-title">
            Report Pollution Issue
          </h1>
          <p className="text-slate-600">
            Help us identify and address pollution sources in your area
          </p>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-8">
          <div className="bg-teal-50 border-l-4 border-teal-700 rounded-lg p-4 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-teal-700 mt-0.5" />
              <div>
                <h3 className="font-semibold text-teal-900 mb-1">Your Report Matters</h3>
                <p className="text-sm text-teal-800">
                  Every report helps us build a comprehensive picture of pollution in Delhi NCR.
                  You'll receive email updates on the status of your report.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent rounded-lg p-3"
                  placeholder="Your full name"
                  data-testid="name-input"
                />
              </div>

              <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-slate-700 mb-2">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  required
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent rounded-lg p-3"
                  placeholder="+91 XXXXX XXXXX"
                  data-testid="mobile-input"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-slate-50 border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent rounded-lg p-3"
                placeholder="your.email@example.com"
                data-testid="email-input"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Location *
              </label>
              <select
                id="location"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                className="w-full bg-slate-50 border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent rounded-lg p-3"
                data-testid="location-select"
              >
                <option value="">Select location</option>
                {delhiLocations.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="severity" className="block text-sm font-medium text-slate-700 mb-2">
                Severity Level: {formData.severity} / 5
              </label>
              <input
                type="range"
                id="severity"
                name="severity"
                min="1"
                max="5"
                value={formData.severity}
                onChange={handleChange}
                className="w-full"
                data-testid="severity-slider"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>Minor</span>
                <span>Moderate</span>
                <span>Severe</span>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-slate-50 border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent rounded-lg p-3"
                placeholder="Describe the pollution issue you're experiencing..."
                data-testid="description-textarea"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-700 hover:bg-teal-600 text-white rounded-full px-8 py-4 font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="submit-report-button"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  'Submit Report'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}