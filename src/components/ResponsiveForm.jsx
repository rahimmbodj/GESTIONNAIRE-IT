import React from 'react';

const ResponsiveForm = ({ children, onSubmit }) => {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-white shadow-sm rounded-lg p-4 md:p-6 space-y-4 md:space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {children}
      </div>
    </form>
  );
};

export const FormField = ({ label, error, children }) => {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
};

export const ResponsiveButton = ({ children, variant = 'primary', ...props }) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };

  return (
    <button
      {...props}
      className={`
        w-full md:w-auto px-4 py-2 rounded-lg font-medium
        transition-colors focus:outline-none focus:ring-2
        focus:ring-offset-2 focus:ring-blue-500
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
      `}
    >
      {children}
    </button>
  );
};

export default ResponsiveForm;
