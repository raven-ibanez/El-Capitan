import React from 'react';
import { useCategories } from '../hooks/useCategories';

interface MobileNavProps {
  activeCategory: string;
  onCategoryClick: (categoryId: string) => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ activeCategory, onCategoryClick }) => {
  const { categories } = useCategories();

  return (
    <div className="sticky top-16 z-40 bg-captain-navy/95 backdrop-blur-sm border-b-2 border-captain-cyan/40 md:hidden shadow-md">
      <div className="flex overflow-x-auto scrollbar-hide px-4 py-3 gap-3">
        {categories.filter(c => c.id !== 'consumables').map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryClick(category.id)}
            className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 font-medium ${activeCategory === category.id
              ? 'bg-captain-cyan text-captain-navy shadow-md shadow-captain-cyan/30'
              : 'bg-captain-blue text-captain-light hover:text-captain-cyan'
              }`}
          >
            <span className="text-lg">{category.icon}</span>
            <span className="text-sm font-medium whitespace-nowrap">{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileNav;