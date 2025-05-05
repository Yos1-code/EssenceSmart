import { useEffect, useState } from 'react';
import Slider from 'react-slick';
import ProductCard from './ProductCard';
import { supabase } from '../../lib/supabase';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Import slick carousel styles
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

interface ProductSliderProps {
  title: string;
  category?: string;
  featured?: boolean;
  limit?: number;
}

const ProductSlider = ({ title, category, featured, limit = 8 }: ProductSliderProps) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      
      let query = supabase
        .from('products')
        .select('*');
      
      // Apply filters
      if (category) {
        query = query.eq('category', category);
      }
      
      if (featured) {
        query = query.eq('featured', true);
      }
      
      // Apply limit
      query = query.limit(limit);
      
      // Order by featured and created_at
      query = query.order('featured', { ascending: false }).order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setProducts(data || []);
      }
      
      setLoading(false);
    };
    
    fetchProducts();
  }, [category, featured, limit]);

  // Custom prev arrow component
  const PrevArrow = (props: any) => {
    const { onClick } = props;
    return (
      <button
        onClick={onClick}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 -ml-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 focus:outline-none"
        aria-label="Previous"
      >
        <ChevronLeft size={20} />
      </button>
    );
  };

  // Custom next arrow component
  const NextArrow = (props: any) => {
    const { onClick } = props;
    return (
      <button
        onClick={onClick}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 -mr-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 focus:outline-none"
        aria-label="Next"
      >
        <ChevronRight size={20} />
      </button>
    );
  };

  const settings = {
    dots: true,
    infinite: products.length > 4,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  if (loading) {
    return (
      <div className="py-8">
        <h2 className="text-2xl font-display font-medium mb-6">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-64"></div>
              <div className="mt-4 h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="mt-2 h-4 bg-gray-200 rounded"></div>
              <div className="mt-1 h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="mt-4 h-6 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="py-8">
      <h2 className="text-2xl font-display font-medium mb-6">{title}</h2>
      <div className="px-4">
        <Slider {...settings}>
          {products.map((product) => (
            <div key={product.id} className="px-2">
              <ProductCard product={product} />
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default ProductSlider;