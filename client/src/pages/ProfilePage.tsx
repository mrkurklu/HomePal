import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { ArrowLeft, Save, User, Mail, Phone, MapPin, Award, DollarSign } from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    specialties: user?.role === 'professional' ? (user as any).specialties?.join(', ') : '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardName: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        specialties: (user as any).specialties ? (user as any).specialties.join(', ') : '',
        cardNumber: (user as any).cardLast4 ? `****${(user as any).cardLast4}` : '',
        cardExpiry: '',
        cardCvv: '',
        cardName: (user as any).cardHolderName || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updateData: any = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address
      };

      if (user?.role === 'professional' && formData.specialties) {
        updateData.specialties = formData.specialties.split(',').map((s: string) => s.trim()).filter(Boolean);
      }

      // Update card info if provided
      if (formData.cardNumber && formData.cardNumber.replace(/\*/g, '').length === 0) {
        // New card entered (not masked)
        const cardNumber = formData.cardNumber.replace(/\s/g, '');
        if (cardNumber.length >= 13) {
          updateData.cardLast4 = cardNumber.slice(-4);
          updateData.cardBrand = cardNumber.startsWith('4') ? 'visa' : 'mastercard';
        }
      }
      if (formData.cardName) {
        updateData.cardHolderName = formData.cardName;
      }

      console.log('Updating user:', user?._id || user?.id);
      console.log('Update data:', updateData);

      const res = await api.put(`/users/${user?._id || user?.id}`, updateData);
      
      console.log('Update response:', res.data);
      
      // Update local state with new user data
      const updatedUser = { ...user, ...res.data };
      const token = localStorage.getItem('token');
      login(token!, updatedUser as any);
      
      toast.success('Profil güncellendi!');
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'Profil güncellenemedi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout userRole={user?.role as 'homeowner' | 'professional'}>
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(user?.role === 'homeowner' ? '/homeowner' : '/professional')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} />
          Geri
        </button>

        <div className="card mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profil Bilgilerim</h1>
          <p className="text-gray-600">Hesap bilgilerinizi buradan güncelleyebilirsiniz</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b">
              <div className="h-20 w-20 rounded-full bg-primary-600 flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
                <p className="text-gray-600 capitalize">{user?.role === 'homeowner' ? 'Ev Sahibi' : 'Profesyonel Usta'}</p>
                {user?.role === 'professional' && (
                  <div className="flex items-center gap-4 mt-2">
                    {(user as any).rating && (
                      <div className="flex items-center gap-1 text-yellow-600">
                        <Award size={16} />
                        <span className="text-sm font-medium">{(user as any).rating} / 5.0</span>
                      </div>
                    )}
                    {(user as any).completedJobs && (
                      <span className="text-sm text-gray-600">
                        {(user as any).completedJobs} tamamlanan iş
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <User size={16} />
                Ad Soyad
              </label>
              <input
                type="text"
                required
                className="input-field"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Mail size={16} />
                E-posta
              </label>
              <input
                type="email"
                disabled
                className="input-field bg-gray-100 cursor-not-allowed"
                value={formData.email}
              />
              <p className="text-xs text-gray-500 mt-1">E-posta değiştirilemez</p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Phone size={16} />
                Telefon
              </label>
              <input
                type="tel"
                className="input-field"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            {user?.role === 'homeowner' && (
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <MapPin size={16} />
                  Adres
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            )}

            {/* Card Payment Info */}
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Kart Bilgileri (Ödeme)</h3>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <DollarSign size={16} />
                    Kart Numarası
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="1234 5678 9012 3456"
                    value={formData.cardNumber}
                    onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                    maxLength={19}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Son Kullanma</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="MM/YY"
                      value={formData.cardExpiry}
                      onChange={(e) => setFormData({ ...formData, cardExpiry: e.target.value })}
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="123"
                      value={formData.cardCvv}
                      onChange={(e) => setFormData({ ...formData, cardCvv: e.target.value })}
                      maxLength={3}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kart Sahibi</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Ad Soyad"
                    value={formData.cardName}
                    onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">🔒 Bilgileriniz güvenli şekilde saklanır</p>
            </div>

            {user?.role === 'professional' && (
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Award size={16} />
                  Uzmanlık Alanları
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Tesisat', 'Elektrik', 'Isıtma/Soğutma', 'Beyaz Eşya', 'Boya', 'Mobilya', 'Zemin', 'Çatı', 'Genel', 'Diğer'].map((spec) => {
                    const selected = formData.specialties?.split(',').map(s => s.trim()).includes(spec);
                    return (
                      <label key={spec} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={(e) => {
                            const current = formData.specialties?.split(',').map(s => s.trim()).filter(Boolean) || [];
                            if (e.target.checked) {
                              setFormData({ ...formData, specialties: [...current, spec].join(', ') });
                            } else {
                              setFormData({ ...formData, specialties: current.filter(s => s !== spec).join(', ') });
                            }
                          }}
                          className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{spec}</span>
                      </label>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-2">Uzmanlık alanlarınızı seçin</p>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(user?.role === 'homeowner' ? '/homeowner' : '/professional')}
                className="flex-1 btn-secondary"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                <Save size={18} />
                {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
              </button>
            </div>
          </form>
        </div>

        {/* İstatistikler */}
        {user?.role === 'homeowner' && (
          <div className="card mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hesap İstatistikleri</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-primary-50 rounded-lg">
                <p className="text-2xl font-bold text-primary-600">-</p>
                <p className="text-sm text-gray-600">Toplam İş Emri</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">-</p>
                <p className="text-sm text-gray-600">Tamamlanan</p>
              </div>
            </div>
          </div>
        )}

        {user?.role === 'professional' && (
          <div className="card mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">İş İstatistikleri</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">0</p>
                <p className="text-sm text-gray-600">Bekleyen</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">0</p>
                <p className="text-sm text-gray-600">Aktif</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {(user as any).completedJobs || 0}
                </p>
                <p className="text-sm text-gray-600">Tamamlanan</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

