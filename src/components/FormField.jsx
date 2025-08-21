import React from 'react';

const FormField = ({ 
  label, 
  type = "text", 
  name, 
  value, 
  onChange, 
  error, 
  required = false, 
  placeholder = "", 
  className = "",
  children 
}) => {
  const baseInputStyles = "w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors";
  const normalStyles = "border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white";
  const errorStyles = "border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-600";
  
  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {children || (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`${baseInputStyles} ${error ? errorStyles : normalStyles}`}
        />
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default FormField;
