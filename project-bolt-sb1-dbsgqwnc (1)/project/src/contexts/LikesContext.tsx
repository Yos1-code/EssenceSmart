import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface LikedProduct {
  id: string;
  product_id: string;
  user_id: string;
  product?: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    category: string;
    description: string;
    discount_percent?: number | null;
  };
}

interface LikesContextType {
  likedProducts: LikedProduct[];
  isLoading: boolean;
  toggleLike: (productId: string) => Promise<void>;
  isLiked: (productId: string) => boolean;
}

const LikesContext = createContext<LikesContextType | undefined>(undefined);

export function LikesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [likedProducts, setLikedProducts] = useState<LikedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch liked products when user changes
  useEffect(() => {
    if (user) {
      fetchLikedProducts();
    } else {
      setLikedProducts([]);
      setIsLoading(false);
    }
  }, [user]);

  // Subscribe to likes changes
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('likes_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'product_likes',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        fetchLikedProducts();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  async function fetchLikedProducts() {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('product_likes')
        .select(`
          *,
          product:products(
            id,
            name,
            price,
            image_url,
            category,
            description,
            discount_percent
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setLikedProducts(data || []);
    } catch (error) {
      console.error('Error fetching liked products:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function toggleLike(productId: string) {
    if (!user) return;
    
    try {
      const isCurrentlyLiked = isLiked(productId);

      if (isCurrentlyLiked) {
        // Remove like
        const { error } = await supabase
          .from('product_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) throw error;
      } else {
        // Add like
        const { error } = await supabase
          .from('product_likes')
          .insert({
            user_id: user.id,
            product_id: productId,
          });

        if (error) throw error;
      }

      await fetchLikedProducts();
    } catch (error) {
      console.error('Error toggling product like:', error);
    }
  }

  function isLiked(productId: string): boolean {
    return likedProducts.some(item => item.product_id === productId);
  }

  const value = {
    likedProducts,
    isLoading,
    toggleLike,
    isLiked,
  };

  return <LikesContext.Provider value={value}>{children}</LikesContext.Provider>;
}

export function useLikes() {
  const context = useContext(LikesContext);
  if (context === undefined) {
    throw new Error('useLikes must be used within a LikesProvider');
  }
  return context;
}