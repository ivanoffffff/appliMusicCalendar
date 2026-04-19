import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  subtitle?: string;
  gradient: string;
  delay?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  subtitle,
  gradient,
  delay = 0,
}) => {
  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700/50 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group animate-entrance"
      style={{ animationDelay: `${delay * 80}ms` }}
    >
      {/* Gradient top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${gradient}`} />

      {/* Background glow on hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-[0.05] transition-opacity duration-400 pointer-events-none`}
      />

      <div className="relative p-6">
        {/* Icon */}
        <div className="text-3xl mb-5 group-hover:scale-110 transition-transform duration-300 origin-left">
          {icon}
        </div>

        {/* Value */}
        <p className="text-4xl font-black text-primary tracking-tight mb-1 leading-none">
          {value}
        </p>

        {/* Title */}
        <h3 className="text-sm font-semibold text-primary mt-2 mb-1">
          {title}
        </h3>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-xs text-secondary leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* Shimmer on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>
    </div>
  );
};

export default StatsCard;
