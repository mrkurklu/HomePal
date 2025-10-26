import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../utils/api';
import { Job } from '../types';
import { format } from 'date-fns';
import { Clock, CheckCircle, XCircle, AlertCircle, Plus } from 'lucide-react';
import { toast } from 'react-toastify';

export default function HomeownerDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchive, setShowArchive] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs');
      setJobs(res.data);
    } catch (error) {
      toast.error('İş emirleri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  // Filter jobs: Separate pending payment from fully completed
  const [awaitingPaymentJobs, setAwaitingPaymentJobs] = useState<Job[]>([]);
  
  useEffect(() => {
    const checkAwaitingPayments = async () => {
      try {
        const res = await api.get('/payments');
        const payments = res.data;
        const paidJobIds = payments
          .filter((p: any) => p.status === 'completed')
          .map((p: any) => typeof p.job === 'string' ? p.job : p.job._id);
        
        const awaiting = jobs.filter(job => 
          job.status === 'completed' && !paidJobIds.includes(job._id)
        );
        setAwaitingPaymentJobs(awaiting);
      } catch (error) {
        console.error('Check payments error:', error);
      }
    };
    
    if (jobs.length > 0) {
      checkAwaitingPayments();
    }
  }, [jobs]);
  
  const activeJobs = jobs.filter(job => job.status !== 'completed');
  const archivedJobs = jobs.filter(job => job.status === 'completed');
  const displayedJobs = showArchive ? archivedJobs : [...activeJobs, ...awaitingPaymentJobs];

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', text: 'Beklemede' },
      accepted: { icon: Clock, color: 'bg-blue-100 text-blue-800', text: 'Kabul Edildi' },
      'in-progress': { icon: Clock, color: 'bg-purple-100 text-purple-800', text: 'Devam Ediyor' },
      completed: { icon: CheckCircle, color: 'bg-green-100 text-green-800', text: 'Tamamlandı' },
      cancelled: { icon: XCircle, color: 'bg-red-100 text-red-800', text: 'İptal Edildi' }
    };

    const statusInfo = badges[status as keyof typeof badges] || badges.pending;
    const Icon = statusInfo.icon;

    return (
      <span className={`badge ${statusInfo.color} flex items-center gap-1`}>
        <Icon size={14} />
        {statusInfo.text}
      </span>
    );
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'text-gray-600',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      urgent: 'text-red-600'
    };
    return colors[priority as keyof typeof colors] || 'text-gray-600';
  };

  const categories = {
    plumbing: 'Tesisat',
    electrical: 'Elektrik',
    hvac: 'Isıtma/Soğutma',
    appliances: 'Beyaz Eşya',
    paint: 'Boya',
    furniture: 'Mobilya',
    flooring: 'Zemin',
    roofing: 'Çatı',
    general: 'Genel',
    other: 'Diğer'
  };

  if (loading) {
    return (
      <Layout userRole="homeowner">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout userRole="homeowner">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">İş Emirlerim</h1>
          <p className="text-gray-600 mt-2">Tüm tamiratlarınızın kaydı</p>
        </div>
        <Link to="/jobs/create" className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Yeni İş Emri
        </Link>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setShowArchive(false)}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            !showArchive ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Aktif İşler ({activeJobs.length})
        </button>
        <button
          onClick={() => setShowArchive(true)}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            showArchive ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Arşiv ({archivedJobs.length})
        </button>
      </div>

      {displayedJobs.length === 0 ? (
        <div className="card text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {showArchive ? 'Henüz arşiv işiniz yok' : 'Henüz iş emriniz yok'}
          </h3>
          <p className="text-gray-600 mb-6">
            {showArchive ? 'Tamamlanmış işleriniz burada görünecek' : 'Evde bir şey mi bozuldu? Hemen yeni iş emri oluşturun!'}
          </p>
          {!showArchive && (
            <Link to="/jobs/create" className="btn-primary inline-flex items-center gap-2">
              <Plus size={20} />
              İş Emri Oluştur
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayedJobs.map((job) => (
            <Link
              key={job._id}
              to={`/jobs/${job._id}`}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                {getStatusBadge(job.status)}
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{job.description}</p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <span className="font-medium mr-2">Kategori:</span>
                  {categories[job.category as keyof typeof categories] || job.category}
                </div>
                <div className="flex items-center">
                  <span className="font-medium mr-2">Öncelik:</span>
                  <span className={getPriorityColor(job.priority)}>
                    {job.priority === 'low' ? 'Düşük' : job.priority === 'medium' ? 'Orta' : job.priority === 'high' ? 'Yüksek' : 'Acil'}
                  </span>
                </div>
                {job.professional && typeof job.professional === 'object' && (
                  <div className="flex items-center text-gray-600">
                    <span className="font-medium mr-2">Usta:</span>
                    {job.professional.name}
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  {format(new Date(job.createdAt), 'dd MMM yyyy, HH:mm')}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  );
}

