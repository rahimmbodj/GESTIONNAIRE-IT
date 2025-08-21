import React from 'react';

const SkeletonLoader = ({ type = "text", lines = 1, className = "" }) => {
  const baseClass = "animate-pulse bg-gray-200 dark:bg-gray-700 rounded";
  
  const types = {
    text: "h-4 w-full",
    title: "h-6 w-3/4",
    circle: "h-12 w-12 rounded-full",
    button: "h-10 w-24",
    card: "h-32 w-full"
  };

  if (lines > 1) {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array(lines).fill(0).map((_, i) => (
          <div key={i} className={`${baseClass} ${types[type]}`}></div>
        ))}
      </div>
    );
  }

  return <div className={`${baseClass} ${types[type]} ${className}`}></div>;
};

export default SkeletonLoader;
