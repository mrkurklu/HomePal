import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { Reminder, ReminderCategory } from '../types';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';

const CATEGORY_OPTIONS: { value: ReminderCategory; label: string }[] = [
  { value: 'cati', label: 'Çatı' },
  { value: 'tesisat', label: 'Tesisat' },
  { value: 'elektrik', label: 'Elektrik' },
  { value: 'bahce', label: 'Bahçe' },
  { value: 'boya', label: 'Boya' },
  { value: 'klima', label: 'Klima' }
];

export default function RemindersPage() {
  const { user } = useAuthStore();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [category, setCategory] = useState<ReminderCategory>('cati');
  const [name, setName] = useState('');
  const [frequencyDays, setFrequencyDays] = useState<number>(365);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const isHomeowner = user?.role === 'homeowner';

  const loadReminders = async () => {
    try {
      const res = await api.get('/reminders');
      setReminders(res.data);
    } catch (e) {
      // ignore if unauthorized (e.g., professional)
    }
  };

  useEffect(() => {
    loadReminders();
  }, []);

  // Fetch AI-like suggestion when category changes
  useEffect(() => {
    const fetchSuggestion = async () => {
      try {
        const res = await api.get(`/reminders/suggestions/${category}`);
        setName(res.data.name);
        setFrequencyDays(res.data.frequencyDays);
      } catch (e) {
        // fallback defaults if suggestion missing
        setName('Rutin bakım');
        setFrequencyDays(180);
      }
    };
    fetchSuggestion();
  }, [category]);

  const upcoming = useMemo(() => {
    return reminders.slice().sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
  }, [reminders]);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isHomeowner) return;
    setLoading(true);
    try {
      const payload = { name, category, frequencyDays, notes };
      const res = await api.post('/reminders', payload);
      setReminders((prev) => [res.data, ...prev]);
      toast.success('Hatırlatıcı oluşturuldu');
      setNotes('');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Oluşturma hatası');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout userRole={isHomeowner ? 'homeowner' : 'professional'}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Rutin Bakım Hatırlatıcısı</h2>

          {!isHomeowner && (
            <p className="text-sm text-gray-500">Hatırlatıcıları yalnızca ev sahipleri oluşturabilir.</p>
          )}

          {isHomeowner && (
            <form onSubmit={onCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ReminderCategory)}
                  className="w-full border rounded-md px-3 py-2"
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Kategori seçildiğinde isim ve önerilen sıklık otomatik dolar. Düzenleyebilirsiniz.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hatırlatıcı İsmi</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Örn: Çatı bakımı"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sıklık (gün)</label>
                <input
                  type="number"
                  min={1}
                  value={frequencyDays}
                  onChange={(e) => setFrequencyDays(Number(e.target.value))}
                  className="w-full border rounded-md px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Not (opsiyonel)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                  rows={3}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md px-4 py-2 disabled:opacity-60"
              >
                {loading ? 'Oluşturuluyor...' : 'Hatırlatıcı Oluştur'}
              </button>
            </form>
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h3 className="text-md font-semibold text-gray-900 mb-4">Yaklaşan Hatırlatmalar</h3>
          {upcoming.length === 0 ? (
            <p className="text-gray-500 text-sm">Henüz hatırlatıcı yok.</p>
          ) : (
            <ul className="divide-y">
              {upcoming.map((r) => (
                <li key={r._id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{r.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{r.category} • {Math.round(r.frequencyDays/30)} ayda bir</div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Sonraki tarih: {new Date(r.nextDueDate).toLocaleDateString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  );
}


