import React, { useState } from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { CartItem, PaymentMethod, ServiceType } from '../types';
import { usePaymentMethods } from '../hooks/usePaymentMethods';
import { useMenu } from '../hooks/useMenu';

interface CheckoutProps {
  cartItems: CartItem[];
  totalPrice: number;
  onBack: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ cartItems, totalPrice, onBack }) => {
  const { paymentMethods } = usePaymentMethods();
  const { updateStock } = useMenu();
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('pickup');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pickupTime, setPickupTime] = useState('5-10');
  const [customTime, setCustomTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('gcash');
  const [notes, setNotes] = useState('');

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // Set default payment method when payment methods are loaded
  React.useEffect(() => {
    if (paymentMethods.length > 0) {
      // Validate if the first payment method id is a valid PaymentMethod type
      const firstId = paymentMethods[0].id as any;
      if (['gcash', 'maya', 'bank-transfer', 'cash'].includes(firstId)) {
        setPaymentMethod(firstId);
      }
    }
  }, [paymentMethods]);

  const selectedPaymentMethod = paymentMethods.find(method => method.id === paymentMethod);

  const handlePlaceOrder = () => {
    // Final stock validation check
    const outOfStockItems = cartItems.filter(item => {
      const stockLimit = item.selectedVariation?.trackInventory
        ? item.selectedVariation.stockQuantity ?? Infinity
        : (item.trackInventory ? item.stockQuantity ?? Infinity : Infinity);
      return item.quantity > stockLimit;
    });

    if (outOfStockItems.length > 0) {
      alert(`Some items in your cart just went out of stock: ${outOfStockItems.map(i => i.name).join(', ')}. Please update your cart.`);
      onBack();
      return;
    }

    const orderItems = cartItems.map(item => {
      let itemName = item.name;
      if (item.selectedVariation) {
        itemName += ` (${item.selectedVariation.name})`;
      }
      if (item.selectedAddOns && item.selectedAddOns.length > 0) {
        const addOnsStr = item.selectedAddOns.map(a => a.name).join(', ');
        itemName += ` + [${addOnsStr}]`;
      }
      return `${item.quantity}x ${itemName} - ₱${item.totalPrice.toFixed(2)}`;
    }).join('\n');

    const orderDetails = `
*NEW ORDER FROM WEBSITE*
-------------------------
*Customer Details:*
Name: ${customerName}
Contact: ${contactNumber}

*Order Type:* ${serviceType === 'delivery' ? '🚚 Delivery' : '🏪 Pickup'}
${serviceType === 'delivery' ? `Address: ${address}\nLandmark: ${landmark}` : `Time: ${pickupTime === 'custom' ? customTime : pickupTime} mins`}

*Items:*
${orderItems}

*Total Amount: ₱${totalPrice.toFixed(2)}*

*Payment Method:* ${selectedPaymentMethod?.name || paymentMethod.toUpperCase()}
${notes ? `\n*Notes:* ${notes}` : ''}
-------------------------
Please confirm my order. Thank you!
    `.trim();

    const encodedMessage = encodeURIComponent(orderDetails);
    const messengerUrl = `https://m.me/eLCapitan0214?text=${encodedMessage}`;

    // Deduct stock for each item
    const deductStock = async () => {
      try {
        for (const item of cartItems) {
          if (item.trackInventory || (item.selectedVariation?.trackInventory)) {
            await updateStock(
              item.id,
              item.selectedVariation?.id || null,
              -item.quantity,
              'Sale via Website'
            );
          }
        }
      } catch (error) {
        console.error('Error deducting stock:', error);
      }
    };

    deductStock();
    window.open(messengerUrl, '_blank');
  };

  const isDetailsValid = customerName && contactNumber &&
    (serviceType === 'pickup' ? (pickupTime !== 'custom' || customTime) : (address && landmark));

  return (
    <div className="min-h-screen bg-captain-navy pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center text-captain-cyan mb-8 hover:text-cyan-300 transition-colors group"
        >
          <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Menu
        </button>

        <div className="bg-captain-blue rounded-3xl shadow-2xl border border-captain-cyan/20 overflow-hidden animate-scale-in">
          {/* Progress Header */}
          <div className="bg-captain-navy/50 px-8 py-6 flex items-center justify-between border-b border-captain-cyan/10">
            <div className={`flex items-center ${step === 'details' ? 'text-captain-cyan' : 'text-captain-light'}`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mr-3 font-bold ${step === 'details' ? 'border-captain-cyan bg-captain-cyan/10' : 'border-captain-light/30'}`}>1</span>
              <span className="font-semibold">Details</span>
            </div>
            <div className="h-0.5 w-12 bg-captain-cyan/20 mx-4"></div>
            <div className={`flex items-center ${step === 'payment' ? 'text-captain-cyan' : 'text-captain-light'}`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mr-3 font-bold ${step === 'payment' ? 'border-captain-cyan bg-captain-cyan/10' : 'border-captain-light/30'}`}>2</span>
              <span className="font-semibold">Payment</span>
            </div>
          </div>

          <div className="p-8">
            {step === 'details' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-captain-white mb-2 uppercase tracking-tight">Full Name *</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-captain-navy border border-captain-cyan/20 rounded-xl px-4 py-3 text-captain-white placeholder-captain-light/30 focus:outline-none focus:border-captain-cyan/50 focus:ring-1 focus:ring-captain-cyan/50 transition-all text-sm"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-captain-white mb-2 uppercase tracking-tight">Contact Number *</label>
                    <input
                      type="tel"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      className="w-full bg-captain-navy border border-captain-cyan/20 rounded-xl px-4 py-3 text-captain-white placeholder-captain-light/30 focus:outline-none focus:border-captain-cyan/50 focus:ring-1 focus:ring-captain-cyan/50 transition-all text-sm"
                      placeholder="09XXXXXXXXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-captain-white mb-3 uppercase tracking-tight">Service Type</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setServiceType('pickup')}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${serviceType === 'pickup' ? 'border-captain-cyan bg-captain-cyan/10 text-captain-cyan' : 'border-captain-navy bg-captain-navy/50 text-captain-light hover:border-captain-cyan/30'}`}
                    >
                      <Clock className="h-6 w-6 mb-2" />
                      <span className="font-bold text-sm">Pickup</span>
                    </button>
                    <button
                      onClick={() => setServiceType('delivery')}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${serviceType === 'delivery' ? 'border-captain-cyan bg-captain-cyan/10 text-captain-cyan' : 'border-captain-navy bg-captain-navy/50 text-captain-light hover:border-captain-cyan/30'}`}
                    >
                      <div className="text-2xl mb-2">🚚</div>
                      <span className="font-bold text-sm">Delivery</span>
                    </button>
                  </div>
                </div>

                {serviceType === 'delivery' ? (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <label className="block text-sm font-semibold text-captain-white mb-2 uppercase tracking-tight">Delivery Address *</label>
                      <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full bg-captain-navy border border-captain-cyan/20 rounded-xl px-4 py-3 text-captain-white placeholder-captain-light/30 focus:outline-none focus:border-captain-cyan/50 focus:ring-1 focus:ring-captain-cyan/50 transition-all resize-none text-sm"
                        placeholder="Street Name, House Number, etc."
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-captain-white mb-2 uppercase tracking-tight">Landmark *</label>
                      <input
                        type="text"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        className="w-full bg-captain-navy border border-captain-cyan/20 rounded-xl px-4 py-3 text-captain-white placeholder-captain-light/30 focus:outline-none focus:border-captain-cyan/50 focus:ring-1 focus:ring-captain-cyan/50 transition-all text-sm"
                        placeholder="Near which building or store?"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="animate-fade-in">
                    <label className="block text-sm font-semibold text-captain-white mb-3 uppercase tracking-tight">Pickup In (Minutes)</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['5-10', '15-20', '30+'].map((time) => (
                        <button
                          key={time}
                          onClick={() => setPickupTime(time)}
                          className={`py-3 rounded-xl border-2 transition-all duration-200 font-bold text-sm ${pickupTime === time ? 'border-captain-cyan bg-captain-cyan/10 text-captain-cyan' : 'border-captain-navy bg-captain-navy/50 text-captain-light hover:border-captain-cyan/30'}`}
                        >
                          {time}
                        </button>
                      ))}
                      <button
                        onClick={() => setPickupTime('custom')}
                        className={`py-3 rounded-xl border-2 transition-all duration-200 font-bold text-sm ${pickupTime === 'custom' ? 'border-captain-cyan bg-captain-cyan/10 text-captain-cyan' : 'border-captain-navy bg-captain-navy/50 text-captain-light hover:border-captain-cyan/30'}`}
                      >
                        Custom
                      </button>
                    </div>
                    {pickupTime === 'custom' && (
                      <input
                        type="text"
                        value={customTime}
                        onChange={(e) => setCustomTime(e.target.value)}
                        className="w-full mt-3 bg-captain-navy border border-captain-cyan/20 rounded-xl px-4 py-3 text-captain-white placeholder-captain-light/30 focus:outline-none focus:border-captain-cyan/50 transition-all text-sm"
                        placeholder="Example: 5:30 PM"
                      />
                    )}
                  </div>
                )}

                <button
                  onClick={() => setStep('payment')}
                  disabled={!isDetailsValid}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 transform active:scale-95 shadow-xl ${isDetailsValid ? 'bg-gradient-to-r from-captain-cyan to-cyan-400 text-captain-navy hover:shadow-captain-cyan/30 hover:scale-[1.02]' : 'bg-captain-navy text-captain-light opacity-50 cursor-not-allowed'}`}
                >
                  Next Step
                </button>
              </div>
            ) : (
              <div className="space-y-8 animate-fade-in">
                <div>
                  <h4 className="text-sm font-semibold text-captain-white mb-4 uppercase tracking-wider">Select Payment Method</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {paymentMethods.length > 0 ? (
                      paymentMethods.map((method) => (
                        <button
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                          className={`flex items-center p-4 rounded-xl border-2 transition-all duration-200 text-left ${paymentMethod === method.id ? 'border-captain-cyan bg-captain-cyan/10' : 'border-captain-navy bg-captain-navy/50 hover:border-captain-cyan/30'}`}
                        >
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl mr-4 ${paymentMethod === method.id ? 'bg-captain-cyan text-captain-navy' : 'bg-captain-navy text-captain-cyan'}`}>
                            {method.id === 'cash' ? '💵' : method.name.includes('GCash') ? '📱' : '💳'}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-captain-white">{method.name}</p>
                            <p className="text-xs text-captain-light/60 capitalize">{method.id.replace('-', ' ')}</p>
                          </div>
                          {paymentMethod === method.id && (
                            <div className="w-5 h-5 rounded-full bg-captain-cyan flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-captain-navy"></div>
                            </div>
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-8 text-captain-light/50 border-2 border-dashed border-captain-navy rounded-xl">
                        Loading payment methods...
                      </div>
                    )}
                  </div>
                </div>

                {selectedPaymentMethod && selectedPaymentMethod.id !== 'cash' && (
                  <div className="p-6 bg-captain-navy/50 rounded-2xl border border-captain-cyan/20 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-captain-light/60 uppercase tracking-widest font-bold">Account Name</p>
                        <p className="text-base text-captain-white font-bold mt-0.5">{selectedPaymentMethod.account_name}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-captain-light/60 uppercase tracking-widest font-bold">Account Number</p>
                      <p className="text-xl text-captain-cyan font-mono font-bold mt-0.5 tracking-wider">{selectedPaymentMethod.account_number}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-captain-white mb-2 uppercase tracking-tight">Additional Notes (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-captain-navy border border-captain-cyan/20 rounded-xl px-4 py-3 text-captain-white placeholder-captain-light/30 focus:outline-none focus:border-captain-cyan/50 transition-all resize-none text-sm"
                    placeholder="Any special requests or instructions?"
                    rows={2}
                  />
                </div>

                <div className="border-t border-captain-cyan/10 pt-6">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-captain-light">Total to pay:</span>
                    <span className="text-3xl font-bold text-captain-cyan">₱{totalPrice.toFixed(2)}</span>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    className="w-full py-5 bg-gradient-to-r from-captain-cyan to-cyan-400 text-captain-navy rounded-xl font-bold text-xl hover:shadow-2xl hover:shadow-captain-cyan/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-xl flex items-center justify-center"
                  >
                    Place Order via Messenger
                  </button>
                  <p className="text-center text-[11px] text-captain-light/40 mt-4 leading-relaxed px-4">
                    By clicking "Place Order", you will be redirected to Facebook Messenger to finalize your order with our team. Stock will be reserved for you.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;