import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { ArrowLeft, Bell, CheckCircle, XCircle, FileText, Briefcase } from 'lucide-react';

interface Notification {
  _id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  relatedJob?: any;
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (error) {
      toast.error('Bildirimler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Mark read error:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('Tüm bildirimler okundu olarak işaretlendi');
    } catch (error) {
      console.error('Mark all read error:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'quote-received':
        return <FileText size={20} className="text-blue-600" />;
      case 'quote-accepted':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'quote-rejected':
        return <XCircle size={20} className="text-red-600" />;
      case 'job-assigned':
        return <Briefcase size={20} className="text-purple-600" />;
      case 'job-completed':
        return <CheckCircle size={20} className="text-green-600" />;
      default:
        return <Bell size={20} className="text-gray-600" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <Layout userRole={user?.role as 'homeowner' | 'professional'}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout userRole={user?.role as 'homeowner' | 'professional'}>
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(user?.role === 'homeowner' ? '/homeowner' : '/professional')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} />
          Geri
        </button>

        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Bildirimler</h1>
            <p className="text-gray-600">{unreadCount} okunmamış bildirim</p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="btn-secondary text-sm"
            >
              Tümünü Okundu İşaretle
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="card text-center py-12">
            <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz bildirim yok</h3>
            <p className="text-gray-600">Yeni bildirimleriniz burada görünecek</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`card cursor-pointer hover:shadow-lg transition-shadow ${
                  !notification.read ? 'bg-blue-50 border-l-4 border-primary-600' : ''
                }`}
                onClick={() => {
                  if (!notification.read) {
                    handleMarkRead(notification._id);
                  }
                  if (notification.relatedJob) {
                    navigate(`/jobs/${notification.relatedJob._id}`);
                  }
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(notification.createdAt), 'dd MMM yyyy, HH:mm')}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

