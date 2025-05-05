import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminSidebar from './components/AdminSidebar';
import { supabase } from '../../lib/supabase';
import { 
  Plus, Edit, Trash2, Search, Filter, 
  ArrowUp, ArrowDown, CheckCircle, XCircle, Image
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  subcategory: string | null;
  stock: number;
  image_url: string;
  featured: boolean;
  model_3d_url: string | null;
  discount_percent: number | null;
}

const AdminProducts = () => {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product> | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  
  // Form validation
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    if (!isLoading && (!user || !profile?.is_admin)) {
      navigate('/');
    }
  }, [user, profile, isLoading, navigate]);
  
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [sortColumn, sortDirection, selectedCategory]);
  
  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('products')
        .select('*');
      
      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }
      
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }
      
      // Apply sorting
      query = query.order(sortColumn, { ascending: sortDirection === 'asc' });
      
      const { data, error } = await query;
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCategories = async () => {
    try {
      const { data } = await supabase
        .from('products')
        .select('category')
        .order('category');
      
      if (data) {
        const uniqueCategories = [...new Set(data.map(item => item.category))];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };
  
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };
  
  const handleAddProduct = () => {
    setCurrentProduct({
      name: '',
      price: 0,
      category: '',
      subcategory: '',
      stock: 0,
      image_url: '',
      featured: false,
      model_3d_url: '',
      discount_percent: 0
    });
    setFormErrors({});
    setIsModalOpen(true);
  };
  
  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product);
    setFormErrors({});
    setIsModalOpen(true);
  };
  
  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Refresh products list
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };
  
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!currentProduct?.name?.trim()) {
      errors.name = 'Product name is required';
    }
    
    if (!currentProduct?.price || currentProduct.price <= 0) {
      errors.price = 'Price must be greater than 0';
    }
    
    if (!currentProduct?.category?.trim()) {
      errors.category = 'Category is required';
    }
    
    if (!currentProduct?.image_url?.trim()) {
      errors.image_url = 'Image URL is required';
    }
    
    if (!currentProduct?.stock || currentProduct.stock < 0) {
      errors.stock = 'Stock must be 0 or greater';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setCurrentProduct(prev => prev ? { ...prev, [name]: checked } : null);
    } else if (type === 'number') {
      setCurrentProduct(prev => prev ? { ...prev, [name]: parseFloat(value) } : null);
    } else {
      setCurrentProduct(prev => prev ? { ...prev, [name]: value } : null);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      if (currentProduct?.id) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update({
            name: currentProduct.name,
            price: currentProduct.price,
            category: currentProduct.category,
            subcategory: currentProduct.subcategory,
            stock: currentProduct.stock,
            image_url: currentProduct.image_url,
            featured: currentProduct.featured,
            model_3d_url: currentProduct.model_3d_url,
            discount_percent: currentProduct.discount_percent
          })
          .eq('id', currentProduct.id);
        
        if (error) throw error;
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert([{
            name: currentProduct?.name,
            price: currentProduct?.price,
            category: currentProduct?.category,
            subcategory: currentProduct?.subcategory,
            stock: currentProduct?.stock,
            image_url: currentProduct?.image_url,
            featured: currentProduct?.featured,
            model_3d_url: currentProduct?.model_3d_url,
            discount_percent: currentProduct?.discount_percent,
            description: 'Product description goes here.' // Default description
          }]);
        
        if (error) throw error;
      }
      
      // Close modal and refresh products
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };
  
  if (isLoading || !user || !profile?.is_admin) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-16">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-16">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <AdminSidebar activePage="products" />
        </div>
        
        {/* Main content */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-display font-bold text-gray-900">Products</h1>
            <button
              onClick={handleAddProduct}
              className="btn btn-primary flex items-center"
            >
              <Plus size={18} className="mr-2" />
              Add Product
            </button>
          </div>
          
          {/* Filters and search */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
            <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <form onSubmit={handleSearch} className="relative max-w-md w-full">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-600 hover:text-primary-700"
                >
                  Search
                </button>
              </form>
              
              {/* Category filter */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Filter size={18} className="mr-2 text-gray-400" />
                  <span className="text-sm text-gray-600">Filter by:</span>
                </div>
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Products table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-6 space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center">
                      <div className="h-12 w-12 bg-gray-200 rounded"></div>
                      <div className="ml-4 space-y-2 flex-grow">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('price')}
                      >
                        <div className="flex items-center">
                          Price
                          {sortColumn === 'price' && (
                            <span className="ml-1">
                              {sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                            </span>
                          )}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('category')}
                      >
                        <div className="flex items-center">
                          Category
                          {sortColumn === 'category' && (
                            <span className="ml-1">
                              {sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                            </span>
                          )}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('stock')}
                      >
                        <div className="flex items-center">
                          Stock
                          {sortColumn === 'stock' && (
                            <span className="ml-1">
                              {sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                            </span>
                          )}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Featured
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        3D Model
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                          No products found
                        </td>
                      </tr>
                    ) : (
                      products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="h-10 w-10 rounded-md object-cover"
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                {product.discount_percent && (
                                  <div className="text-xs text-accent-600">
                                    {product.discount_percent}% off
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${product.price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="capitalize">{product.category}</span>
                            {product.subcategory && (
                              <span className="text-xs text-gray-400 block">
                                {product.subcategory}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'}>
                              {product.stock} units
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.featured ? (
                              <CheckCircle className="text-green-500" size={18} />
                            ) : (
                              <XCircle className="text-gray-300" size={18} />
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.model_3d_url ? (
                              <CheckCircle className="text-green-500" size={18} />
                            ) : (
                              <XCircle className="text-gray-300" size={18} />
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="text-primary-600 hover:text-primary-900 mr-4"
                            >
                              <Edit size={18} />
                              <span className="sr-only">Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 size={18} />
                              <span className="sr-only">Delete</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Product form modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-medium text-gray-900">
                {currentProduct?.id ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Name */}
                <div className="sm:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={currentProduct?.name || ''}
                    onChange={handleFormChange}
                    className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                  )}
                </div>
                
                {/* Price and Category */}
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Price *
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={currentProduct?.price || ''}
                    onChange={handleFormChange}
                    step="0.01"
                    min="0"
                    className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      formErrors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.price && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.price}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={currentProduct?.category || ''}
                    onChange={handleFormChange}
                    className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      formErrors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Category</option>
                    <option value="perfumes">Perfumes</option>
                    <option value="tech">Tech Devices</option>
                    <option value="medical">Medical Electronics</option>
                  </select>
                  {formErrors.category && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.category}</p>
                  )}
                </div>
                
                {/* Subcategory and Stock */}
                <div>
                  <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-1">
                    Subcategory
                  </label>
                  <input
                    type="text"
                    id="subcategory"
                    name="subcategory"
                    value={currentProduct?.subcategory || ''}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                    Stock *
                  </label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={currentProduct?.stock || ''}
                    onChange={handleFormChange}
                    min="0"
                    className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      formErrors.stock ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.stock && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.stock}</p>
                  )}
                </div>
                
                {/* Image URL */}
                <div className="sm:col-span-2">
                  <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL *
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-grow">
                      <input
                        type="text"
                        id="image_url"
                        name="image_url"
                        value={currentProduct?.image_url || ''}
                        onChange={handleFormChange}
                        placeholder="https://example.com/image.jpg"
                        className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          formErrors.image_url ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.image_url && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.image_url}</p>
                      )}
                    </div>
                    {currentProduct?.image_url && (
                      <div className="w-12 h-12 flex-shrink-0 border border-gray-200 rounded overflow-hidden">
                        <img
                          src={currentProduct.image_url}
                          alt="Product"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48?text=Error';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* 3D Model URL */}
                <div className="sm:col-span-2">
                  <label htmlFor="model_3d_url" className="block text-sm font-medium text-gray-700 mb-1">
                    3D Model URL
                  </label>
                  <input
                    type="text"
                    id="model_3d_url"
                    name="model_3d_url"
                    value={currentProduct?.model_3d_url || ''}
                    onChange={handleFormChange}
                    placeholder="https://example.com/model.glb"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    URL to a 3D model file (GLB format recommended)
                  </p>
                </div>
                
                {/* Discount and Featured */}
                <div>
                  <label htmlFor="discount_percent" className="block text-sm font-medium text-gray-700 mb-1">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    id="discount_percent"
                    name="discount_percent"
                    value={currentProduct?.discount_percent || ''}
                    onChange={handleFormChange}
                    min="0"
                    max="100"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={currentProduct?.featured || false}
                    onChange={(e) => setCurrentProduct(prev => prev ? { ...prev, featured: e.target.checked } : null)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                    Featured Product
                  </label>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {currentProduct?.id ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;