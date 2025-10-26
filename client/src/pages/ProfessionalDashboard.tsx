import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../utils/api';
import { Job } from '../types';
import { format } from 'date-fns';
import { Clock, CheckCircle, MapPin, DollarSign } from 'lucide-react';
import { toast } from 'react-toastify';

export default function ProfessionalDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted'>('all');
  const [showArchive, setShowArchive] = useState(false);
  const [awaitingPaymentJobs, setAwaitingPaymentJobs] = useState<Job[]>([]);

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

  // Check which completed jobs have payment
  useEffect(() => {
    const checkPayments = async () => {
      try {
        const res = await api.get('/payments');
        const payments = res.data;
        const paidJobIds = payments
          .filter((p: any) => p.status === 'completed')
          .map((p: any) => typeof p.job === 'string' ? p.job : p.job._id);
        
        setAwaitingPaymentJobs(
          jobs.filter(job => job.status === 'completed' && !paidJobIds.includes(job._id))
        );
      } catch (error) {
        console.error('Check payments error:', error);
      }
    };
    
    if (jobs.length > 0) {
      checkPayments();
    }
  }, [jobs]);
  
  const activeJobs = jobs.filter(job => job.status !== 'completed');
  const archivedJobs = jobs.filter(job => job.status === 'completed');
  
  const filteredJobs = filter === 'all'
    ? [...activeJobs, ...awaitingPaymentJobs]
    : filter === 'pending'
    ? activeJobs.filter(j => j.status === 'pending')
    : activeJobs.filter(j => j.status === 'accepted' || j.status === 'in-progress');
  
  const displayedJobs = showArchive ? archivedJobs : filteredJobs;

  if (loading) {
    return (
      <Layout userRole="professional">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  const pendingCount = activeJobs.filter(j => j.status === 'pending').length;
  const activeCount = activeJobs.filter(j => j.status === 'accepted' || j.status === 'in-progress').length;
  const completedCount = archivedJobs.length;

  return (
    <Layout userRole="professional">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Usta Paneli</h1>
        <p className="text-gray-600">İş emirlerinizi yönetin</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-yellow-400 to-yellow-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm mb-1">Bekleyen İşler</p>
              <p className="text-3xl font-bold">{pendingCount}</p>
            </div>
            <Clock className="h-12 w-12 opacity-50" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-400 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Aktif İşler</p>
              <p className="text-3xl font-bold">{activeCount}</p>
            </div>
            <CheckCircle className="h-12 w-12 opacity-50" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-400 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">Tamamlanan</p>
              <p className="text-3xl font-bold">{completedCount}</p>
            </div>
            <CheckCircle className="h-12 w-12 opacity-50" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-4">
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

      {/* Filters - Only show when not in archive view */}
      {!showArchive && (
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Tümü
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'pending' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Bekleyenler
          </button>
          <button
            onClick={() => setFilter('accepted')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'accepted' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Aktif İşlerim
          </button>
        </div>
      )}

      {/* Jobs */}
      <div className="grid gap-6">
        {displayedJobs.length === 0 ? (
          <div className="card text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {showArchive ? 'Henüz arşiv işiniz yok' : 'İş emri bulunamadı'}
            </h3>
            <p className="text-gray-600">
              {showArchive ? 'Tamamlanmış işleriniz burada görünecek' : 'Henüz iş emri bulunmuyor'}
            </p>
          </div>
        ) : (
          displayedJobs.map((job) => (
            <div key={job._id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <Link to={`/jobs/${job._id}`} className="text-xl font-semibold text-gray-900 hover:text-primary-600 mb-2 block">
                    {job.title}
                  </Link>
                  <p className="text-gray-600 mb-3">{job.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {job.location && (
                      <div className="flex items-center gap-1">
                        <MapPin size={16} />
                        {job.location}
                      </div>
                    )}
                    {job.price && (
                      <div className="flex items-center gap-1">
                        <DollarSign size={16} />
                        {job.price} TL
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      {format(new Date(job.createdAt), 'dd MMM yyyy')}
                    </div>
                  </div>
                </div>
                <span className={`badge ${
                  job.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  job.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                  job.status === 'in-progress' ? 'bg-purple-100 text-purple-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {job.status === 'pending' ? 'Beklemede' :
                   job.status === 'accepted' ? 'Kabul Edildi' :
                   job.status === 'in-progress' ? 'Devam Ediyor' :
                   'Tamamlandı'}
                </span>
              </div>

              {typeof job.homeowner === 'object' && (
                <div className="border-t pt-4 mt-4">
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Müşteri:</span> {job.homeowner.name}
                  </p>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <Link to={`/jobs/${job._id}`} className="btn-primary flex-1 text-center">
                  Detaya Git
                </Link>
                {job.status === 'pending' && !showArchive && (
                  <Link 
                    to={`/jobs/${job._id}`} 
                    className="btn-secondary flex-1 text-center"
                    onClick={() => {
                      // Teklif verme butonu job details'de görünecek
                    }}
                  >
                    Teklif Ver
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
}

