import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useLikes } from '../contexts/LikesContext';
import { useCart } from '../contexts/CartContext';
import { Heart, ShoppingCart, ShoppingBag } from 'lucide-react';

const SavedItemsPage = () => {
  const { user } = useAuth();
  const { likedProducts, toggleLike } = useLikes();
  const { addToCart } = useCart();

  useEffect(() => {
    // Scroll to top on component mount
    window.scrollTo(0, 0);
  }, []);

  const handleAddToCart = (productId: string) => {
    addToCart(productId);
  };

  const handleRemoveFromWishlist = (productId: string) => {
    toggleLike(productId);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-16">
        <div className="max-w-3xl mx-auto text-center py-12">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-4">
            Sign in to view your saved items
          </h1>
          <p className="text-gray-600 mb-8">
            You need to be logged in to access your wishlist.
          </p>
          <Link to="/login" className="btn btn-primary">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-16">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">My Wishlist</h1>
        
        {likedProducts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <Heart className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="mt-4 text-lg font-medium text-gray-900">Your wishlist is empty</h2>
            <p className="mt-2 text-gray-500">Looks like you haven't saved any products yet.</p>
            <div className="mt-6">
              <Link to="/products" className="btn btn-primary">
                Explore Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {likedProducts.map((item) => (
                <motion.li 
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 flex flex-col sm:flex-row"
                >
                  <div className="flex-shrink-0 w-full sm:w-32 h-32 bg-gray-100 rounded-md overflow-hidden">
                    <img
                      src={item.product?.image_url}
                      alt={item.product?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 sm:ml-6 mt-4 sm:mt-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          <Link to={`/product/${item.product_id}`} className="hover:text-primary-600">
                            {item.product?.name}
                          </Link>
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {item.product?.category.charAt(0).toUpperCase() + item.product?.category.slice(1)}
                        </p>
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                          {item.product?.description}
                        </p>
                      </div>
                      <div className="mt-4 sm:mt-0 sm:ml-6 text-right flex-shrink-0">
                        <p className="text-lg font-medium text-gray-900">
                          {item.product?.discount_percent ? (
                            <>
                              <span>
                                ${(item.product.price - (item.product.price * (item.product.discount_percent / 100))).toFixed(2)}
                              </span>
                              <span className="ml-2 text-sm text-gray-500 line-through">
                                ${item.product?.price.toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span>${item.product?.price.toFixed(2)}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleAddToCart(item.product_id)}
                        className="btn btn-primary flex items-center text-sm py-2"
                      >
                        <ShoppingCart size={16} className="mr-1" />
                        Add to Cart
                      </button>
                      
                      <button
                        onClick={() => handleRemoveFromWishlist(item.product_id)}
                        className="btn bg-red-500 text-white hover:bg-red-600 flex items-center text-sm py-2"
                      >
                        <Heart size={16} className="mr-1" />
                        Remove
                      </button>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
            
            <div className="p-6 border-t border-gray-200">
              <Link to="/products" className="text-primary-600 hover:text-primary-700 flex items-center">
                <ShoppingBag size={16} className="mr-1" />
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedItemsPage;