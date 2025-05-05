import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminSidebar from './components/AdminSidebar';
import { supabase } from '../../lib/supabase';
import { DollarSign, Package, ShoppingBag, Users, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

const AdminDashboard = () => {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    pendingOrders: 0
  });
  
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  
  useEffect(() => {
    if (!isLoading && (!user || !profile?.is_admin)) {
      navigate('/');
    }
  }, [user, profile, isLoading, navigate]);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        
        // Fetch total products
        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });
        
        // Fetch total orders
        const { count: ordersCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true });
        
        // Fetch pending orders
        const { count: pendingCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');
        
        // Fetch total customers
        const { count: customersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('is_admin', false);
        
        // Fetch total sales
        const { data: salesData } = await supabase
          .from('orders')
          .select('total');
        
        const totalSales = salesData?.reduce((sum, order) => sum + order.total, 0) || 0;
        
        setStats({
          totalSales,
          totalOrders: ordersCount || 0,
          totalProducts: productsCount || 0,
          totalCustomers: customersCount || 0,
          pendingOrders: pendingCount || 0
        });
        
        // Fetch recent orders
        const { data: recentOrdersData } = await supabase
          .from('orders')
          .select(`
            *,
            profiles(full_name)
          `)
          .order('created_at', { ascending: false })
          .limit(5);
          
        setRecentOrders(recentOrdersData || []);
        
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };
    
    if (user && profile?.is_admin) {
      fetchStats();
    }
  }, [user, profile]);
  
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
          <AdminSidebar activePage="dashboard" />
        </div>
        
        {/* Main content */}
        <div className="flex-1">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">Admin Dashboard</h1>
          
          {/* Stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <DollarSign size={24} />
                </div>
                <div className="ml-4">
                  <h2 className="text-sm font-medium text-gray-500">Total Sales</h2>
                  {loadingStats ? (
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-24 mt-1"></div>
                  ) : (
                    <p className="text-2xl font-semibold text-gray-900">${stats.totalSales.toFixed(2)}</p>
                  )}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-green-600 flex items-center">
                  <TrendingUp size={12} className="mr-1" />
                  <span>12% increase</span>
                </div>
                <div className="text-xs text-gray-500">vs last month</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <Package size={24} />
                </div>
                <div className="ml-4">
                  <h2 className="text-sm font-medium text-gray-500">Total Orders</h2>
                  {loadingStats ? (
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-16 mt-1"></div>
                  ) : (
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalOrders}</p>
                  )}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="text-xs text-orange-600 flex items-center">
                    <Package size={12} className="mr-1" />
                    <span>{stats.pendingOrders} pending</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  <Calendar size={12} className="inline mr-1" />
                  This month
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <ShoppingBag size={24} />
                </div>
                <div className="ml-4">
                  <h2 className="text-sm font-medium text-gray-500">Total Products</h2>
                  {loadingStats ? (
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-16 mt-1"></div>
                  ) : (
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalProducts}</p>
                  )}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-purple-600 flex items-center">
                  <TrendingUp size={12} className="mr-1" />
                  <span>8 new</span>
                </div>
                <div className="text-xs text-gray-500">last 7 days</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-pink-100 text-pink-600">
                  <Users size={24} />
                </div>
                <div className="ml-4">
                  <h2 className="text-sm font-medium text-gray-500">Total Customers</h2>
                  {loadingStats ? (
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-16 mt-1"></div>
                  ) : (
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalCustomers}</p>
                  )}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-red-600 flex items-center">
                  <TrendingDown size={12} className="mr-1" />
                  <span>3% decrease</span>
                </div>
                <div className="text-xs text-gray-500">vs last week</div>
              </div>
            </div>
          </div>
          
          {/* Recent orders */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
            </div>
            
            <div className="overflow-x-auto">
              {loadingStats ? (
                <div className="p-6 space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4 ml-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4 ml-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4 ml-4"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                          No orders found
                        </td>
                      </tr>
                    ) : (
                      recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{order.id.slice(0, 8)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.profiles?.full_name || 'Unknown'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${order.total.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              order.status === 'completed' ? 'bg-green-100 text-green-800' :
                              order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          
          {/* Quick actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/admin/products')}
                className="btn btn-secondary flex items-center justify-center"
              >
                <ShoppingBag size={18} className="mr-2" />
                Manage Products
              </button>
              <button
                onClick={() => navigate('/admin/orders')}
                className="btn btn-secondary flex items-center justify-center"
              >
                <Package size={18} className="mr-2" />
                Manage Orders
              </button>
              <button className="btn btn-secondary flex items-center justify-center">
                <Users size={18} className="mr-2" />
                Manage Customers
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;