import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminSidebar from './components/AdminSidebar';
import { supabase } from '../../lib/supabase';
import { Eye, Search, Filter, ArrowUp, ArrowDown, Package, CheckCircle, TruckIcon, XCircle } from 'lucide-react';

interface Order {
  id: string;
  created_at: string;
  user_id: string;
  total: number;
  status: string;
  payment_method: string;
  shipping_address: any;
  profiles?: {
    full_name: string;
  };
  order_items?: any[];
}

const AdminOrders = () => {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  
  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];
  
  useEffect(() => {
    if (!isLoading && (!user || !profile?.is_admin)) {
      navigate('/');
    }
  }, [user, profile, isLoading, navigate]);
  
  useEffect(() => {
    fetchOrders();
  }, [sortColumn, sortDirection, selectedStatus]);
  
  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('orders')
        .select(`
          *,
          profiles(full_name)
        `);
      
      if (selectedStatus) {
        query = query.eq('status', selectedStatus);
      }
      
      if (searchTerm) {
        query = query.or(`id.ilike.%${searchTerm}%,profiles.full_name.ilike.%${searchTerm}%`);
      }
      
      // Apply sorting
      query = query.order(sortColumn, { ascending: sortDirection === 'asc' });
      
      const { data, error } = await query;
      
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
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
    fetchOrders();
  };
  
  const handleViewOrder = async (order: Order) => {
    try {
      setLoading(true);
      
      // Fetch order details with items
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles(full_name),
          order_items(
            *,
            product:products(
              id,
              name,
              price,
              image_url
            )
          )
        `)
        .eq('id', order.id)
        .single();
      
      if (error) throw error;
      
      setCurrentOrder(data);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      
      if (error) throw error;
      
      // Update current order in modal
      if (currentOrder && currentOrder.id === orderId) {
        setCurrentOrder({
          ...currentOrder,
          status: newStatus
        });
      }
      
      // Refresh orders list
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const StatusBadge = ({ status }: { status: string }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(status)}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
  
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
          <AdminSidebar activePage="orders" />
        </div>
        
        {/* Main content */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-display font-bold text-gray-900">Orders</h1>
          </div>
          
          {/* Filters and search */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
            <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <form onSubmit={handleSearch} className="relative max-w-md w-full">
                <input
                  type="text"
                  placeholder="Search by order ID or customer name..."
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
              
              {/* Status filter */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Filter size={18} className="mr-2 text-gray-400" />
                  <span className="text-sm text-gray-600">Filter by:</span>
                </div>
                <select
                  value={selectedStatus || ''}
                  onChange={(e) => setSelectedStatus(e.target.value || null)}
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Statuses</option>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Orders table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-6 space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center">
                      <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/6 ml-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/6 ml-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/6 ml-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/6 ml-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/6 ml-4"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('id')}
                      >
                        <div className="flex items-center">
                          Order ID
                          {sortColumn === 'id' && (
                            <span className="ml-1">
                              {sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                            </span>
                          )}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('created_at')}
                      >
                        <div className="flex items-center">
                          Date
                          {sortColumn === 'created_at' && (
                            <span className="ml-1">
                              {sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                            </span>
                          )}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('total')}
                      >
                        <div className="flex items-center">
                          Total
                          {sortColumn === 'total' && (
                            <span className="ml-1">
                              {sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                            </span>
                          )}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center">
                          Status
                          {sortColumn === 'status' && (
                            <span className="ml-1">
                              {sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                            </span>
                          )}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                          No orders found
                        </td>
                      </tr>
                    ) : (
                      orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{order.id.slice(0, 8)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.profiles?.full_name || 'Unknown'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(order.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                            ${order.total.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={order.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                            <button
                              onClick={() => handleViewOrder(order)}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              <Eye size={18} />
                              <span className="sr-only">View</span>
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
      
      {/* Order details modal */}
      {isModalOpen && currentOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-medium text-gray-900">
                Order #{currentOrder.id.slice(0, 8)}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Order information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Order Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="text-sm font-medium">{formatDate(currentOrder.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <div className="mt-1">
                          <StatusBadge status={currentOrder.status} />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Customer</p>
                        <p className="text-sm font-medium">{currentOrder.profiles?.full_name || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Payment Method</p>
                        <p className="text-sm font-medium capitalize">{currentOrder.payment_method}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Shipping information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Shipping Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium">{currentOrder.shipping_address.fullName}</p>
                    <p className="text-sm text-gray-700">{currentOrder.shipping_address.address}</p>
                    <p className="text-sm text-gray-700">
                      {currentOrder.shipping_address.city}, {currentOrder.shipping_address.state} {currentOrder.shipping_address.zipCode}
                    </p>
                    <p className="text-sm text-gray-700">{currentOrder.shipping_address.country}</p>
                    <p className="text-sm text-gray-700 mt-2">
                      <span className="font-medium">Phone:</span> {currentOrder.shipping_address.phone}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Order items */}
              <h3 className="text-lg font-medium text-gray-900 mb-2">Order Items</h3>
              <div className="bg-gray-50 rounded-lg overflow-hidden mb-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentOrder.order_items?.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img
                                src={item.product?.image_url}
                                alt={item.product?.name}
                                className="h-10 w-10 rounded-md object-cover"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{item.product?.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${item.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                        Total
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        ${currentOrder.total.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              {/* Update status */}
              <h3 className="text-lg font-medium text-gray-900 mb-2">Update Status</h3>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleUpdateStatus(currentOrder.id, option.value)}
                    disabled={currentOrder.status === option.value}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      currentOrder.status === option.value
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {option.value === 'processing' && <Package size={16} className="inline mr-1" />}
                    {option.value === 'shipped' && <TruckIcon size={16} className="inline mr-1" />}
                    {option.value === 'completed' && <CheckCircle size={16} className="inline mr-1" />}
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;