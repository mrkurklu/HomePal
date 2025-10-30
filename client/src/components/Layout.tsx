import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { Home, PlusCircle, User, LogOut, FileText, Bell, CalendarClock } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  userRole: 'homeowner' | 'professional';
}

export default function Layout({ children, userRole }: LayoutProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications');
      const unread = res.data.filter((n: any) => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Fetch notifications error:', error);
    }
  };

  const handleLogout = () => {
    logout();
    toast.info('Çıkış yapıldı');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to={`/${userRole}`} className="flex items-center">
                <div className="text-2xl font-bold text-primary-600">HomePal</div>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {userRole === 'homeowner' && (
                <>
                  <Link
                    to="/reminders"
                    className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 font-medium"
                    title="Rutin Bakım Hatırlatıcısı"
                  >
                    <CalendarClock size={20} />
                    <span>Rutin Bakım Hatırlatıcısı</span>
                  </Link>
                  <Link
                    to="/quotes"
                    className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 font-medium"
                  >
                    <FileText size={20} />
                    <span>Teklifler</span>
                  </Link>
                  <Link
                    to="/jobs/create"
                    className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 font-medium"
                  >
                    <PlusCircle size={20} />
                    <span>Yeni İş Emri</span>
                  </Link>
                </>
              )}
              
              {userRole === 'professional' && (
                <Link
                  to="/quotes"
                  className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 font-medium"
                >
                  <FileText size={20} />
                  <span>Tekliflerim</span>
                </Link>
              )}
              
              <Link
                to="/notifications"
                className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors"
                title="Bildirimler"
              >
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              
              <Link
                to="/profile"
                className="flex items-center space-x-2 border-l pl-4 hover:opacity-80 transition-opacity"
              >
                <User size={20} className="text-gray-600" />
                <div className="text-sm">
                  <div className="font-medium text-gray-900">{user?.name}</div>
                  <div className="text-gray-500 text-xs capitalize">{user?.role === 'homeowner' ? 'Ev Sahibi' : 'Usta'}</div>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                title="Çıkış"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Toast Container */}
    </div>
  );
}

