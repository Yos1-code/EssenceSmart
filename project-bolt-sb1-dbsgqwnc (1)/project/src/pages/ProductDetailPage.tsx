import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import { useLikes } from '../contexts/LikesContext';
import { useAuth } from '../contexts/AuthContext';
import ProductViewer from '../components/3d/ProductViewer';
import ProductSlider from '../components/products/ProductSlider';
import { Minus, Plus, Heart, ShoppingCart, Share2, Star, CheckCircle, TruckIcon, Cuboid as Cube } from 'lucide-react';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isLiked, toggleLike } = useLikes();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [modelLoadError, setModelLoadError] = useState(false);
  
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching product:', error);
        navigate('/products');
        return;
      }
      
      setProduct(data);
      setLoading(false);
    };
    
    fetchProduct();
  }, [id, navigate]);

  // Function to validate model URL
  const isValidModelUrl = (url: string | null): boolean => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product.id, quantity);
    }
  };
  
  const handleToggleLike = () => {
    if (user) {
      toggleLike(product.id);
    } else {
      navigate('/login');
    }
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };
  
  // Calculate discounted price
  const discountedPrice = product?.discount_percent
    ? product.price - (product.price * (product.discount_percent / 100))
    : null;
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-16">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-gray-200 rounded-lg h-96"></div>
            <div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-8"></div>
              <div className="h-10 bg-gray-200 rounded mb-4"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Product not found</h1>
          <p className="mt-4 text-gray-600">The product you're looking for does not exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image/3D Model */}
        <div className="space-y-4">
          {product.model_3d_url && isValidModelUrl(product.model_3d_url) ? (
            <div className="relative">
              <ProductViewer modelUrl={product.model_3d_url} />
              <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium text-gray-700 flex items-center">
                <Cube size={16} className="mr-1" />
                3D View
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="aspect-square overflow-hidden rounded-lg bg-gray-100"
            >
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </motion.div>
          )}
          
          {/* Product badges */}
          <div className="flex flex-wrap gap-2">
            {product.featured && (
              <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded">
                Featured
              </span>
            )}
            {product.discount_percent && (
              <span className="bg-accent-100 text-accent-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {product.discount_percent}% OFF
              </span>
            )}
            <span className="bg-secondary-100 text-secondary-800 text-xs font-medium px-2.5 py-0.5 rounded">
              {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
            </span>
          </div>
        </div>
        
        {/* Product Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-3xl font-display font-bold text-gray-900">{product.name}</h1>
          
          {/* Price */}
          <div className="mt-4 flex items-center">
            {discountedPrice ? (
              <>
                <span className="text-2xl font-bold text-gray-900">${discountedPrice.toFixed(2)}</span>
                <span className="ml-2 text-lg text-gray-500 line-through">${product.price.toFixed(2)}</span>
                <span className="ml-2 text-sm font-medium text-accent-600">Save {product.discount_percent}%</span>
              </>
            ) : (
              <span className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
            )}
          </div>
          
          {/* Rating */}
          <div className="mt-4 flex items-center">
            <div className="flex text-accent-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} fill="currentColor" />
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600">4.9 (120 reviews)</span>
          </div>
          
          {/* Description */}
          <p className="mt-6 text-gray-700">{product.description}</p>
          
          {/* Stock status */}
          <div className="mt-6 flex items-center text-sm">
            {product.stock > 0 ? (
              <>
                <CheckCircle size={16} className="text-green-500 mr-1" />
                <span className="text-green-600 font-medium">In Stock</span>
                <span className="ml-1 text-gray-600">({product.stock} available)</span>
              </>
            ) : (
              <span className="text-red-600 font-medium">Out of Stock</span>
            )}
          </div>
          
          {/* Shipping info */}
          <div className="mt-2 flex items-center text-sm text-gray-600">
            <TruckIcon size={16} className="mr-1" />
            <span>Free shipping on orders over $50</span>
          </div>
          
          {/* Quantity selector */}
          <div className="mt-8">
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <div className="flex items-center w-36">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100"
                disabled={quantity <= 1}
              >
                <Minus size={16} />
              </button>
              <input
                type="number"
                id="quantity"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="p-2 w-full text-center border-y border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100"
                disabled={quantity >= product.stock}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="btn btn-primary flex-1 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart size={20} className="mr-2" />
              Add to Cart
            </button>
            
            <button
              onClick={handleToggleLike}
              className={`btn flex items-center justify-center ${
                isLiked(product.id)
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
              }`}
            >
              <Heart 
                size={20} 
                className="mr-2" 
                fill={isLiked(product.id) ? 'currentColor' : 'none'} 
              />
              {isLiked(product.id) ? 'Saved' : 'Save'}
            </button>
            
            <button
              onClick={handleShare}
              className="btn btn-secondary flex items-center justify-center"
            >
              <Share2 size={20} className="mr-2" />
              Share
            </button>
          </div>
          
          {/* Additional info tabs */}
          <div className="mt-12">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('description')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'description'
                      ? 'border-accent-500 text-accent-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab('details')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'details'
                      ? 'border-accent-500 text-accent-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Details
                </button>
                <button
                  onClick={() => setActiveTab('shipping')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'shipping'
                      ? 'border-accent-500 text-accent-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Shipping
                </button>
              </nav>
            </div>
            
            <div className="mt-6">
              {activeTab === 'description' && (
                <div className="prose prose-sm max-w-none text-gray-700">
                  <p>{product.description}</p>
                  <p className="mt-4">
                    Experience the finest quality with {product.name}. Our products are carefully selected to ensure the highest standards of excellence.
                  </p>
                </div>
              )}
              
              {activeTab === 'details' && (
                <div className="prose prose-sm max-w-none text-gray-700">
                  <ul>
                    <li><strong>Category:</strong> {product.category}</li>
                    {product.subcategory && (
                      <li><strong>Type:</strong> {product.subcategory}</li>
                    )}
                    <li><strong>SKU:</strong> ES-{product.id.substring(0, 8)}</li>
                    <li><strong>Stock:</strong> {product.stock} units</li>
                  </ul>
                </div>
              )}
              
              {activeTab === 'shipping' && (
                <div className="prose prose-sm max-w-none text-gray-700">
                  <p>
                    We offer the following shipping options:
                  </p>
                  <ul>
                    <li><strong>Standard Shipping:</strong> 3-5 business days (Free for orders over $50)</li>
                    <li><strong>Express Shipping:</strong> 1-2 business days ($12.99)</li>
                    <li><strong>Same Day Delivery:</strong> Available in select areas ($19.99)</li>
                  </ul>
                  <p className="mt-4">
                    All orders are processed within 24 hours on business days.
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Related Products */}
      <section className="mt-16">
        <ProductSlider 
          title="You Might Also Like" 
          category={product.category} 
          limit={8} 
        />
      </section>
    </div>
  );
};

export default ProductDetailPage;