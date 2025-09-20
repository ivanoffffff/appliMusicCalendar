import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  type?: 'default' | 'musical' | 'pulse' | 'dots';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '',
  type = 'default'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  if (type === 'musical') {
    return (
      <div className={`flex items-center space-x-1 ${className}`}>
        <div className="flex space-x-1">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-gradient-to-t from-primary-600 to-primary-400 rounded-full animate-pulse"
              style={{
                height: `${12 + i * 4}px`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: '0.6s'
              }}
            />
          ))}
        </div>
        <span className="text-sm text-secondary ml-2">Chargement...</span>
      </div>
    );
  }

  if (type === 'pulse') {
    return (
      <div className={`${sizeClasses[size]} ${className}`}>
        <div className="w-full h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full animate-pulse"></div>
      </div>
    );
  }

  if (type === 'dots') {
    return (
      <div className={`flex space-x-2 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-3 h-3 bg-primary-500 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`animate-spin rounded-full border-2 border-primary-200 border-t-primary-600 dark:border-primary-700 dark:border-t-primary-400 ${sizeClasses[size]} ${className}`} />
  );
};

export default LoadingSpinner;
