import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { ArrowLeft } from 'lucide-react';

export default function CreateJobPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    location: '',
    scheduledDate: ''
  });
  const [loading, setLoading] = useState(false);

  const categories = [
    { value: 'plumbing', label: 'Tesisat' },
    { value: 'electrical', label: 'Elektrik' },
    { value: 'hvac', label: 'Isıtma/Soğutma' },
    { value: 'appliances', label: 'Beyaz Eşya' },
    { value: 'paint', label: 'Boya' },
    { value: 'furniture', label: 'Mobilya' },
    { value: 'flooring', label: 'Zemin' },
    { value: 'roofing', label: 'Çatı' },
    { value: 'general', label: 'Genel' },
    { value: 'other', label: 'Diğer' }
  ];

  const priorities = [
    { value: 'low', label: 'Düşük' },
    { value: 'medium', label: 'Orta' },
    { value: 'high', label: 'Yüksek' },
    { value: 'urgent', label: 'Acil' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate).toISOString() : undefined
      };
      
      await api.post('/jobs', submitData);
      toast.success('İş emri oluşturuldu!');
      navigate('/homeowner');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'İş emri oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout userRole="homeowner">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/homeowner')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} />
          Geri
        </button>

        <div className="card">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Yeni İş Emri Oluştur</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Başlık *
              </label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="Örn: Lavabo tıkandı"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama *
              </label>
              <textarea
                required
                rows={4}
                className="input-field"
                placeholder="Sorunu detaylı bir şekilde açıklayın..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori *
                </label>
                <select
                  required
                  className="input-field"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Öncelik *
                </label>
                <select
                  required
                  className="input-field"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                >
                  {priorities.map((priority) => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Konum/Adres
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Adres bilgisi"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Randevu Tarihi
              </label>
              <input
                type="datetime-local"
                className="input-field"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/homeowner')}
                className="flex-1 btn-secondary"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary"
              >
                {loading ? 'Oluşturuluyor...' : 'İş Emri Oluştur'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

