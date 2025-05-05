import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useLikes } from '../../contexts/LikesContext';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    category: string;
    discount_percent?: number | null;
  };
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isLiked, toggleLike } = useLikes();
  const [isHovering, setIsHovering] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id);
  };

  const handleToggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (user) {
      toggleLike(product.id);
    } else {
      window.location.href = '/login';
    }
  };

  // Calculate discounted price
  const discountedPrice = product.discount_percent
    ? product.price - (product.price * (product.discount_percent / 100))
    : null;

  return (
    <div 
      className="product-card group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Link to={`/product/${product.id}`} className="block">
        {/* Product image */}
        <div className="relative overflow-hidden">
          <img 
            src={product.image_url} 
            alt={product.name}
            className="product-card-img"
          />

          {/* Discount badge */}
          {product.discount_percent && (
            <div className="absolute top-2 left-2 bg-accent-500 text-white text-xs font-bold px-2 py-1 rounded-md">
              {product.discount_percent}% OFF
            </div>
          )}

          {/* Quick action buttons */}
          <div 
            className={`absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center gap-2 transition-opacity duration-300 ${
              isHovering ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <button 
              onClick={handleAddToCart}
              className="p-2 bg-white rounded-full shadow-md hover:bg-accent-50 transition-colors"
              aria-label="Add to cart"
            >
              <ShoppingCart size={18} className="text-accent-600" />
            </button>
            <button 
              onClick={handleToggleLike}
              className={`p-2 rounded-full shadow-md transition-colors ${
                isLiked(product.id) 
                  ? 'bg-red-500' 
                  : 'bg-white hover:bg-red-50'
              }`}
              aria-label={isLiked(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart 
                size={18} 
                className={isLiked(product.id) ? 'text-white' : 'text-red-500'} 
                fill={isLiked(product.id) ? 'currentColor' : 'none'}
              />
            </button>
          </div>

          {/* Category tag */}
          <div className="absolute bottom-2 left-2 bg-white bg-opacity-80 text-xs font-medium px-2 py-1 rounded-md">
            {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
          </div>
        </div>

        {/* Product info */}
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 truncate group-hover:text-accent-600 transition-colors">
            {product.name}
          </h3>
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">
            {product.description}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <div>
              {discountedPrice ? (
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">
                    ${discountedPrice.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    ${product.price.toFixed(2)}
                  </span>
                </div>
              ) : (
                <span className="font-medium text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs text-accent-600 font-medium">View Details</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;