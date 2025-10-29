import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Job } from '../types';
import { format } from 'date-fns';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import { ArrowLeft, MapPin, Clock, User, CheckCircle, DollarSign, Phone, FileText } from 'lucide-react';
import { Quote } from '../types';

export default function JobDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [job, setJob] = useState<Job | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [price, setPrice] = useState('');
  const [quotePrice, setQuotePrice] = useState('');
  const [quoteMessage, setQuoteMessage] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [hasPayment, setHasPayment] = useState(false);
  const [cardInfo, setCardInfo] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  // Auto-show payment form if coming from notification
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const openPayment = urlParams.get('payment');
    if (openPayment === 'true' && job && job.price && job.status === 'completed' && !hasPayment) {
      setShowPaymentForm(true);
    }
  }, [job, hasPayment]);

  // Check if payment exists for this job
  useEffect(() => {
    const checkPayment = async () => {
      if (job && job.price) {
        try {
          const res = await api.get('/payments');
          const payments = res.data;
          const jobPayment = payments.find((p: any) => {
            const jobId = typeof p.job === 'string' ? p.job : p.job._id;
            return jobId === job._id && p.status === 'completed';
          });
          setHasPayment(!!jobPayment);
        } catch (error) {
          console.error('Check payment error:', error);
        }
      }
    };
    checkPayment();
  }, [job]);

  useEffect(() => {
    fetchJob();
    fetchQuotes();
  }, [id]);

  const fetchJob = async () => {
    try {
      const res = await api.get(`/jobs/${id}`);
      setJob(res.data);
    } catch (error) {
      toast.error('İş emri yüklenemedi');
      navigate('/homeowner');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuotes = async () => {
    try {
      const res = await api.get('/quotes');
      const jobId = typeof id === 'string' ? id : id;
      const jobQuotes = res.data.filter((q: Quote) => {
        const qJobId = typeof q.job === 'string' ? q.job : q.job._id;
        return qJobId === jobId;
      });
      setQuotes(jobQuotes);
    } catch (error) {
      console.error('Fetch quotes error:', error);
    }
  };

  const handleAcceptQuote = async (quoteId: string) => {
    try {
      await api.put(`/quotes/${quoteId}/accept`);
      toast.success('Teklif kabul edildi!');
      fetchJob();
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

  const handleAccept = async () => {
    try {
      await api.put(`/jobs/${id}/accept`);
      toast.success('İş emri kabul edildi!');
      fetchJob();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Hata oluştu');
    }
  };

  const handleComplete = async () => {
    try {
      await api.put(`/jobs/${id}/complete`, {});
      toast.success('İş tamamlandı! Ev sahibi ödeme yapacak.');
      fetchJob();
      setShowCompleteForm(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Hata oluştu');
    }
  };

  const handlePayment = async () => {
    // Use saved card if available, otherwise use entered card
    const cardLast4 = user && (user as any).cardLast4 ? (user as any).cardLast4 : cardInfo.number.slice(-4);
    const cardBrand = user && (user as any).cardBrand ? (user as any).cardBrand : 'visa';
    
    // If no saved card, validate entered card
    if (!user || !(user as any).cardLast4) {
      if (!cardInfo.number || !cardInfo.expiry || !cardInfo.cvv || !cardInfo.name) {
        toast.error('Lütfen tüm kart bilgilerini girin veya profil sayfasından kart kaydedin');
        return;
      }
    }

    try {
      await api.post('/payments', {
        jobId: id,
        cardInfo: {
          last4: cardLast4,
          brand: cardBrand
        }
      });
      toast.success('Ödeme başarılı!');
      setShowPaymentForm(false);
      setHasPayment(true);
      fetchJob();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ödeme başarısız');
    }
  };

  const handleSubmitQuote = async () => {
    if (!quotePrice) {
      toast.error('Lütfen fiyat girin');
      return;
    }
    
    try {
      await api.post('/quotes', {
        jobId: id,
        price: parseFloat(quotePrice),
        message: quoteMessage
      });
      toast.success('Teklifiniz gönderildi!');
      setShowQuoteForm(false);
      setQuotePrice('');
      setQuoteMessage('');
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

  if (!job) {
    return (
      <Layout userRole={user?.role as 'homeowner' | 'professional'}>
        <div className="card text-center">
          <p className="text-gray-600">İş emri bulunamadı</p>
        </div>
      </Layout>
    );
  }

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

  const priorities = {
    low: { label: 'Düşük', color: 'text-gray-600' },
    medium: { label: 'Orta', color: 'text-yellow-600' },
    high: { label: 'Yüksek', color: 'text-orange-600' },
    urgent: { label: 'Acil', color: 'text-red-600' }
  };

  const isHomeowner = user?.role === 'homeowner';
  const isProfessional = user?.role === 'professional';
  const isOwner = isHomeowner;

  return (
    <Layout userRole={user?.role as 'homeowner' | 'professional'}>
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(isHomeowner ? '/homeowner' : '/professional')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} />
          Geri
        </button>

        {/* Photo */}
        {job.photoUrl && (
          <div className="card mb-6">
            <img 
              src={job.photoUrl} 
              alt={job.title}
              className="w-full h-80 object-cover rounded-lg"
            />
          </div>
        )}
        
        <div className="card mb-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
              <p className="text-gray-600">{job.description}</p>
            </div>
            <span className={`badge ${
              job.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              job.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
              job.status === 'in-progress' ? 'bg-purple-100 text-purple-800' :
              job.status === 'completed' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {job.status === 'pending' ? 'Beklemede' :
               job.status === 'accepted' ? 'Kabul Edildi' :
               job.status === 'in-progress' ? 'Devam Ediyor' :
               job.status === 'completed' ? 'Tamamlandı' :
               'İptal Edildi'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="font-medium text-gray-700 min-w-[100px]">Kategori:</span>
                <span className="text-gray-900">{categories[job.category as keyof typeof categories] || job.category}</span>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="font-medium text-gray-700 min-w-[100px]">Öncelik:</span>
                <span className={priorities[job.priority as keyof typeof priorities].color}>
                  {priorities[job.priority as keyof typeof priorities].label}
                </span>
              </div>

              {job.location && (
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-gray-500 mt-0.5" />
                  <span className="text-gray-900">{job.location}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Clock size={18} className="text-gray-500 mt-0.5" />
                <div>
                  <span className="font-medium text-gray-700 block">Oluşturulma:</span>
                  <span className="text-gray-900">{format(new Date(job.createdAt), 'dd MMM yyyy, HH:mm')}</span>
                </div>
              </div>

              {job.scheduledDate && (
                <div className="flex items-start gap-3">
                  <Clock size={18} className="text-gray-500 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-700 block">Randevu:</span>
                    <span className="text-gray-900">{format(new Date(job.scheduledDate), 'dd MMM yyyy, HH:mm')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {typeof job.homeowner === 'object' && isProfessional && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User size={20} />
                Müşteri Bilgileri
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">Ad Soyad:</span>
                  <p className="text-gray-900">{job.homeowner.name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">E-posta:</span>
                  <p className="text-gray-900">{job.homeowner.email}</p>
                </div>
                {job.homeowner.phone && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Telefon:</span>
                    <p className="text-gray-900 flex items-center gap-2">
                      <Phone size={16} />
                      {job.homeowner.phone}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {typeof job.professional === 'object' && isHomeowner && job.professional && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User size={20} />
                Usta Bilgileri
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">Ad Soyad:</span>
                  <p className="text-gray-900">{job.professional.name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">E-posta:</span>
                  <p className="text-gray-900">{job.professional.email}</p>
                </div>
                {job.professional.phone && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Telefon:</span>
                    <p className="text-gray-900 flex items-center gap-2">
                      <Phone size={16} />
                      {job.professional.phone}
                    </p>
                  </div>
                )}
                {job.professional.rating && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Değerlendirme:</span>
                    <p className="text-gray-900">{job.professional.rating} / 5.0</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Price */}
        {job.price && (
          <div className="card mt-6">
            <div className="flex items-center gap-3">
              <DollarSign size={24} className="text-green-600" />
              <div>
                <span className="text-sm font-medium text-gray-700">Toplam Ücret:</span>
                <p className="text-2xl font-bold text-gray-900">{job.price} TL</p>
              </div>
            </div>
          </div>
        )}

        {/* Quotes List for Homeowner */}
        {isHomeowner && job.status === 'pending' && quotes.length > 0 && (
          <div className="card mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Gelen Teklifler</h3>
            <div className="space-y-4">
              {quotes.map((quote) => (
                <div key={quote._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <DollarSign size={20} className="text-green-600" />
                      <span className="text-xl font-bold text-gray-900">{quote.price} TL</span>
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
                  </div>
                  {quote.message && (
                    <p className="text-gray-600 mb-3">{quote.message}</p>
                  )}
                  {typeof quote.professional === 'object' && (
                    <p className="text-sm text-gray-600 mb-3">
                      <span className="font-medium">Usta:</span> {quote.professional.name}
                    </p>
                  )}
                  {quote.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleAcceptQuote(quote._id)}
                        className="btn-primary flex-1 flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={16} />
                        Teklifi Kabul Et
                      </button>
                      <button
                        onClick={() => handleRejectQuote(quote._id)}
                        className="btn-secondary flex-1"
                      >
                        Reddet
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quote Form */}
        {showQuoteForm && (
          <div className="card mb-6">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={20} />
              Teklif Ver
            </h3>
            
            {/* Price Range Info */}
            {job && job.minPrice && job.maxPrice && (
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-yellow-900 mb-2 flex items-center gap-2">
                  <DollarSign size={16} />
                  Kabul Edilebilir Fiyat Aralığı
                </p>
                <p className="text-yellow-800">
                  Bu iş için fiyat <span className="font-bold text-lg">{job.minPrice} - {job.maxPrice} TL</span> arasında olmalıdır.
                </p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fiyat (TL) 
                  {job && job.minPrice && job.maxPrice && (
                    <span className="text-xs text-gray-500 ml-2">
                      ({job.minPrice} - {job.maxPrice} TL arası)
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  placeholder="Fiyat girin"
                  className="input-field"
                  value={quotePrice}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (!value || (parseFloat(value) >= 0)) {
                      setQuotePrice(value);
                    }
                  }}
                  min={job?.minPrice || 0}
                  max={job?.maxPrice || 999999}
                  step="0.01"
                />
                {job && job.minPrice && job.maxPrice && quotePrice && parseFloat(quotePrice) && (
                  parseFloat(quotePrice) < job.minPrice || parseFloat(quotePrice) > job.maxPrice ? (
                    <p className="text-xs text-red-600 mt-1">
                      ⚠️ Fiyat {job.minPrice} - {job.maxPrice} TL arasında olmalıdır!
                    </p>
                  ) : (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Fiyat kabul edilebilir aralıkta
                    </p>
                  )
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Not (Opsiyonel)</label>
                <textarea
                  rows={3}
                  className="input-field"
                  placeholder="İş hakkında açıklama"
                  value={quoteMessage}
                  onChange={(e) => setQuoteMessage(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleSubmitQuote} 
                  className="btn-primary flex-1"
                  disabled={
                    job && job.minPrice && job.maxPrice && quotePrice 
                    ? (parseFloat(quotePrice) < job.minPrice || parseFloat(quotePrice) > job.maxPrice)
                    : false
                  }
                >
                  Teklif Gönder
                </button>
                <button onClick={() => setShowQuoteForm(false)} className="btn-secondary">
                  İptal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Form */}
        {showPaymentForm && job && (
          <div className="card mb-6 bg-green-50 border-2 border-green-200">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign size={20} />
              Ödeme Yap - {job.price} TL
            </h3>
            
            {/* Show saved card if available */}
            {user && (user as any).cardLast4 ? (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-green-300">
                  <p className="text-sm font-medium text-gray-700 mb-1">Kaydedilmiş Kart</p>
                  <p className="text-lg text-gray-900">•••• {user && (user as any).cardLast4}</p>
                  {user && (user as any).cardBrand && (
                    <p className="text-xs text-gray-500 capitalize">{(user as any).cardBrand}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={handlePayment} className="btn-primary flex-1">
                    Kaydedilmiş Kartla Öde
                  </button>
                  <button onClick={() => setShowPaymentForm(false)} className="btn-secondary">
                    İptal
                  </button>
                </div>
                <p className="text-xs text-gray-500">💳 Yeni kart eklemek için Profil sayfasını kullanın</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-300 p-3 rounded">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Kaydedilmiş kartınız yok. Lütfen kart bilgilerini girin veya Profil sayfasından kart ekleyin.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kart Numarası</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="input-field"
                    value={cardInfo.number}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\s/g, ''); // Remove spaces
                      value = value.replace(/(\d{4})(?=\d)/g, '$1 '); // Add space every 4 digits
                      if (value.length <= 19) {
                        setCardInfo({ ...cardInfo, number: value });
                      }
                    }}
                    maxLength={19}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Son Kullanma</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="input-field"
                      value={cardInfo.expiry}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                        if (value.length >= 2) {
                          value = value.substring(0, 2) + '/' + value.substring(2, 4);
                        }
                        setCardInfo({ ...cardInfo, expiry: value });
                      }}
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      className="input-field"
                      value={cardInfo.cvv}
                      onChange={(e) => setCardInfo({ ...cardInfo, cvv: e.target.value })}
                      maxLength={3}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kart Sahibi</label>
                  <input
                    type="text"
                    placeholder="Ad Soyad"
                    className="input-field"
                    value={cardInfo.name}
                    onChange={(e) => setCardInfo({ ...cardInfo, name: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={handlePayment} className="btn-primary flex-1">
                    Ödeme Yap
                  </button>
                  <button onClick={() => setShowPaymentForm(false)} className="btn-secondary">
                    İptal
                  </button>
                </div>
                <p className="text-xs text-gray-500">🔒 Güvenli ödeme (Mock - test modu)</p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex gap-4">
          {/* Quote button for professionals on pending jobs */}
          {isProfessional && job.status === 'pending' && !showQuoteForm && (
            <button onClick={() => setShowQuoteForm(true)} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <FileText size={18} />
              Teklif Ver
            </button>
          )}
          
          {/* Show payment button for homeowner when job is completed and not paid yet */}
          {isHomeowner && job.price && job.status === 'completed' && !hasPayment && (
            <button onClick={() => setShowPaymentForm(true)} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <DollarSign size={18} />
              {job.price} TL Öde
            </button>
          )}
          
          {/* Show paid status */}
          {isHomeowner && job.price && job.status === 'completed' && hasPayment && (
            <div className="flex-1 bg-green-50 border border-green-300 rounded-lg p-4 flex items-center justify-center gap-2">
              <CheckCircle size={20} className="text-green-600" />
              <span className="text-green-800 font-medium">Ödeme Tamamlandı</span>
            </div>
          )}

          {/* Professional can see payment status too */}
          {isProfessional && job.price && job.status === 'completed' && hasPayment && (
            <div className="flex-1 bg-green-50 border border-green-300 rounded-lg p-4 flex items-center justify-center gap-2">
              <CheckCircle size={20} className="text-green-600" />
              <span className="text-green-800 font-medium">Ödeme Alındı</span>
            </div>
          )}

          {isProfessional && (job.status === 'accepted' || job.status === 'in-progress') && job.status !== 'completed' && (
            <button onClick={handleComplete} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <CheckCircle size={18} />
              İşi Tamamlandı Olarak İşaretle
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
}

