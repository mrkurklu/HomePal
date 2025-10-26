import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';
import { Quote } from '../types';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { ArrowLeft, DollarSign, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function QuotesPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const res = await api.get('/quotes');
      setQuotes(res.data);
    } catch (error) {
      toast.error('Teklifler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptQuote = async (quoteId: string) => {
    try {
      await api.put(`/quotes/${quoteId}/accept`);
      toast.success('Teklif kabul edildi!');
      fetchQuotes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Hata oluştu');
    }
  };

  const handleRejectQuote = async (quoteId: string) => {
    try {
      await api.put(`/quotes/${quoteId}/reject`);
      toast.info('Teklif reddedildi');
      fetchQuotes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Hata oluştu');
    }
  };

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
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate(user?.role === 'homeowner' ? '/homeowner' : '/professional')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} />
          Geri
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {user?.role === 'homeowner' ? 'Gelen Teklifler' : 'Verdiğim Teklifler'}
          </h1>
          <p className="text-gray-600">Tekliflerinizi yönetin</p>
        </div>

        {quotes.length === 0 ? (
          <div className="card text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz teklif yok</h3>
            <p className="text-gray-600">
              {user?.role === 'homeowner' 
                ? 'Size gelen teklifler burada görünecek' 
                : 'Verdiğiniz teklifler burada görünecek'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {quotes.map((quote) => (
              <div key={quote._id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    {typeof quote.job === 'object' && (
                      <>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {quote.job.title}
                        </h3>
                        <p className="text-gray-600 mb-4">{quote.job.description}</p>
                      </>
                    )}
                    
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <DollarSign size={18} className="text-green-600" />
                        <span className="text-2xl font-bold text-gray-900">{quote.price} TL</span>
                      </div>
                      <span className={`badge ${
                        quote.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        quote.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {quote.status === 'pending' ? 'Beklemede' :
                         quote.status === 'accepted' ? 'Kabul Edildi' :
                         'Reddedildi'}
                      </span>
                    </div>

                    {quote.message && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Not:</h4>
                        <p className="text-gray-600">{quote.message}</p>
                      </div>
                    )}

                    <div className="text-sm text-gray-500">
                      {format(new Date(quote.createdAt), 'dd MMM yyyy, HH:mm')}
                    </div>
                  </div>
                </div>

                {user?.role === 'homeowner' && quote.status === 'pending' && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleAcceptQuote(quote._id)}
                      className="btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} />
                      Teklifi Kabul Et
                    </button>
                    <button
                      onClick={() => handleRejectQuote(quote._id)}
                      className="btn-secondary flex-1 flex items-center justify-center gap-2"
                    >
                      <XCircle size={18} />
                      Reddet
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

