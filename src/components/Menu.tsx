import React from 'react';
import { MenuItem, CartItem } from '../types';
import { useCategories } from '../hooks/useCategories';
import MenuItemCard from './MenuItemCard';

// Preload images for better performance
const preloadImages = (items: MenuItem[]) => {
  items.forEach(item => {
    if (item.image) {
      const img = new Image();
      img.src = item.image;
    }
  });
};

interface MenuProps {
  menuItems: MenuItem[];
  addToCart: (item: MenuItem, quantity?: number, variation?: any, addOns?: any[]) => void;
  cartItems: CartItem[];
  updateQuantity: (id: string, quantity: number) => void;
}

const Menu: React.FC<MenuProps> = ({ menuItems, addToCart, cartItems, updateQuantity }) => {
  const { categories } = useCategories();
  const [activeCategory, setActiveCategory] = React.useState('hot-coffee');

  // Preload images when menu items change
  React.useEffect(() => {
    if (menuItems.length > 0) {
      // Preload images for visible category first
      const visibleItems = menuItems.filter(item => item.category === activeCategory);
      preloadImages(visibleItems);

      // Then preload other images after a short delay
      setTimeout(() => {
        const otherItems = menuItems.filter(item => item.category !== activeCategory);
        preloadImages(otherItems);
      }, 1000);
    }
  }, [menuItems, activeCategory]);

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    const element = document.getElementById(categoryId);
    if (element) {
      const headerHeight = 64; // Header height
      const mobileNavHeight = 60; // Mobile nav height
      const offset = headerHeight + mobileNavHeight + 20; // Extra padding
      const elementPosition = element.offsetTop - offset;

      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  React.useEffect(() => {
    if (categories.length > 0) {
      // Set default to dim-sum if it exists, otherwise first category
      const defaultCategory = categories.find(cat => cat.id === 'dim-sum') || categories[0];
      if (!categories.find(cat => cat.id === activeCategory)) {
        setActiveCategory(defaultCategory.id);
      }
    }
  }, [categories, activeCategory]);

  React.useEffect(() => {
    const handleScroll = () => {
      const sections = categories.map(cat => document.getElementById(cat.id)).filter(Boolean);
      const scrollPosition = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveCategory(categories[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  return (
    <>
      <div
        className="relative"
        style={{
          backgroundImage: "url('/ice-bg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Dark overlay so text stays readable */}
        <div className="absolute inset-0 bg-captain-navy/80 backdrop-blur-[2px]" />

        <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-outfit font-bold text-captain-white mb-3">Our Products</h2>
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-px flex-1 max-w-16 bg-captain-cyan/40" />
              <span className="text-captain-cyan text-sm font-medium tracking-widest uppercase">Clean • Safe • High Quality</span>
              <div className="h-px flex-1 max-w-16 bg-captain-cyan/40" />
            </div>
            <p className="text-captain-light max-w-2xl mx-auto">
              Premium purified tube ice and clean drinking water, sourced and delivered with care.
            </p>
          </div>

          {categories.map((category) => {
            const categoryItems = menuItems.filter(item => item.category === category.id);

            if (categoryItems.length === 0) return null;

            return (
              <section key={category.id} id={category.id} className="mb-16">
                <div className="flex items-center mb-8 pb-3 border-b border-captain-cyan/30">
                  <span className="text-3xl mr-3">{category.icon}</span>
                  <h3 className="text-3xl font-outfit font-bold text-captain-white">{category.name}</h3>
                </div>

                <div className="flex flex-col gap-3">
                  {categoryItems.map((item) => {
                    const cartItem = cartItems.find(cartItem => cartItem.id === item.id);
                    return (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        onAddToCart={addToCart}
                        quantity={cartItem?.quantity || 0}
                        onUpdateQuantity={updateQuantity}
                      />
                    );
                  })}
                </div>
              </section>
            );
          })}
        </main>
      </div>
    </>
  );
};

export default Menu;