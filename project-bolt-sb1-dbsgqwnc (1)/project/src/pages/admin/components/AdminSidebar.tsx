import { Link } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users, Settings, BarChart } from 'lucide-react';

interface AdminSidebarProps {
  activePage: string;
}

const AdminSidebar = ({ activePage }: AdminSidebarProps) => {
  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, id: 'dashboard' },
    { name: 'Products', href: '/admin/products', icon: ShoppingBag, id: 'products' },
    { name: 'Orders', href: '/admin/orders', icon: Package, id: 'orders' },
    { name: 'Customers', href: '/admin/customers', icon: Users, id: 'customers' },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart, id: 'analytics' },
    { name: 'Settings', href: '/admin/settings', icon: Settings, id: 'settings' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-medium text-gray-900">Admin Panel</h2>
      </div>
      <nav className="px-4 py-4">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                to={item.href}
                className={`flex items-center px-3 py-2 rounded-md ${
                  activePage === item.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon size={18} className="mr-3" />
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default AdminSidebar;