import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';

export const ConfidenceIndicator = ({ level, score, explanation }) => {
  const getConfig = () => {
    switch (level?.toLowerCase()) {
      case 'high':
        return {
          icon: CheckCircle,
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
          textColor: 'text-emerald-700',
          iconColor: 'text-emerald-600',
          label: 'High Confidence'
        };
      case 'medium':
        return {
          icon: AlertCircle,
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          textColor: 'text-amber-700',
          iconColor: 'text-amber-600',
          label: 'Medium Confidence'
        };
      case 'low':
        return {
          icon: XCircle,
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          textColor: 'text-orange-700',
          iconColor: 'text-orange-600',
          label: 'Lower Confidence'
        };
      default:
        return {
          icon: AlertCircle,
          bgColor: 'bg-slate-50',
          borderColor: 'border-slate-200',
          textColor: 'text-slate-700',
          iconColor: 'text-slate-600',
          label: 'Confidence'
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <div className={`${config.bgColor} border ${config.borderColor} rounded-lg p-4`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-semibold ${config.textColor}`}>{config.label}</span>
            {score && (
              <span className={`text-sm ${config.textColor} opacity-75`}>
                ({Math.round(score)}%)
              </span>
            )}
          </div>
          <p className={`text-sm ${config.textColor} leading-relaxed`}>
            {explanation}
          </p>
        </div>
      </div>
    </div>
  );
};
