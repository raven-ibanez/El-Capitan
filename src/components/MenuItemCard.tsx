import React, { useState } from 'react';
import { Plus, Minus, X, ShoppingCart } from 'lucide-react';
import { MenuItem, Variation, AddOn } from '../types';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem, quantity?: number, variation?: Variation, addOns?: AddOn[]) => void;
  quantity: number;
  onUpdateQuantity: (id: string, quantity: number) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  onAddToCart,
  quantity,
  onUpdateQuantity
}) => {
  const [showCustomization, setShowCustomization] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<Variation | undefined>(
    item.variations?.find(v => !v.trackInventory || (v.stockQuantity ?? 0) > 0) || item.variations?.[0]
  );
  const [selectedAddOns, setSelectedAddOns] = useState<(AddOn & { quantity: number })[]>([]);

  const calculatePrice = () => {
    // Use effective price (discounted or regular) as base
    let price = item.effectivePrice || item.basePrice;
    if (selectedVariation) {
      price = (item.effectivePrice || item.basePrice) + selectedVariation.price;
    }
    selectedAddOns.forEach(addOn => {
      price += addOn.price * addOn.quantity;
    });
    return price;
  };

  const handleAddToCart = () => {
    if (item.variations?.length || item.addOns?.length) {
      setShowCustomization(true);
    } else {
      onAddToCart(item, 1);
    }
  };

  const handleCustomizedAddToCart = () => {
    // Convert selectedAddOns back to regular AddOn array for cart
    const addOnsForCart: AddOn[] = selectedAddOns.flatMap(addOn =>
      Array(addOn.quantity).fill({ ...addOn, quantity: undefined })
    );
    onAddToCart(item, 1, selectedVariation, addOnsForCart);
    setShowCustomization(false);
    setSelectedAddOns([]);
  };

  const handleIncrement = () => {
    onUpdateQuantity(item.id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      onUpdateQuantity(item.id, quantity - 1);
    }
  };

  const updateAddOnQuantity = (addOn: AddOn, quantity: number) => {
    setSelectedAddOns(prev => {
      const existingIndex = prev.findIndex(a => a.id === addOn.id);

      if (quantity === 0) {
        // Remove add-on if quantity is 0
        return prev.filter(a => a.id !== addOn.id);
      }

      if (existingIndex >= 0) {
        // Update existing add-on quantity
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], quantity };
        return updated;
      } else {
        // Add new add-on with quantity
        return [...prev, { ...addOn, quantity }];
      }
    });
  };

  const groupedAddOns = item.addOns?.reduce((groups, addOn) => {
    const category = addOn.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(addOn);
    return groups;
  }, {} as Record<string, AddOn[]>);

  return (
    <>
      {/* ── List Row ── */}
      <div className={`flex items-center gap-4 bg-captain-blue rounded-2xl px-4 py-3 border border-captain-blue hover:border-captain-cyan/40 hover:shadow-lg hover:shadow-captain-cyan/10 transition-all duration-300 group animate-scale-in ${!item.available ? 'opacity-60' : ''}`}>

        {/* Thumbnail */}
        <div className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-captain-navy">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`absolute inset-0 flex items-center justify-center ${item.image ? 'hidden' : ''}`}>
            <span className="text-3xl opacity-50">
              {item.category?.includes('water') ? '💧' : '🧊'}
            </span>
          </div>

          {/* Discount % overlay */}
          {item.isOnDiscount && item.discountPrice && (
            <div className="absolute bottom-0 left-0 right-0 bg-red-600/90 text-white text-[10px] font-bold text-center py-0.5">
              {Math.round(((item.basePrice - item.discountPrice) / item.basePrice) * 100)}% OFF
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <h4 className="text-base font-semibold text-captain-white leading-tight truncate">{item.name}</h4>
            {item.popular && (
              <span className="text-[10px] font-bold bg-gradient-to-r from-captain-gold to-yellow-400 text-captain-navy px-2 py-0.5 rounded-full whitespace-nowrap">⭐ POPULAR</span>
            )}
            {item.isOnDiscount && item.discountPrice && (
              <span className="text-[10px] font-bold bg-red-50 text-red-600 px-2 py-0.5 rounded-full animate-pulse whitespace-nowrap">SALE</span>
            )}
            {!item.available ? (
              <span className="text-[10px] font-bold bg-gray-600 text-white px-2 py-0.5 rounded-full whitespace-nowrap">UNAVAILABLE</span>
            ) : item.trackInventory && (item.stockQuantity ?? 0) === 0 && (!item.variations || item.variations.length === 0) ? (
              <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-full whitespace-nowrap">OUT OF STOCK</span>
            ) : item.trackInventory && (item.stockQuantity ?? 0) <= (item.lowStockThreshold || 0) && (!item.variations || item.variations.length === 0) ? (
              <span className="text-[10px] font-bold bg-yellow-500 text-captain-navy px-2 py-0.5 rounded-full whitespace-nowrap">LOW STOCK</span>
            ) : item.variations && item.variations.length > 0 && item.variations.every(v => v.trackInventory && (v.stockQuantity ?? 0) === 0) ? (
              <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-full whitespace-nowrap">OUT OF STOCK</span>
            ) : null}
          </div>

          <p className="text-xs text-captain-light/70 leading-snug line-clamp-2 mb-1">
            {!item.available ? 'Currently Unavailable' : item.description}
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            {item.variations && item.variations.length > 0 && (
              <span className="text-[10px] text-captain-cyan border border-captain-cyan/30 px-2 py-0.5 rounded-full">{item.variations.length} sizes</span>
            )}
            {item.addOns && item.addOns.length > 0 && (
              <span className="text-[10px] text-captain-cyan border border-captain-cyan/20 px-2 py-0.5 rounded-full">+{item.addOns.length} add-on{item.addOns.length > 1 ? 's' : ''}</span>
            )}
          </div>
        </div>

        {/* Price + Action */}
        <div className="flex-shrink-0 flex flex-col items-end gap-2">
          {/* Price */}
          {item.isOnDiscount && item.discountPrice ? (
            <div className="text-right">
              <div className="text-lg font-bold text-captain-cyan leading-none">₱{item.discountPrice.toFixed(2)}</div>
              <div className="text-xs text-captain-light/40 line-through">₱{item.basePrice.toFixed(2)}</div>
            </div>
          ) : (
            <div className="text-lg font-bold text-captain-cyan">₱{item.basePrice.toFixed(2)}</div>
          )}
          {item.variations && item.variations.length > 0 && (
            <div className="text-[10px] text-captain-light/50 -mt-1">starting price</div>
          )}

          {/* Action */}
          {!item.available ? (
            <button disabled className="bg-gray-700 text-gray-400 px-3 py-1.5 rounded-xl cursor-not-allowed font-medium text-xs">
              Unavailable
            </button>
          ) : (item.trackInventory && (item.stockQuantity ?? 0) === 0 && (!item.variations || item.variations.length === 0)) || (item.variations?.length && item.variations.every(v => v.trackInventory && (v.stockQuantity ?? 0) === 0)) ? (
            <button disabled className="bg-red-900/50 text-red-300 border border-red-500/30 px-3 py-1.5 rounded-xl cursor-not-allowed font-medium text-xs">
              Sold Out
            </button>
          ) : quantity === 0 ? (
            <button
              onClick={handleAddToCart}
              className="bg-gradient-to-r from-captain-cyan to-cyan-400 text-captain-navy px-4 py-1.5 rounded-xl hover:from-cyan-300 hover:to-captain-cyan transition-all duration-200 hover:scale-105 font-bold text-xs shadow-lg shadow-captain-cyan/30"
            >
              {item.variations?.length || item.addOns?.length ? 'Customize' : '+ Add'}
            </button>
          ) : (
            <div className="flex items-center space-x-1 bg-captain-navy rounded-xl p-1 border border-captain-cyan/30">
              <button onClick={handleDecrement} className="p-1.5 hover:bg-captain-blue rounded-lg transition-colors duration-200">
                <Minus className="h-3.5 w-3.5 text-captain-cyan" />
              </button>
              <span className="font-bold text-captain-white min-w-[22px] text-center text-sm">{quantity}</span>
              <button
                onClick={handleIncrement}
                disabled={item.trackInventory && (item.stockQuantity ?? 0) <= quantity}
                className={`p-1.5 hover:bg-captain-blue rounded-lg transition-colors duration-200 ${item.trackInventory && (item.stockQuantity ?? 0) <= quantity ? 'opacity-30 cursor-not-allowed' : ''}`}
              >
                <Plus className="h-3.5 w-3.5 text-captain-cyan" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Customization Modal */}
      {showCustomization && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-captain-blue rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-captain-cyan/20">
            <div className="sticky top-0 bg-captain-blue border-b border-captain-cyan/20 p-6 flex items-center justify-between rounded-t-2xl">
              <div>
                <h3 className="text-xl font-semibold text-captain-white">Customize {item.name}</h3>
                <p className="text-sm text-captain-light mt-1">Choose your preferences</p>
              </div>
              <button
                onClick={() => setShowCustomization(false)}
                className="p-2 hover:bg-captain-navy rounded-full transition-colors duration-200"
              >
                <X className="h-5 w-5 text-captain-light" />
              </button>
            </div>

            <div className="p-6">
              {/* Size Variations */}
              {item.variations && item.variations.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-captain-white mb-4">Choose Size</h4>
                  <div className="space-y-3">
                    {item.variations.map((variation) => {
                      const isVarOutOfStock = variation.trackInventory && (variation.stockQuantity ?? 0) === 0;
                      return (
                        <label
                          key={variation.id}
                          className={`flex items-center justify-between p-4 border-2 rounded-xl transition-all duration-200 ${isVarOutOfStock
                            ? 'opacity-50 cursor-not-allowed border-gray-800'
                            : selectedVariation?.id === variation.id
                              ? 'border-captain-cyan bg-captain-cyan/10 cursor-pointer'
                              : 'border-captain-navy hover:border-captain-cyan/50 hover:bg-captain-navy/50 cursor-pointer'
                            }`}
                        >
                          <div className="flex items-center space-x-3">
                            <input
                              type="radio"
                              name="variation"
                              disabled={isVarOutOfStock}
                              checked={selectedVariation?.id === variation.id}
                              onChange={() => !isVarOutOfStock && setSelectedVariation(variation)}
                              className="text-red-600 focus:ring-red-500"
                            />
                            <div className="flex flex-col">
                              <span className="font-medium text-captain-white">{variation.name}</span>
                              {isVarOutOfStock && (
                                <span className="text-[10px] font-bold text-red-500 uppercase">Out of Stock</span>
                              )}
                              {variation.trackInventory && !isVarOutOfStock && (variation.stockQuantity ?? 0) <= (variation.lowStockThreshold || 0) && (
                                <span className="text-[10px] font-bold text-yellow-500 uppercase">Low Stock ({variation.stockQuantity} left)</span>
                              )}
                            </div>
                          </div>
                          <span className="text-captain-cyan font-semibold">
                            ₱{((item.effectivePrice || item.basePrice) + variation.price).toFixed(2)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add-ons */}
              {groupedAddOns && Object.keys(groupedAddOns).length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-captain-white mb-4">Add-ons</h4>
                  {Object.entries(groupedAddOns).map(([category, addOns]) => (
                    <div key={category} className="mb-4">
                      <h5 className="text-sm font-medium text-captain-light mb-3 capitalize">
                        {category.replace('-', ' ')}
                      </h5>
                      <div className="space-y-3">
                        {addOns.map((addOn) => (
                          <div
                            key={addOn.id}
                            className="flex items-center justify-between p-4 border border-captain-navy rounded-xl hover:border-captain-cyan/40 hover:bg-captain-navy/50 transition-all duration-200"
                          >
                            <div className="flex-1">
                              <span className="font-medium text-captain-white">{addOn.name}</span>
                              <div className="text-sm text-captain-light">
                                {addOn.price > 0 ? `₱${addOn.price.toFixed(2)} each` : 'Free'}
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              {selectedAddOns.find(a => a.id === addOn.id) ? (
                                <div className="flex items-center space-x-2 bg-captain-cyan/10 rounded-xl p-1 border border-captain-cyan/30">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const current = selectedAddOns.find(a => a.id === addOn.id);
                                      updateAddOnQuantity(addOn, (current?.quantity || 1) - 1);
                                    }}
                                    className="p-1.5 hover:bg-red-200 rounded-lg transition-colors duration-200"
                                  >
                                    <Minus className="h-3 w-3 text-red-600" />
                                  </button>
                                  <span className="font-semibold text-gray-900 min-w-[24px] text-center text-sm">
                                    {selectedAddOns.find(a => a.id === addOn.id)?.quantity || 0}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const current = selectedAddOns.find(a => a.id === addOn.id);
                                      updateAddOnQuantity(addOn, (current?.quantity || 0) + 1);
                                    }}
                                    className="p-1.5 hover:bg-red-200 rounded-lg transition-colors duration-200"
                                  >
                                    <Plus className="h-3 w-3 text-red-600" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => updateAddOnQuantity(addOn, 1)}
                                  className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 text-sm font-medium shadow-lg"
                                >
                                  <Plus className="h-3 w-3" />
                                  <span>Add</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Price Summary */}
              <div className="border-t border-captain-cyan/20 pt-4 mb-6">
                <div className="flex items-center justify-between text-2xl font-bold text-captain-white">
                  <span>Total:</span>
                  <span className="text-captain-cyan">₱{calculatePrice().toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCustomizedAddToCart}
                className="w-full bg-gradient-to-r from-captain-cyan to-cyan-400 text-captain-navy py-4 rounded-xl hover:from-cyan-300 hover:to-captain-cyan transition-all duration-200 font-bold flex items-center justify-center space-x-2 shadow-lg shadow-captain-cyan/30 transform hover:scale-105"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Add to Cart - ₱{calculatePrice().toFixed(2)}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MenuItemCard;