import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductGrid from '../components/products/ProductGrid';
import { supabase } from '../lib/supabase';
import { Filter, Search } from 'lucide-react';

const ProductsPage = () => {
  const { category } = useParams<{ category?: string }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialSearchTerm = searchParams.get('search') || '';
  
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(category);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  
  useEffect(() => {
    setSelectedCategory(category);
  }, [category]);
  
  useEffect(() => {
    // Fetch distinct categories
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('products')
        .select('category')
        .order('category');
      
      if (data) {
        const uniqueCategories = [...new Set(data.map(item => item.category))];
        setCategories(uniqueCategories);
      }
    };
    
    // Fetch subcategories based on selected category
    const fetchSubcategories = async () => {
      let query = supabase
        .from('products')
        .select('subcategory')
        .order('subcategory');
      
      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }
      
      const { data } = await query;
      
      if (data) {
        const uniqueSubcategories = [...new Set(data
          .map(item => item.subcategory)
          .filter(Boolean) as string[]
        )];
        setSubcategories(uniqueSubcategories);
      }
    };
    
    // Fetch max price for range slider
    const fetchMaxPrice = async () => {
      const { data } = await supabase
        .from('products')
        .select('price')
        .order('price', { ascending: false })
        .limit(1);
      
      if (data && data.length > 0) {
        setMaxPrice(Math.ceil(data[0].price));
        setPriceRange([0, Math.ceil(data[0].price)]);
      }
    };
    
    fetchCategories();
    fetchSubcategories();
    fetchMaxPrice();
  }, [selectedCategory]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search logic implemented via searchTerm state
  };
  
  const handleCategoryChange = (newCategory: string) => {
    setSelectedCategory(newCategory);
    setSelectedSubcategory(null);
  };
  
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newValue = parseInt(e.target.value);
    const newRange = [...priceRange] as [number, number];
    newRange[index] = newValue;
    setPriceRange(newRange);
  };
  
  const pageTitle = selectedCategory
    ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`
    : "All Products";

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-16">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900">{pageTitle}</h1>
        
        <div className="mt-4 md:mt-0 flex items-center">
          <form onSubmit={handleSearch} className="relative mr-4">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </form>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-sm font-medium text-gray-700 hover:text-primary-600"
          >
            <Filter size={18} className="mr-1" />
            Filters
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters sidebar */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ 
            opacity: showFilters ? 1 : 0,
            height: showFilters ? 'auto' : 0
          }}
          transition={{ duration: 0.3 }}
          className="lg:block overflow-hidden"
        >
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
            
            {/* Categories */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Categories</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="all-categories"
                    type="radio"
                    name="category"
                    checked={!selectedCategory}
                    onChange={() => setSelectedCategory(undefined)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="all-categories" className="ml-2 text-sm text-gray-600">
                    All Categories
                  </label>
                </div>
                
                {categories.map((cat) => (
                  <div key={cat} className="flex items-center">
                    <input
                      id={`category-${cat}`}
                      type="radio"
                      name="category"
                      checked={selectedCategory === cat}
                      onChange={() => handleCategoryChange(cat)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`category-${cat}`} className="ml-2 text-sm text-gray-600">
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Subcategories */}
            {subcategories.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Types</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      id="all-subcategories"
                      type="radio"
                      name="subcategory"
                      checked={selectedSubcategory === null}
                      onChange={() => setSelectedSubcategory(null)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="all-subcategories" className="ml-2 text-sm text-gray-600">
                      All Types
                    </label>
                  </div>
                  
                  {subcategories.map((subcat) => (
                    <div key={subcat} className="flex items-center">
                      <input
                        id={`subcategory-${subcat}`}
                        type="radio"
                        name="subcategory"
                        checked={selectedSubcategory === subcat}
                        onChange={() => setSelectedSubcategory(subcat)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`subcategory-${subcat}`} className="ml-2 text-sm text-gray-600">
                        {subcat.charAt(0).toUpperCase() + subcat.slice(1)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Price Range */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Price Range</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">${priceRange[0]}</span>
                  <span className="text-sm text-gray-600">${priceRange[1]}</span>
                </div>
                <div className="flex space-x-4">
                  <input
                    type="range"
                    min="0"
                    max={maxPrice}
                    value={priceRange[0]}
                    onChange={(e) => handlePriceChange(e, 0)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="range"
                    min="0"
                    max={maxPrice}
                    value={priceRange[1]}
                    onChange={(e) => handlePriceChange(e, 1)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div className="flex space-x-4">
                  <div>
                    <label htmlFor="min-price" className="block text-xs text-gray-500">Min</label>
                    <input
                      type="number"
                      id="min-price"
                      min="0"
                      max={maxPrice}
                      value={priceRange[0]}
                      onChange={(e) => handlePriceChange(e, 0)}
                      className="w-full p-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label htmlFor="max-price" className="block text-xs text-gray-500">Max</label>
                    <input
                      type="number"
                      id="max-price"
                      min="0"
                      max={maxPrice}
                      value={priceRange[1]}
                      onChange={(e) => handlePriceChange(e, 1)}
                      className="w-full p-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Discounts */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Discounts</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="on-sale"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="on-sale" className="ml-2 text-sm text-gray-600">
                    On Sale
                  </label>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Products grid */}
        <div className="lg:col-span-3">
          <ProductGrid 
            category={selectedCategory}
            searchQuery={searchTerm} 
          />
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;