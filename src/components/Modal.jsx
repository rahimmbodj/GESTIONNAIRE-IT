import React from 'react';
import { X as CloseIcon } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Fond sombre avec animation */}
        <div 
          className="modal-overlay"
          onClick={onClose}
        />
        
        {/* Contenu modal avec animation */}
        <div className="glass-modal animate-slideIn">
          {/* En-tête */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <CloseIcon className="w-5 h-5 text-white" />
            </button>
          </div>
          
          {/* Corps */}
          <div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
