import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';
import { toast } from 'react-toastify';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'homeowner' as 'homeowner' | 'professional',
    phone: '',
    address: '',
    specialties: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Şifreler eşleşmiyor');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, specialties, ...registerData } = formData;
      const updateData: any = { ...registerData };
      
      if (formData.role === 'professional' && specialties) {
        updateData.specialties = specialties.split(',').map(s => s.trim());
      }
      
      const res = await api.post('/auth/register', updateData);
      login(res.data.token, res.data.user);
      
      // Redirect based on role
      if (res.data.user.role === 'homeowner') {
        navigate('/homeowner');
      } else {
        navigate('/professional');
      }
      
      toast.success('Kayıt başarılı!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Kayıt başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 py-8">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Kayıt Ol</h1>
            <p className="text-gray-600">HomePal'e katılın</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'homeowner' })}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                  formData.role === 'homeowner'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Ev Sahibi
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'professional' })}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                  formData.role === 'professional'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Usta
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-posta
              </label>
              <input
                type="email"
                required
                className="input-field"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefon
              </label>
              <input
                type="tel"
                className="input-field"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            {formData.role === 'professional' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Uzmanlık Alanları
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Örn: Tesisat, Elektrik, Boya"
                  value={formData.specialties}
                  onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">Birden fazla alan için virgülle ayırın</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Şifre
              </label>
              <input
                type="password"
                required
                className="input-field"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Şifre Tekrar
              </label>
              <input
                type="password"
                required
                className="input-field"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-lg mt-4"
            >
              {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Zaten hesabınız var mı?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Giriş yapın
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

