import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  subtitle?: string;
  variant?: 'default' | 'accent' | 'success';
}

export function KPICard({ title, value, icon: Icon, trend, subtitle, variant = 'default' }: KPICardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'accent':
        return 'bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20';
      case 'success':
        return 'bg-gradient-to-br from-success/10 to-success/5 border-success/20';
      default:
        return 'bg-card hover:shadow-lg';
    }
  };

  const getIconStyles = () => {
    switch (variant) {
      case 'accent':
        return 'bg-accent text-accent-foreground';
      case 'success':
        return 'bg-success text-success-foreground';
      default:
        return 'bg-primary text-primary-foreground';
    }
  };

  return (
    <Card className={`p-6 transition-all border ${getVariantStyles()}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-3xl font-bold mt-2 text-foreground">{value}</h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
          {trend && (
            <p className="text-sm font-medium text-success mt-2">{trend}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${getIconStyles()}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}
