import React, { useState, useEffect } from 'react';
import MobileNav from './MobileNav';
import { Menu } from 'lucide-react';

const Layout = ({ children, navigation, currentPath, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Gestion du scroll pour l'en-tête fixe
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête fixe */}
      <header
        className={`fixed top-0 left-0 right-0 z-30 transition-all duration-200 ${
          isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src="/LOGO CROUS UAM.png" 
              alt="Logo CROUS" 
              className="h-10 w-auto"
            />
            <h1 className="ml-3 text-xl font-semibold text-gray-800 hidden md:block">
              Gestionnaire IT
            </h1>
          </div>

          {/* Menu mobile */}
          <div className="lg:hidden">
            <MobileNav
              links={navigation}
              currentPath={currentPath}
              onNavigate={onNavigate}
              isOpen={isMobileMenuOpen}
              onClose={() => setIsMobileMenuOpen(false)}
            />
          </div>

          {/* Menu desktop */}
          <nav className="hidden lg:flex items-center space-x-4">
            {navigation.map((item) => (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPath === item.path
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="flex items-center">
                  {item.icon && <item.icon className="w-5 h-5 mr-2" />}
                  {item.label}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="pt-16 pb-8 px-4 md:px-6 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
