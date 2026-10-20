import { type ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface KpiCardProps {
  title: string;
  value: string | number;
  percentage?: string;
  icon: ReactNode;
  variant: 'blue' | 'green' | 'red' | 'purple';
}

export function KpiCard({ title, value, percentage, icon, variant }: KpiCardProps) {
  const bgColors = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    red: 'bg-red-50',
    purple: 'bg-purple-50'
  };

  const iconColors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    purple: 'text-purple-600'
  };

  const iconBgColors = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    red: 'bg-red-100',
    purple: 'bg-purple-100'
  };

  return (
    <div className={cn("rounded-xl p-5 flex flex-col justify-between border border-slate-100 shadow-sm h-32", bgColors[variant])}>
      <div className="flex items-start justify-between">
        <div className={cn("p-2 rounded-lg", iconBgColors[variant], iconColors[variant])}>
          {icon}
        </div>
      </div>
      
      <div className="mt-2">
        <p className="text-slate-600 text-sm font-medium mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-800">{value}</span>
          {percentage && (
            <span className="text-sm font-medium text-slate-500">{percentage}</span>
          )}
        </div>
      </div>
    </div>
  );
}
