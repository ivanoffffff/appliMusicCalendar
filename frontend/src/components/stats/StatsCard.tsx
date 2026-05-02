import React from 'react';

interface StatsCardProps {
  title:    string;
  value:    string | number;
  icon:     React.FC<{ className?: string }>;
  subtitle?: string;
  gradient: string;
  glowColor?: string;
  delay?:   number;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  subtitle,
  gradient,
  glowColor,
  delay = 0,
}) => {
  return (
    <div
      className="relative overflow-hidden rounded-2xl group animate-entrance cursor-default transition-all duration-300 hover:-translate-y-1.5"
      style={{
        animationDelay: `${delay * 80}ms`,
        background: 'rgba(255,255,255,0.95)',
      }}
    >
      {/* Light mode card */}
      <div className="block dark:hidden relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300">
        {/* Top accent bar */}
        <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${gradient}`} />

        <div className="relative p-6">
          {/* Icon */}
          <div className={`w-11 h-11 rounded-xl mb-5 flex items-center justify-center bg-gradient-to-br ${gradient} group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-5 h-5 text-white" />
          </div>

          {/* Value */}
          <p className="text-4xl font-black text-gray-900 tracking-tight mb-1 leading-none">
            {value}
          </p>

          {/* Title */}
          <h3 className="text-sm font-semibold text-gray-700 mt-2 mb-1">
            {title}
          </h3>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-xs text-gray-500 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Hover background glow */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-300 pointer-events-none`} />
      </div>

      {/* Dark mode card — premium glass */}
      <div
        className="hidden dark:block relative overflow-hidden rounded-2xl border border-white/8 transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)',
          boxShadow: glowColor
            ? `0 0 30px ${glowColor}18, 0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)`
            : '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        {/* Gradient corner decoration */}
        <div
          className={`absolute -top-8 -right-8 w-32 h-32 rounded-full blur-2xl opacity-20 bg-gradient-to-br ${gradient}`}
        />

        <div className="relative p-6">
          {/* Icon */}
          <div className={`w-11 h-11 rounded-xl mb-5 flex items-center justify-center bg-gradient-to-br ${gradient} group-hover:scale-110 transition-transform duration-300`}
            style={{ boxShadow: glowColor ? `0 4px 12px ${glowColor}40` : undefined }}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>

          {/* Value */}
          <p className="text-4xl font-black text-white tracking-tight mb-1 leading-none">
            {value}
          </p>

          {/* Title */}
          <h3 className="text-sm font-semibold text-slate-300 mt-2 mb-1">
            {title}
          </h3>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-xs text-slate-500 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Shimmer on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
