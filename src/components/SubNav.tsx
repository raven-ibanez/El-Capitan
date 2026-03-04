import React from 'react';
import { useCategories } from '../hooks/useCategories';

interface SubNavProps {
  selectedCategory: string;
  onCategoryClick: (categoryId: string) => void;
}

const SubNav: React.FC<SubNavProps> = ({ selectedCategory, onCategoryClick }) => {
  const { categories, loading } = useCategories();

  return (
    <div className="sticky top-16 z-40 bg-captain-navy/95 backdrop-blur-md border-b-2 border-captain-cyan/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-3 overflow-x-auto py-3 scrollbar-hide">
          {loading ? (
            <div className="flex space-x-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-8 w-24 bg-captain-blue rounded-full animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <button
                onClick={() => onCategoryClick('all')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border whitespace-nowrap ${selectedCategory === 'all'
                  ? 'bg-captain-cyan text-captain-navy border-captain-cyan shadow-md shadow-captain-cyan/30'
                  : 'bg-transparent text-captain-light border-captain-cyan/40 hover:border-captain-cyan hover:text-captain-cyan'
                  }`}
              >
                All
              </button>
              {categories.filter(c => c.id !== 'consumables').map((c) => (
                <button
                  key={c.id}
                  onClick={() => onCategoryClick(c.id)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border flex items-center space-x-1.5 whitespace-nowrap ${selectedCategory === c.id
                    ? 'bg-captain-cyan text-captain-navy border-captain-cyan shadow-md shadow-captain-cyan/30'
                    : 'bg-transparent text-captain-light border-captain-cyan/40 hover:border-captain-cyan hover:text-captain-cyan'
                    }`}
                >
                  <span>{c.icon}</span>
                  <span>{c.name}</span>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubNav;
