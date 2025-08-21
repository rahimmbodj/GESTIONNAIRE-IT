import React from 'react';
import { CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react';

const FeedbackMessage = ({ type = "info", message, onClose }) => {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
    warning: AlertCircle
  };

  const styles = {
    success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
  };

  const Icon = icons[type];

  return (
    <div className={`flex items-center p-4 mb-4 rounded-lg ${styles[type]} animate-fadeIn`}>
      <Icon className="w-5 h-5 mr-3" />
      <span className="flex-1">{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-auto">
          <XCircle className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default FeedbackMessage;
