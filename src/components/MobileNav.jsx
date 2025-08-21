import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

const MobileNav = ({ links, currentPath, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      {/* Bouton du menu */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 p-2 rounded-lg bg-white shadow-lg"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-gray-800" />
        ) : (
          <Menu className="w-6 h-6 text-gray-800" />
        )}
      </button>

      {/* Menu mobile */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-white">
          <div className="flex flex-col h-full pt-16 pb-6 px-4">
            <div className="flex-1 overflow-y-auto">
              {links.map((link) => (
                <button
                  key={link.path}
                  onClick={() => {
                    onNavigate(link.path);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left py-3 px-4 rounded-lg mb-2 flex items-center ${
                    currentPath === link.path
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {link.icon && <link.icon className="w-5 h-5 mr-3" />}
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileNav;
