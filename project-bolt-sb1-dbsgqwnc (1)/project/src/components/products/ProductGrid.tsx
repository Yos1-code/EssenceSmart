import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { supabase } from '../../lib/supabase';

interface ProductGridProps {
  category?: string;
  featured?: boolean;
  limit?: number;
  searchQuery?: string;
}

const ProductGrid = ({ category, featured, limit, searchQuery }: ProductGridProps) => {
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
      
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }
      
      // Apply limit if specified
      if (limit) {
        query = query.limit(limit);
      }
      
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
  }, [category, featured, limit, searchQuery]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(limit || 8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-64"></div>
            <div className="mt-4 h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="mt-2 h-4 bg-gray-200 rounded"></div>
            <div className="mt-1 h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="mt-4 h-6 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-gray-600">No products found</h3>
        <p className="mt-2 text-gray-500">
          {searchQuery 
            ? `No results for "${searchQuery}". Try a different search term.` 
            : 'Try a different category or check back later.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;