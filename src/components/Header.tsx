import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';

interface HeaderProps {
  cartItemsCount: number;
  onCartClick: () => void;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ cartItemsCount, onCartClick, onMenuClick }) => {
  const { siteSettings, loading } = useSiteSettings();

  return (
    <header className="sticky top-0 z-50 bg-captain-navy/95 backdrop-blur-md border-b-2 border-captain-cyan shadow-lg shadow-captain-cyan/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={onMenuClick}
            className="flex items-center space-x-3 group"
          >
            {loading ? (
              <div className="w-10 h-10 bg-captain-blue rounded-full animate-pulse" />
            ) : (
              <img
                src={siteSettings?.site_logo || "/logo.jpg"}
                alt={siteSettings?.site_name || "eL Capitan"}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-captain-gold shadow-md"
                onError={(e) => {
                  e.currentTarget.src = "/logo.jpg";
                }}
              />
            )}
            <div className="flex flex-col items-start">
              <h1 className="text-lg font-outfit font-bold text-captain-gold leading-tight group-hover:text-yellow-300 transition-colors duration-200">
                eL Capitan
              </h1>
              <span className="text-xs text-captain-cyan font-medium tracking-wide">
                Purified Tube Ice
              </span>
            </div>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onCartClick}
              className="relative p-2 text-captain-light hover:text-captain-cyan hover:bg-captain-blue rounded-full transition-all duration-200"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-captain-cyan text-captain-navy text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-bounce-gentle">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
