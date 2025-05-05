import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductSlider from '../components/products/ProductSlider';
import { ArrowRight, ShoppingBag, Truck, Shield, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

const HomePage = () => {
  const [heroProducts, setHeroProducts] = useState<any[]>([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  useEffect(() => {
    const fetchHeroProducts = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(3);
      
      setHeroProducts(data || []);
    };
    
    fetchHeroProducts();
    
    // Auto rotate hero products
    const interval = setInterval(() => {
      setCurrentHeroIndex((prevIndex) => 
        prevIndex === (heroProducts.length - 1) ? 0 : prevIndex + 1
      );
    }, 6000);
    
    return () => clearInterval(interval);
  }, [heroProducts.length]);

  const currentHero = heroProducts[currentHeroIndex];

  return (
    <div>
      {/* Hero Section */}
      {currentHero ? (
        <section 
          className="min-h-screen flex items-center pt-16 bg-gradient-to-r from-primary-50 to-secondary-50"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(245, 243, 242, 0.9), rgba(243, 244, 246, 0.8)), url(${currentHero.image_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-primary-900 leading-tight">
                  Discover {currentHero.name}
                </h1>
                <p className="mt-4 text-lg text-primary-700 max-w-xl">
                  {currentHero.description}
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Link 
                    to={`/product/${currentHero.id}`}
                    className="btn btn-primary"
                  >
                    View Details
                  </Link>
                  <Link 
                    to={`/products/${currentHero.category}`}
                    className="btn btn-secondary flex items-center"
                  >
                    Explore {currentHero.category.charAt(0).toUpperCase() + currentHero.category.slice(1)} 
                    <ArrowRight className="ml-2" size={18} />
                  </Link>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7 }}
                className="hidden lg:block"
              >
                <div className="aspect-square max-w-md mx-auto rounded-full overflow-hidden shadow-2xl border-8 border-white">
                  <img 
                    src={currentHero.image_url} 
                    alt={currentHero.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            </div>
            
            {/* Hero pagination */}
            <div className="flex justify-center mt-8 space-x-2">
              {heroProducts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentHeroIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentHeroIndex ? 'bg-accent-500' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>
      ) : (
        <div className="min-h-screen bg-gray-50"></div>
      )}

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-gray-900">Explore Our Collections</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto">
              From exquisite fragrances to cutting-edge technology and medical devices
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Perfumes Category */}
            <Link 
              to="/products/perfumes"
              className="group relative overflow-hidden rounded-lg aspect-[4/5] shadow-lg"
            >
              <img 
                src="https://images.pexels.com/photos/5865227/pexels-photo-5865227.jpeg" 
                alt="Perfumes Collection"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-display font-bold text-white">Perfumes</h3>
                <p className="text-gray-200 mt-2">Captivating scents for every occasion</p>
                <span className="inline-flex items-center mt-4 text-accent-300 group-hover:text-accent-200">
                  Explore <ArrowRight className="ml-2" size={16} />
                </span>
              </div>
            </Link>
            
            {/* Tech Devices Category */}
            <Link 
              to="/products/tech"
              className="group relative overflow-hidden rounded-lg aspect-[4/5] shadow-lg"
            >
              <img 
                src="https://images.pexels.com/photos/4065864/pexels-photo-4065864.jpeg" 
                alt="Tech Devices Collection"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-display font-bold text-white">Tech Devices</h3>
                <p className="text-gray-200 mt-2">Innovative technology for modern living</p>
                <span className="inline-flex items-center mt-4 text-accent-300 group-hover:text-accent-200">
                  Explore <ArrowRight className="ml-2" size={16} />
                </span>
              </div>
            </Link>
            
            {/* Medical Electronics Category */}
            <Link 
              to="/products/medical"
              className="group relative overflow-hidden rounded-lg aspect-[4/5] shadow-lg"
            >
              <img 
                src="https://images.pexels.com/photos/4226119/pexels-photo-4226119.jpeg" 
                alt="Medical Electronics Collection"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-display font-bold text-white">Medical Electronics</h3>
                <p className="text-gray-200 mt-2">Quality health monitoring devices</p>
                <span className="inline-flex items-center mt-4 text-accent-300 group-hover:text-accent-200">
                  Explore <ArrowRight className="ml-2" size={16} />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Slider */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ProductSlider 
            title="Featured Products" 
            featured={true} 
            limit={8} 
          />
        </div>
      </section>

      {/* 3D Experience Banner */}
      <section className="py-16 bg-primary-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-display font-bold">Experience Perfumes in 3D</h2>
              <p className="mt-4 text-primary-200 text-lg">
                Explore our perfume collection like never before with our interactive 3D viewer. Rotate, zoom, and examine every detail before you purchase.
              </p>
              <Link 
                to="/products/perfumes"
                className="mt-8 inline-flex items-center btn btn-primary bg-accent-500 hover:bg-accent-600"
              >
                Try 3D View
              </Link>
            </div>
            <div className="relative mt-10 lg:mt-0 p-4">
              <div className="absolute inset-0 opacity-30 bg-pattern-dots rounded-lg"></div>
              <img 
                src="https://images.pexels.com/photos/4110341/pexels-photo-4110341.jpeg"
                alt="3D Perfume Experience"
                className="relative z-10 w-full h-auto rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Sliders */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ProductSlider 
            title="Premium Perfumes" 
            category="perfumes" 
            limit={8} 
          />
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ProductSlider 
            title="Advanced Tech Devices" 
            category="tech" 
            limit={8} 
          />
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ProductSlider 
            title="Medical Electronics" 
            category="medical" 
            limit={8} 
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-gray-900">Why Choose Essence Smart</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto">
              We provide exceptional quality and service in every aspect of your shopping experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 mx-auto bg-primary-50 rounded-full flex items-center justify-center">
                <ShoppingBag className="text-primary-600" size={28} />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">Premium Quality</h3>
              <p className="mt-2 text-gray-600">
                All our products are carefully selected to ensure the highest quality standards.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 mx-auto bg-primary-50 rounded-full flex items-center justify-center">
                <Truck className="text-primary-600" size={28} />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">Fast Shipping</h3>
              <p className="mt-2 text-gray-600">
                Enjoy quick delivery with our efficient shipping process for all orders.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 mx-auto bg-primary-50 rounded-full flex items-center justify-center">
                <Shield className="text-primary-600" size={28} />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">Secure Shopping</h3>
              <p className="mt-2 text-gray-600">
                Your transactions are protected with advanced security measures.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 mx-auto bg-primary-50 rounded-full flex items-center justify-center">
                <RefreshCw className="text-primary-600" size={28} />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">Easy Returns</h3>
              <p className="mt-2 text-gray-600">
                Not satisfied? Our hassle-free return policy has you covered.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-accent-500 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-display font-bold">Stay Updated</h2>
            <p className="mt-4 text-lg text-accent-50">
              Subscribe to our newsletter for exclusive offers, new product announcements, and more.
            </p>
            
            <div className="mt-8 max-w-md mx-auto">
              <form className="flex">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-grow px-4 py-3 rounded-l-md focus:outline-none focus:ring-2 focus:ring-white text-gray-900"
                />
                <button
                  type="submit"
                  className="bg-primary-900 hover:bg-primary-800 text-white px-6 py-3 rounded-r-md transition-colors"
                >
                  Subscribe
                </button>
              </form>
              <p className="mt-4 text-sm text-accent-100">
                By subscribing, you agree to our Privacy Policy and Terms of Service.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;