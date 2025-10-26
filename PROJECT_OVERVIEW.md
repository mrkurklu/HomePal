# HomePal - Proje Genel Bakış

## 📋 Proje Özeti

HomePal, ev sahipleri ve profesyonel ustalar arasındaki iletişimi ve iş yönetimini kökten çözen akıllı bir ev bakım ve yönetim platformudur.

## 🎯 Ana Hedefler

### Ev Sahipleri İçin
- ✅ Tek tıkla iş emri oluşturma
- ✅ İş durumunu anlık takip etme
- ✅ Tüm tamiratların geçmiş kaydı
- ✅ Usta bilgilerine ulaşma

### Ustalar İçin
- ✅ Hazır müşteri portföyü
- ✅ Mobil yönetim paneli
- ✅ Randevu ve fatura yönetimi
- ✅ Hızlı ödeme altyapısı (altyapı hazır)

## 🏗️ Teknoloji Stack

### Frontend
- **React 18** - Modern UI kütüphanesi
- **TypeScript** - Tip güvenliği
- **Vite** - Hızlı build aracı
- **Tailwind CSS** - Modern styling
- **Zustand** - State management
- **React Router** - Navigasyon
- **Axios** - HTTP istekleri
- **Socket.io Client** - Real-time güncellemeler
- **React Toastify** - Bildirimler
- **Lucide React** - İkonlar

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **TypeScript** - Tip güvenliği
- **MongoDB + Mongoose** - Veritabanı
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Express Validator** - Validasyon
- **Multer** - File uploads

## 📁 Proje Yapısı

```
HomePAL/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/       # React bileşenleri
│   │   │   └── Layout.tsx
│   │   ├── pages/            # Sayfa komponentleri
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── HomeownerDashboard.tsx
│   │   │   ├── ProfessionalDashboard.tsx
│   │   │   ├── CreateJobPage.tsx
│   │   │   └── JobDetailsPage.tsx
│   │   ├── store/            # State management
│   │   │   └── authStore.ts
│   │   ├── types/            # TypeScript types
│   │   │   └── index.ts
│   │   ├── utils/            # Yardımcı fonksiyonlar
│   │   │   └── api.ts
│   │   ├── App.tsx           # Ana uygulama
│   │   ├── main.tsx          # Entry point
│   │   └── index.css         # Global styles
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── server/                   # Express Backend
│   ├── src/
│   │   ├── models/           # MongoDB modelleri
│   │   │   ├── User.ts
│   │   │   └── Job.ts
│   │   ├── routes/           # API rotaları
│   │   │   ├── auth.ts       # Authentication
│   │   │   ├── jobs.ts       # Job management
│   │   │   └── users.ts      # User management
│   │   ├── middleware/       # Middleware
│   │   │   └── auth.ts       # JWT auth
│   │   └── index.ts          # Server entry point
│   ├── package.json
│   └── tsconfig.json
│
├── README.md                 # Ana dokümantasyon
├── INSTALLATION.md          # Kurulum rehberi
├── USAGE.md                 # Kullanım kılavuzu
├── PROJECT_OVERVIEW.md      # Bu dosya
├── package.json             # Root package
└── .gitignore

```

## ✨ Tamamlanan Özellikler

### Backend API
- ✅ Kullanıcı kaydı ve girişi
- ✅ JWT tabanlı authentication
- ✅ İş emri oluşturma, listeleme, güncelleme
- ✅ Usta iş kabul sistemi
- ✅ İş tamamlama ve fiyatlandırma
- ✅ Real-time güncellemeler (Socket.io)
- ✅ Kullanıcı profil yönetimi
- ✅ Kategori ve öncelik sistemi
- ✅ MongoDB entegrasyonu

### Frontend UI
- ✅ Modern ve responsive tasarım
- ✅ Giriş ve kayıt sayfaları
- ✅ Ev sahibi dashboard
- ✅ Usta dashboard
- ✅ İş emri oluşturma formu
- ✅ İş detay sayfası
- ✅ Real-time güncellemeler
- ✅ Toast bildirimleri
- ✅ Loading states
- ✅ Error handling

### Kullanıcı Deneyimi
- ✅ Rol bazlı erişim kontrolü
- ✅ Anlık durum güncellemeleri
- ✅ Kategori bazlı filtreleme
- ✅ Öncelik seviyesi gösterimi
- ✅ Müşteri/usta iletişimi
- ✅ Geçmiş iş kayıtları
- ✅ İstatistik kartları (usta için)

## 🚀 Kullanım

### Kurulum
```bash
npm run install:all
```

### Geliştirme Modu
```bash
npm run dev
```

Daha detaylı bilgi için `INSTALLATION.md` dosyasına bakın.

## 📊 Veritabanı Şemaları

### User Model
```typescript
{
  name: string
  email: string (unique)
  password: string (hashed)
  role: 'homeowner' | 'professional'
  phone?: string
  address?: string
  specialties?: string[]  // For professionals
  rating?: number
  completedJobs?: number
}
```

### Job Model
```typescript
{
  title: string
  description: string
  category: string
  status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  location?: string
  homeowner: ObjectId
  professional?: ObjectId
  scheduledDate?: Date
  completedDate?: Date
  price?: number
  notes?: string
  images?: string[]
}
```

## 🔒 Güvenlik

- JWT token authentication
- Password hashing (bcrypt)
- Role-based access control
- API validation
- CORS protection

## 🔄 Real-time Özellikler

Socket.io ile gerçek zamanlı güncellemeler:
- Yeni iş emri bildirimleri
- İş durumu değişiklikleri
- İş kabul bildirimleri
- İş tamamlama bildirimleri

## 📱 Responsive Tasarım

- Mobile-first yaklaşım
- Tablet ve desktop uyumlu
- Modern ve kullanıcı dostu arayüz
- Tailwind CSS ile hızlı styling

## 🎨 UI Özellikleri

- Modern gradient tasarımlar
- İkon tabanlı navigasyon
- Durum badge'leri
- Kart tabanlı liste gösterimi
- Form validasyonları
- Loading animasyonları
- Toast bildirimleri

## 🔮 Gelecek Geliştirmeler

- [ ] Ödeme entegrasyonu (Stripe)
- [ ] Dosya yükleme (resim ekleme)
- [ ] Yorum ve değerlendirme sistemi
- [ ] Mesajlaşma özelliği
- [ ] E-posta bildirimleri
- [ ] Push notifications
- [ ] Mobil uygulama (React Native)
- [ ] Gelişmiş raporlama
- [ ] Takvim entegrasyonu
- [ ] Fatura oluşturma

## 📝 Lisans

MIT

## 👥 Katkıda Bulunma

Bu projeye katkıda bulunmak için:
1. Fork edin
2. Feature branch oluşturun
3. Değişikliklerinizi commit edin
4. Pull request gönderin

## 📞 İletişim

Sorularınız veya önerileriniz için lütfen issue açın.

