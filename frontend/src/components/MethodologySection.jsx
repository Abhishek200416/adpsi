import { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';

export const MethodologySection = ({ predictionType = 'simulation', modelVersion = 'v1.0' }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Info className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold font-['Manrope'] text-slate-900">
            How This System Works
          </h3>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
            {predictionType === 'ml' ? 'ML-Powered' : 'Simulation-Based'}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-slate-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-slate-400" />
        )}
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 border-t border-slate-100">
          <div className="space-y-6 pt-4">
            {/* System Version */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-semibold text-slate-900 mb-2 text-sm">System Version</h4>
              <p className="text-sm text-slate-600">
                <span className="font-mono bg-slate-200 px-2 py-1 rounded">{modelVersion}</span>
                {' - '}
                {predictionType === 'ml' 
                  ? 'Using trained machine learning models'
                  : 'Using rule-based simulation with real-world parameters'}
              </p>
            </div>

            {/* Data Sources */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Data Sources</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="text-teal-600 font-bold">•</span>
                  <span><strong>Real-time AQI:</strong> World Air Quality Index (WAQI) API providing live measurements from CPCB monitoring stations across Delhi NCR</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="text-teal-600 font-bold">•</span>
                  <span><strong>Weather Data:</strong> Temperature, humidity, and wind speed from meteorological services affecting pollutant dispersion</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="text-teal-600 font-bold">•</span>
                  <span><strong>Temporal Patterns:</strong> Time-of-day analysis for traffic patterns (rush hours, nighttime reduction)</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="text-teal-600 font-bold">•</span>
                  <span><strong>Seasonal Data:</strong> Historical patterns showing Oct-Dec stubble burning season and monsoon improvements</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="text-teal-600 font-bold">•</span>
                  <span><strong>Pollutant Ratios:</strong> PM2.5, PM10, NO2, CO, SO2, and O3 levels for source attribution</span>
                </li>
              </ul>
            </div>

            {/* Current Approach */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">
                {predictionType === 'ml' ? 'Machine Learning Approach' : 'Simulation Approach'}
              </h4>
              {predictionType === 'ml' ? (
                <div className="space-y-2 text-sm text-slate-600">
                  <p>Our trained ML models use:</p>
                  <ul className="space-y-1.5 ml-4">
                    <li>• <strong>LSTM Networks:</strong> Time-series forecasting for 48-72 hour AQI predictions</li>
                    <li>• <strong>Random Forest:</strong> Source attribution with multi-factor analysis</li>
                    <li>• <strong>Feature Engineering:</strong> Weather interactions, temporal patterns, and seasonal adjustments</li>
                    <li>• <strong>Training Data:</strong> Historical AQI records from 2018-2024 across Delhi NCR</li>
                  </ul>
                  <p className="mt-3">
                    Models are continuously validated and updated quarterly based on prediction accuracy.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 text-sm text-slate-600">
                  <p>Our simulation system uses:</p>
                  <ul className="space-y-1.5 ml-4">
                    <li>• <strong>Rule-Based Logic:</strong> Combines current AQI with weather factors (temp, humidity, wind speed)</li>
                    <li>• <strong>Traffic Hour Adjustments:</strong> +10% during rush hours (7-10 AM, 6-9 PM), -5% during low-traffic hours</li>
                    <li>• <strong>Weather Multipliers:</strong> High temp (+5%), high humidity (+8%), low wind (+12%)</li>
                    <li>• <strong>Pollutant Signatures:</strong> NO2/CO ratios indicate traffic, PM10/PM2.5 ratios show construction dust</li>
                    <li>• <strong>Seasonal Factors:</strong> Stubble burning boost in Oct-Dec, monsoon reduction in Jul-Sep</li>
                  </ul>
                  <p className="mt-3 bg-blue-50 border border-blue-200 rounded p-3">
                    <strong className="text-blue-900">📊 ML Upgrade Path:</strong> The system is designed to seamlessly switch to ML models. 
                    All data structures and API responses are ML-ready. When trained models become available, 
                    predictions will automatically use them without any UI changes.
                  </p>
                </div>
              )}
            </div>

            {/* Confidence Scoring */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Confidence Scoring</h4>
              <div className="space-y-2 text-sm text-slate-600">
                <p>Prediction confidence is calculated based on:</p>
                <ul className="space-y-1.5 ml-4">
                  <li>• Wind speed (stronger winds = higher confidence in dispersion)</li>
                  <li>• AQI stability (extreme values have higher uncertainty)</li>
                  <li>• Weather pattern consistency</li>
                  <li>• Data completeness from monitoring stations</li>
                </ul>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <div className="bg-emerald-50 border border-emerald-200 rounded p-2">
                    <div className="font-semibold text-emerald-700 text-xs">High (80%+)</div>
                    <div className="text-xs text-emerald-600 mt-1">Stable conditions, strong signals</div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded p-2">
                    <div className="font-semibold text-amber-700 text-xs">Medium (60-80%)</div>
                    <div className="text-xs text-amber-600 mt-1">Moderate variability</div>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded p-2">
                    <div className="font-semibold text-orange-700 text-xs">Low (&lt;60%)</div>
                    <div className="text-xs text-orange-600 mt-1">High uncertainty</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Limitations */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-semibold text-amber-900 mb-2 text-sm">Important Notes</h4>
              <ul className="space-y-1.5 text-xs text-amber-800">
                <li>• Predictions are estimates based on available data and should be used as guidance, not absolute forecasts</li>
                <li>• Sudden events (dust storms, festival pollution, policy changes) may cause deviations from predictions</li>
                <li>• Source attribution represents approximate contributions; actual values may vary by location and time</li>
                <li>• Always refer to official CPCB bulletins for emergency health advisories</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
