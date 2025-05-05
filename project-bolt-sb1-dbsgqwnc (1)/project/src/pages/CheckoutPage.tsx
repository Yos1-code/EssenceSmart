import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { LockIcon, CreditCard, CheckCircle } from 'lucide-react';

interface ShippingForm {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

interface PaymentForm {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
}

const CheckoutPage = () => {
  const { cartItems, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  
  const [shippingInfo, setShippingInfo] = useState<ShippingForm>({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: ''
  });
  
  const [paymentInfo, setPaymentInfo] = useState<PaymentForm>({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });
  
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  
  const shippingCost = shippingMethod === 'express' ? 12.99 : shippingMethod === 'sameday' ? 19.99 : (subtotal >= 50 ? 0 : 4.99);
  const total = subtotal + shippingCost;
  
  const handleShippingInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingInfo({
      ...shippingInfo,
      [name]: value
    });
  };
  
  const handlePaymentInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      const formatted = value
        .replace(/\s/g, '')
        .replace(/(\d{4})/g, '$1 ')
        .trim();
      
      setPaymentInfo({
        ...paymentInfo,
        [name]: formatted.substring(0, 19)
      });
      return;
    }
    
    // Format expiry date with slash
    if (name === 'expiryDate') {
      const formatted = value
        .replace(/\//g, '')
        .replace(/(\d{2})(\d{0,2})/, '$1/$2')
        .substring(0, 5);
      
      setPaymentInfo({
        ...paymentInfo,
        [name]: formatted
      });
      return;
    }
    
    setPaymentInfo({
      ...paymentInfo,
      [name]: value
    });
  };
  
  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
    window.scrollTo(0, 0);
  };
  
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      // Create order in database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total: total,
          status: 'pending',
          payment_method: paymentMethod,
          shipping_address: shippingInfo
        })
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product?.price || 0
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) throw itemsError;
      
      // Clear cart
      await clearCart();
      
      // Show success message
      setOrderId(order.id);
      setOrderPlaced(true);
      setStep(3);
      window.scrollTo(0, 0);
      
    } catch (error) {
      console.error('Error creating order:', error);
      alert('There was an error processing your order. Please try again.');
    }
  };
  
  if (orderPlaced) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-16">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="mt-4 text-2xl font-display font-bold text-gray-900">Order Confirmed!</h1>
            <p className="mt-2 text-gray-600">
              Thank you for your purchase. Your order has been placed successfully.
            </p>
            <p className="mt-1 text-gray-600">
              Order #: <span className="font-medium">{orderId}</span>
            </p>
            
            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-6">
                A confirmation email has been sent to your email address.
                You can track your order status in your account.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={() => navigate('/products')}
                  className="btn btn-primary"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className="btn btn-secondary"
                >
                  View Order History
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-16">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">Checkout</h1>
        
        {/* Checkout Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className={`flex items-center ${step >= 1 ? 'text-accent-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-accent-100' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="ml-2 text-sm font-medium">Shipping</span>
          </div>
          <div className={`w-16 h-0.5 mx-2 ${step >= 2 ? 'bg-accent-500' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center ${step >= 2 ? 'text-accent-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-accent-100' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="ml-2 text-sm font-medium">Payment</span>
          </div>
          <div className={`w-16 h-0.5 mx-2 ${step >= 3 ? 'bg-accent-500' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center ${step >= 3 ? 'text-accent-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-accent-100' : 'bg-gray-200'}`}>
              3
            </div>
            <span className="ml-2 text-sm font-medium">Confirmation</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main checkout form */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <h2 className="text-lg font-medium text-gray-900 mb-6">Shipping Information</h2>
                <form onSubmit={handleShippingSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={shippingInfo.fullName}
                        onChange={handleShippingInfoChange}
                        required
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={shippingInfo.phone}
                        onChange={handleShippingInfoChange}
                        required
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={shippingInfo.address}
                      onChange={handleShippingInfoChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={shippingInfo.city}
                        onChange={handleShippingInfoChange}
                        required
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                        State/Province *
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={shippingInfo.state}
                        onChange={handleShippingInfoChange}
                        required
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP/Postal Code *
                      </label>
                      <input
                        type="text"
                        id="zipCode"
                        name="zipCode"
                        value={shippingInfo.zipCode}
                        onChange={handleShippingInfoChange}
                        required
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                      Country *
                    </label>
                    <select
                      id="country"
                      name="country"
                      value={shippingInfo.country}
                      onChange={(e) => setShippingInfo({...shippingInfo, country: e.target.value})}
                      required
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="Mexico">Mexico</option>
                      <option value="United Kingdom">United Kingdom</option>
                    </select>
                  </div>
                  
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Method</h3>
                  <div className="space-y-4 mb-6">
                    <label className="flex items-center p-4 border border-gray-300 rounded cursor-pointer hover:border-primary-500 transition-colors">
                      <input
                        type="radio"
                        name="shippingMethod"
                        value="standard"
                        checked={shippingMethod === 'standard'}
                        onChange={() => setShippingMethod('standard')}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <div className="ml-3 flex-1">
                        <span className="block text-sm font-medium text-gray-900">Standard Shipping</span>
                        <span className="block text-sm text-gray-500">3-5 business days</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {subtotal >= 50 ? 'Free' : '$4.99'}
                      </span>
                    </label>
                    
                    <label className="flex items-center p-4 border border-gray-300 rounded cursor-pointer hover:border-primary-500 transition-colors">
                      <input
                        type="radio"
                        name="shippingMethod"
                        value="express"
                        checked={shippingMethod === 'express'}
                        onChange={() => setShippingMethod('express')}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <div className="ml-3 flex-1">
                        <span className="block text-sm font-medium text-gray-900">Express Shipping</span>
                        <span className="block text-sm text-gray-500">1-2 business days</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">$12.99</span>
                    </label>
                    
                    <label className="flex items-center p-4 border border-gray-300 rounded cursor-pointer hover:border-primary-500 transition-colors">
                      <input
                        type="radio"
                        name="shippingMethod"
                        value="sameday"
                        checked={shippingMethod === 'sameday'}
                        onChange={() => setShippingMethod('sameday')}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <div className="ml-3 flex-1">
                        <span className="block text-sm font-medium text-gray-900">Same Day Delivery</span>
                        <span className="block text-sm text-gray-500">Available in select areas</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">$19.99</span>
                    </label>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="btn btn-primary"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
            
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <h2 className="text-lg font-medium text-gray-900 mb-6">Payment Method</h2>
                <form onSubmit={handlePaymentSubmit}>
                  <div className="space-y-4 mb-6">
                    <label className="flex items-center p-4 border border-gray-300 rounded cursor-pointer hover:border-primary-500 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="credit-card"
                        checked={paymentMethod === 'credit-card'}
                        onChange={() => setPaymentMethod('credit-card')}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <div className="ml-3 flex-1">
                        <span className="block text-sm font-medium text-gray-900">Credit Card</span>
                        <span className="block text-sm text-gray-500">Pay with Visa, Mastercard, or American Express</span>
                      </div>
                      <div className="flex space-x-2">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-6" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" alt="American Express" className="h-6" />
                      </div>
                    </label>
                    
                    <label className="flex items-center p-4 border border-gray-300 rounded cursor-pointer hover:border-primary-500 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="paypal"
                        checked={paymentMethod === 'paypal'}
                        onChange={() => setPaymentMethod('paypal')}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <div className="ml-3 flex-1">
                        <span className="block text-sm font-medium text-gray-900">PayPal</span>
                        <span className="block text-sm text-gray-500">Pay with your PayPal account</span>
                      </div>
                      <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-6" />
                    </label>
                  </div>
                  
                  {paymentMethod === 'credit-card' && (
                    <div className="mt-6">
                      <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                        <CreditCard size={18} className="mr-2" />
                        Card Details
                      </h3>
                      
                      <div className="mb-4">
                        <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                          Card Number *
                        </label>
                        <input
                          type="text"
                          id="cardNumber"
                          name="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={paymentInfo.cardNumber}
                          onChange={handlePaymentInfoChange}
                          maxLength={19}
                          required
                          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="cardHolder" className="block text-sm font-medium text-gray-700 mb-1">
                          Cardholder Name *
                        </label>
                        <input
                          type="text"
                          id="cardHolder"
                          name="cardHolder"
                          placeholder="John Doe"
                          value={paymentInfo.cardHolder}
                          onChange={handlePaymentInfoChange}
                          required
                          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                            Expiry Date *
                          </label>
                          <input
                            type="text"
                            id="expiryDate"
                            name="expiryDate"
                            placeholder="MM/YY"
                            value={paymentInfo.expiryDate}
                            onChange={handlePaymentInfoChange}
                            required
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                            CVV *
                          </label>
                          <input
                            type="text"
                            id="cvv"
                            name="cvv"
                            placeholder="123"
                            value={paymentInfo.cvv}
                            onChange={handlePaymentInfoChange}
                            maxLength={4}
                            required
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-8 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      Back to Shipping
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary flex items-center"
                    >
                      <LockIcon size={18} className="mr-2" />
                      Place Order
                    </button>
                  </div>
                  
                  <p className="mt-4 text-xs text-gray-500 text-center">
                    By placing your order, you agree to our <a href="#" className="text-primary-600 hover:underline">Terms of Service</a> and <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>.
                  </p>
                </form>
              </motion.div>
            )}
          </div>
          
          {/* Order summary */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
              
              <div className="max-h-64 overflow-y-auto mb-4">
                <ul className="divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <li key={item.id} className="py-4 flex">
                      <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded overflow-hidden">
                        <img
                          src={item.product?.image_url}
                          alt={item.product?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {item.product?.name}
                        </h3>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        <p className="text-sm font-medium text-gray-900">
                          ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="border-t border-gray-200 pt-4 space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  {shippingCost === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    <span className="text-gray-900">${shippingCost.toFixed(2)}</span>
                  )}
                </div>
                
                <div className="border-t border-gray-200 pt-4 flex justify-between font-medium">
                  <span className="text-gray-900">Total</span>
                  <span className="text-accent-600 text-xl">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;