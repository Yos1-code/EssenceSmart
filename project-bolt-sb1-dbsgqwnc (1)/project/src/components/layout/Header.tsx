import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, Heart, User, Search, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const Header = () => {
  const { user, profile, signOut } = useAuth();
  const { totalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu when navigating
    setIsMenuOpen(false);
  }, [location]);

  const isHomePage = location.pathname === '/';
  const headerClass = `fixed w-full z-50 transition-all duration-300 ${
    isScrolled || !isHomePage
      ? 'bg-white shadow-md text-gray-800'
      : 'bg-transparent text-white'
  }`;

  const navLinkClass = `nav-link ${
    isScrolled || !isHomePage ? 'nav-link-dark' : 'nav-link-light'
  }`;

  return (
    <header className={headerClass}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="font-display text-2xl font-bold">Essence Smart</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link to="/" className={navLinkClass}>
              Home
            </Link>
            <div className="relative group">
              <button className={`${navLinkClass} flex items-center`}>
                Products <ChevronDown size={16} className="ml-1" />
              </button>
              <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <div className="py-1">
                  <Link to="/products/perfumes" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Perfumes
                  </Link>
                  <Link to="/products/tech" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Tech Devices
                  </Link>
                  <Link to="/products/medical" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Medical Electronics
                  </Link>
                  <Link to="/products" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    All Products
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          {/* Search bar (desktop) */}
          <div className="hidden md:block flex-1 max-w-md mx-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 mt-2 mr-3 text-gray-400 hover:text-accent-500"
              >
                <Search size={20} />
              </button>
            </form>
          </div>

          {/* User Actions (desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/cart" className="p-2 relative">
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-accent-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            
            {user ? (
              <>
                <Link to="/saved-items" className="p-2">
                  <Heart size={24} />
                </Link>
                <div className="relative">
                  <button 
                    onClick={toggleProfile}
                    className="flex items-center p-2 rounded-full focus:outline-none"
                  >
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name || 'User'}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <User size={24} />
                    )}
                  </button>
                  
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 ring-1 ring-black ring-opacity-5">
                      {profile?.full_name && (
                        <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                          Hello, {profile.full_name}
                        </div>
                      )}
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        My Profile
                      </Link>
                      {profile?.is_admin && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          signOut();
                          setIsProfileOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="btn btn-primary py-2 px-4 text-sm"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <Link to="/cart" className="p-2 mr-2 relative">
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-accent-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg py-4">
          <form onSubmit={handleSearch} className="px-4 mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 mt-2 mr-3 text-gray-400 hover:text-accent-500"
              >
                <Search size={20} />
              </button>
            </div>
          </form>
          
          <div className="space-y-1 px-4">
            <Link to="/" className="block py-2 text-gray-800 font-medium">
              Home
            </Link>
            <div className="py-2">
              <div className="flex justify-between items-center text-gray-800 font-medium">
                <span>Products</span>
              </div>
              <div className="ml-4 mt-1 space-y-1">
                <Link to="/products/perfumes" className="block py-1 text-gray-600">
                  Perfumes
                </Link>
                <Link to="/products/tech" className="block py-1 text-gray-600">
                  Tech Devices
                </Link>
                <Link to="/products/medical" className="block py-1 text-gray-600">
                  Medical Electronics
                </Link>
                <Link to="/products" className="block py-1 text-gray-600">
                  All Products
                </Link>
              </div>
            </div>
            
            {user ? (
              <>
                <Link to="/saved-items" className="block py-2 text-gray-800 font-medium">
                  Saved Items
                </Link>
                <Link to="/profile" className="block py-2 text-gray-800 font-medium">
                  My Profile
                </Link>
                {profile?.is_admin && (
                  <Link to="/admin" className="block py-2 text-gray-800 font-medium">
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={signOut}
                  className="block w-full text-left py-2 text-gray-800 font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block py-2 text-gray-800 font-medium"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;