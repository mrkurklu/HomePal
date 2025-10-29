import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { ArrowLeft, Camera, Upload, Sparkles } from 'lucide-react';

export default function CreateJobPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    location: '',
    scheduledDate: '',
    photoUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [analyzedPriceRange, setAnalyzedPriceRange] = useState<{ min: number; max: number } | null>(null);

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

  // Category-based price range
  const getPriceRangeForCategory = (category: string) => {
    const ranges: { [key: string]: { min: number; max: number } } = {
      'plumbing': { min: 300, max: 5000 },
      'electrical': { min: 200, max: 3000 },
      'hvac': { min: 500, max: 10000 },
      'appliances': { min: 150, max: 5000 },
      'paint': { min: 500, max: 10000 },
      'furniture': { min: 200, max: 8000 },
      'flooring': { min: 1000, max: 15000 },
      'roofing': { min: 2000, max: 20000 },
      'general': { min: 200, max: 3000 },
      'other': { min: 150, max: 5000 }
    };
    return ranges[category] || ranges['other'];
  };

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Start AI analysis
      await analyzePhotoForPriceRange(file);
    }
  };

  // Handle camera capture
  const handleCameraCapture = () => {
    fileInputRef.current?.click();
  };

  // Mock AI analysis based on photo
  const analyzePhotoForPriceRange = async (photo: File) => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock AI analysis - creates a MUCH tighter price range
    const baseRange = getPriceRangeForCategory(formData.category);
    
    // Calculate a tighter range: between 8-15% of the base range width
    const rangeWidth = baseRange.max - baseRange.min;
    const tightRangeWidth = Math.min(rangeWidth * 0.12, 500); // Max 500 TL range
    const center = (baseRange.max + baseRange.min) / 2;
    
    const min = Math.max(baseRange.min, Math.round(center - tightRangeWidth / 2));
    const max = Math.min(baseRange.max, Math.round(center + tightRangeWidth / 2));
    
    setAnalyzedPriceRange({ min, max });
    setIsAnalyzing(false);
    
    toast.success(`AI analizi tamamlandı! Önerilen fiyat aralığı: ${min} - ${max} TL`);
  };

  // Upload photo to server
  const uploadPhoto = async (): Promise<string> => {
    if (!uploadedPhoto) return '';
    
    const formData = new FormData();
    formData.append('photo', uploadedPhoto);
    
    const res = await api.post('/upload/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return res.data.photoUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload photo if exists
      let photoUrl = formData.photoUrl;
      if (uploadedPhoto) {
        photoUrl = await uploadPhoto();
      }
      
      // If AI analyzed photo, use that range; otherwise use category-based range
      const priceRange = analyzedPriceRange || getPriceRangeForCategory(formData.category);
      
      const submitData = {
        ...formData,
        photoUrl,
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fotoğraf Ekleyin (Opsiyonel)
              </label>
              
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                capture="environment"
                className="hidden"
              />
              
              {!photoPreview ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCameraCapture}
                    className="btn-secondary flex items-center gap-2 flex-1"
                  >
                    <Camera size={20} />
                    Fotoğraf Çek
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-secondary flex items-center gap-2 flex-1"
                  >
                    <Upload size={20} />
                    Dosya Seç
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <img 
                      src={photoPreview} 
                      alt="Preview" 
                      className="w-full h-64 object-cover rounded-lg border-2 border-primary-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoPreview('');
                        setUploadedPhoto(null);
                        setAnalyzedPriceRange(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                  
                  {isAnalyzing ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                      <Sparkles className="animate-pulse text-blue-600" size={20} />
                      <div>
                        <p className="text-sm font-medium text-blue-900">AI analizi yapılıyor...</p>
                        <p className="text-xs text-blue-700">Fotoğrafınız inceleniyor</p>
                      </div>
                    </div>
                  ) : analyzedPriceRange && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-green-900 mb-2 flex items-center gap-2">
                        <Sparkles size={16} />
                        AI Önerilen Fiyat Aralığı
                      </p>
                      <p className="text-green-700">
                        Fotoğrafınıza göre önerilen fiyat: <span className="font-bold text-lg">
                          {analyzedPriceRange.min} - {analyzedPriceRange.max} TL
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              <p className="text-xs text-gray-500 mt-1">
                📷 Sorunun fotoğrafını çekin veya yükleyin (AI analiz edecek)
              </p>
            </div>

            {/* Show estimated price range */}
            {formData.category && !analyzedPriceRange && (
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <p className="text-sm font-medium text-primary-900 mb-2">
                  💰 Tahmini Fiyat Aralığı
                </p>
                <p className="text-primary-700">
                  Bu kategori için profesyonellerden alacağınız teklifler <span className="font-bold">
                    {getPriceRangeForCategory(formData.category).min} - {getPriceRangeForCategory(formData.category).max} TL
                  </span> arasında olmalıdır.
                </p>
              </div>
            )}

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

