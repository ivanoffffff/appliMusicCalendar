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
  delay = 0 
}) => {
  return (
    <div 
      className={`music-card group relative overflow-hidden animate-entrance-delay-${delay}`}
      style={{ animationDelay: `${delay * 100}ms` }}
    >
      {/* Background gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
      
      <div className="relative">
        {/* Icon */}
        <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        
        {/* Title */}
        <h3 className="text-sm font-medium text-secondary mb-2">
          {title}
        </h3>
        
        {/* Value - Le chiffre principal */}
        <p className="text-3xl font-bold text-primary mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
          {value}
        </p>
        
        {/* Subtitle optionnel */}
        {subtitle && (
          <p className="text-xs text-secondary">
            {subtitle}
          </p>
        )}
      </div>

      {/* Effet de brillance au survol */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      </div>
    </div>
  );
};

export default StatsCard;