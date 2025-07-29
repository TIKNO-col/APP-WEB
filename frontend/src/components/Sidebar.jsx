import { Link, useLocation } from 'react-router-dom';
import { Users, ShoppingCart, FileText, BarChart2, UserCircle, LogOut } from 'lucide-react';
import { logout } from '../services/auth';
import { useState, useEffect } from 'react';
import { makeAuthenticatedRequest } from '../services/auth';

const Sidebar = () => {
  const location = useLocation();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await makeAuthenticatedRequest('/usuarios/perfil/', { method: 'GET' });
        const userData = await response.json();
        setUserRole(userData.rol);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    fetchUserProfile();
  }, []);

  const allMenuItems = [
    { name: 'Clientes', icon: Users, path: '/clientes' },
    { name: 'Productos', icon: ShoppingCart, path: '/productos' },
    { name: 'Ventas', icon: FileText, path: '/ventas' },
    { name: 'Informes', icon: BarChart2, path: '/informes', adminOnly: true },
    { name: 'Usuarios', icon: UserCircle, path: '/usuarios' },
  ];

  const menuItems = allMenuItems.filter(item => {
    if (item.adminOnly && userRole === 'Usuario') {
      return false;
    }
    return true;
  });

  const handleLogout = () => {
    logout();
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-gray-200">
      <div className="flex h-full flex-col overflow-y-auto">
        <div className="flex h-16 items-center px-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">VentasApp</h1>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;