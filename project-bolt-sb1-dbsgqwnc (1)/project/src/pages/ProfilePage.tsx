import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Edit2, User, Package, CreditCard, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ProfilePage = () => {
  const { user, profile, updateProfile, uploadAvatar, signOut } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [isUploading, setIsUploading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  
  const handleSaveProfile = async () => {
    if (!user) return;
    
    await updateProfile({ full_name: fullName });
    setIsEditing(false);
  };
  
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setIsUploading(true);
    
    try {
      await uploadAvatar(file);
    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleSelectImage = () => {
    fileInputRef.current?.click();
  };
  
  const fetchOrders = async () => {
    if (!user) return;
    
    try {
      setLoadingOrders(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items:order_items(
            *,
            product:products(id, name, price, image_url)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-16">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">My Account</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 text-center border-b border-gray-200">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name || 'User'}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full flex items-center justify-center bg-primary-100 text-primary-600">
                      <User size={36} />
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={handleSelectImage}
                    className="absolute bottom-0 right-0 p-1 bg-accent-500 text-white rounded-full hover:bg-accent-600"
                  >
                    <Edit2 size={14} />
                  </button>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarUpload}
                    className="hidden"
                    accept="image/*"
                  />
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900">
                  {profile?.full_name || user?.email}
                </h2>
                <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
              </div>
              
              <nav className="px-4 py-4">
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => setActiveTab('profile')}
                      className={`w-full flex items-center px-3 py-2 rounded-md ${
                        activeTab === 'profile'
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <User size={18} className="mr-3" />
                      <span>My Profile</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setActiveTab('orders');
                        fetchOrders();
                      }}
                      className={`w-full flex items-center px-3 py-2 rounded-md ${
                        activeTab === 'orders'
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Package size={18} className="mr-3" />
                      <span>Order History</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('payment')}
                      className={`w-full flex items-center px-3 py-2 rounded-md ${
                        activeTab === 'payment'
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <CreditCard size={18} className="mr-3" />
                      <span>Payment Methods</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={signOut}
                      className="w-full flex items-center px-3 py-2 rounded-md text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={18} className="mr-3" />
                      <span>Sign Out</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
          
          {/* Main content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-xl font-medium text-gray-900">Profile Information</h2>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-primary-600 hover:text-primary-700 flex items-center"
                  >
                    <Edit2 size={16} className="mr-1" />
                    {isEditing ? 'Cancel' : 'Edit'}
                  </button>
                </div>
                
                <div className="p-6">
                  {isEditing ? (
                    <div className="space-y-6">
                      <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={user?.email || ''}
                          disabled
                          className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-500"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Email address cannot be changed
                        </p>
                      </div>
                      
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleSaveProfile}
                          className="btn btn-primary"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                          <p className="mt-1 text-sm text-gray-900">{profile?.full_name || 'Not set'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Email Address</h3>
                          <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Account Created</h3>
                        <p className="mt-1 text-sm text-gray-900">
                          {user?.created_at ? new Date(user.created_at).toLocaleDateString() : ''}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'orders' && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-medium text-gray-900">Order History</h2>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {loadingOrders ? (
                    <div className="p-6 text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-primary-600"></div>
                      <p className="mt-2 text-sm text-gray-500">Loading your orders...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="p-6 text-center">
                      <Package className="w-12 h-12 text-gray-400 mx-auto" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        You haven't placed any orders yet.
                      </p>
                    </div>
                  ) : (
                    orders.map((order) => (
                      <div key={order.id} className="p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              Order #{order.id.slice(0, 8)}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Placed on {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="mt-2 sm:mt-0">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              order.status === 'completed' ? 'bg-green-100 text-green-800' :
                              order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-6 border-t border-gray-200 pt-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-3">Order Items</h4>
                          <ul className="divide-y divide-gray-200">
                            {order.order_items.map((item: any) => (
                              <li key={item.id} className="py-4 flex">
                                <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded overflow-hidden">
                                  <img
                                    src={item.product?.image_url}
                                    alt={item.product?.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="ml-4 flex-1">
                                  <h5 className="text-sm font-medium text-gray-900">
                                    {item.product?.name}
                                  </h5>
                                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                  <p className="text-sm font-medium text-gray-900">
                                    ${(item.price * item.quantity).toFixed(2)}
                                  </p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="mt-6 border-t border-gray-200 pt-4 flex justify-between">
                          <div>
                            <p className="text-sm text-gray-600">
                              Payment Method: <span className="font-medium">{order.payment_method}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Total</p>
                            <p className="text-lg font-medium text-accent-600">${order.total.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'payment' && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-medium text-gray-900">Payment Methods</h2>
                </div>
                
                <div className="p-6">
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No payment methods</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      You haven't added any payment methods yet.
                    </p>
                    <button className="mt-4 btn btn-primary">
                      Add Payment Method
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;