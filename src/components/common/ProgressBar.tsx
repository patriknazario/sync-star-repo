import { Progress } from '@/components/ui/progress';

interface ProgressBarProps {
  current: number;
  target: number;
  label?: string;
  showPercentage?: boolean;
  gradient?: boolean;
  compact?: boolean;
}

export function ProgressBar({ current, target, label, showPercentage = true, gradient = false, compact = false }: ProgressBarProps) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">{label}</span>
          {showPercentage && (
            <span className="text-muted-foreground">{percentage.toFixed(1)}%</span>
          )}
        </div>
      )}
      
      <div className="relative">
        <Progress value={percentage} className="h-3" />
        {gradient && (
          <div 
            className="absolute top-0 left-0 h-3 rounded-full bg-gradient-primary transition-all"
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
      
      {compact ? (
        <p className="text-sm font-semibold text-center text-accent">
          {percentage.toFixed(1)}%
        </p>
      ) : (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatCurrency(current)}</span>
          <span>Meta: {formatCurrency(target)}</span>
        </div>
      )}
    </div>
  );
}
