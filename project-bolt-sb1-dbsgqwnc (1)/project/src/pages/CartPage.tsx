import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Trash2, ShoppingBag, ChevronLeft, LockIcon } from 'lucide-react';

const CartPage = () => {
  const { cartItems, isLoading, subtotal, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  
  const handleCouponApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === 'ESSENCE10') {
      setCouponApplied(true);
      setCouponDiscount(subtotal * 0.1);
    } else {
      alert('Invalid coupon code');
    }
  };
  
  const handleQuantityChange = (productId: string, quantity: number) => {
    updateQuantity(productId, quantity);
  };
  
  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
  };
  
  const handleCheckout = () => {
    if (user) {
      navigate('/checkout');
    } else {
      navigate('/login', { state: { from: '/cart' } });
    }
  };
  
  const shippingFee = subtotal >= 50 ? 0 : 4.99;
  const total = subtotal - couponDiscount + shippingFee;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-16">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">Your Cart</h1>
          <div className="animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex py-6 border-b border-gray-200">
                <div className="h-24 w-24 bg-gray-200 rounded"></div>
                <div className="ml-4 flex-1">
                  <div className="h-5 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="w-1/5">
                  <div className="h-8 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-16">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">Your Cart</h1>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <ShoppingBag className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="mt-4 text-lg font-medium text-gray-900">Your cart is empty</h2>
            <p className="mt-2 text-gray-500">Looks like you haven't added any products to your cart yet.</p>
            <div className="mt-6">
              <Link to="/products" className="btn btn-primary">
                Start Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <motion.li 
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="p-6 flex flex-col sm:flex-row"
                    >
                      <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-md overflow-hidden">
                        <img
                          src={item.product?.image_url}
                          alt={item.product?.name}
                          className="w-full h-full object-center object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 sm:ml-6 mt-4 sm:mt-0">
                        <div className="flex justify-between">
                          <h3 className="text-lg font-medium text-gray-900">
                            <Link to={`/product/${item.product_id}`} className="hover:text-primary-600">
                              {item.product?.name}
                            </Link>
                          </h3>
                          <p className="text-lg font-medium text-gray-900">
                            {item.product?.discount_percent ? (
                              <>
                                <span>
                                  ${((item.product.price - (item.product.price * (item.product.discount_percent / 100))) * item.quantity).toFixed(2)}
                                </span>
                                <span className="ml-2 text-sm text-gray-500 line-through">
                                  ${(item.product.price * item.quantity).toFixed(2)}
                                </span>
                              </>
                            ) : (
                              <span>${(item.product?.price * item.quantity).toFixed(2)}</span>
                            )}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center border border-gray-300 rounded">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                            >
                              <span className="sr-only">Decrease quantity</span>
                              <span className="w-4 h-4 flex items-center justify-center">−</span>
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.product_id, parseInt(e.target.value))}
                              className="p-2 w-12 text-center border-x border-gray-300 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                              className="p-2 text-gray-600 hover:text-gray-900"
                            >
                              <span className="sr-only">Increase quantity</span>
                              <span className="w-4 h-4 flex items-center justify-center">+</span>
                            </button>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.product_id)}
                            className="text-red-500 hover:text-red-700 flex items-center"
                          >
                            <Trash2 size={18} className="mr-1" />
                            <span className="text-sm">Remove</span>
                          </button>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
                
                <div className="p-6 border-t border-gray-200">
                  <Link to="/products" className="text-primary-600 hover:text-primary-700 flex items-center">
                    <ChevronLeft size={16} className="mr-1" />
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Order summary */}
            <div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">${subtotal.toFixed(2)}</span>
                  </div>
                  
                  {couponApplied && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon Discount</span>
                      <span>-${couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    {shippingFee === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      <span className="text-gray-900">${shippingFee.toFixed(2)}</span>
                    )}
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 flex justify-between font-medium">
                    <span className="text-gray-900">Total</span>
                    <span className="text-accent-600 text-xl">${total.toFixed(2)}</span>
                  </div>
                </div>
                
                {/* Coupon code form */}
                <div className="mt-6">
                  <form onSubmit={handleCouponApply}>
                    <label htmlFor="coupon" className="block text-sm font-medium text-gray-700 mb-2">
                      Apply Coupon Code
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        id="coupon"
                        placeholder="Enter code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded-l focus:outline-none focus:ring-1 focus:ring-primary-500"
                        disabled={couponApplied}
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-gray-800 text-white rounded-r hover:bg-gray-700 disabled:opacity-50"
                        disabled={couponApplied || !couponCode}
                      >
                        Apply
                      </button>
                    </div>
                    {couponApplied && (
                      <p className="mt-2 text-sm text-green-600">Coupon applied successfully!</p>
                    )}
                  </form>
                </div>
                
                {/* Checkout button */}
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="w-full btn btn-primary flex items-center justify-center"
                  >
                    <LockIcon size={18} className="mr-2" />
                    Proceed to Checkout
                  </button>
                </div>
                
                {/* Security notice */}
                <p className="mt-4 text-xs text-gray-500 text-center">
                  Secure checkout powered by Stripe. All information is encrypted and secure.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;