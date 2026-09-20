interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showLabel?: boolean;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  className?: string;
}

const ProgressBar = ({
  value,
  max = 100,
  label,
  showLabel = true,
  color = 'blue',
  className = '',
}: ProgressBarProps) => {
  const percentage = Number.isFinite(value) && Number.isFinite(max) && max > 0 ? Math.max(0, Math.min((value / max) * 100, 100)) : 0;

  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-600',
    red: 'bg-red-600',
    purple: 'bg-purple-600',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm font-semibold text-gray-800">{Math.round(percentage)}%</span>
        </div>
      )}
      <div role="progressbar" aria-label={label || "Progress"} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage} className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
