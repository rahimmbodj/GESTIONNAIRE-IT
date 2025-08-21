import React from 'react';

const LoadingSpinner = ({ size = "medium", color = "blue" }) => {
  const sizeClasses = {
    small: "h-4 w-4",
    medium: "h-8 w-8",
    large: "h-12 w-12"
  };

  const colorClasses = {
    blue: "border-blue-500",
    green: "border-green-500",
    orange: "border-orange-500"
  };

  return (
    <div className="flex justify-center items-center">
      <div className={`animate-spin rounded-full border-2 border-t-transparent ${sizeClasses[size]} ${colorClasses[color]}`}></div>
    </div>
  );
};

export default LoadingSpinner;
