# HomePal - Ev Bakım ve Yönetim Platformu

HomePal, ev sahipleri ve güvenilir ustalar arasındaki iletişimi ve iş yönetimini kökten çözen akıllı bir ev bakım ve yönetim asistanıdır.

## Özellikler

### Ev Sahipleri İçin:
- **Tek Tıkla İş Emri**: "Lavabo tıkandı" demek kadar basit iş emri oluşturma
- **Şeffaflık**: Yapılan işin durumunu anlık olarak takip etme
- **Geçmiş Kaydı**: Tüm tamiratların kaydını tutma ve erişme

### Ustalar İçin:
- **Hazır Müşteri Portföyü**: Gelen iş emirlerini anında görme ve kabul etme
- **Mobil Yönetim**: Randevular, faturalar ve müşteri iletişimi tek platform
- **Hızlı Ödeme**: İş bitiminde anında ödeme altyapısı

## Tech Stack

**Frontend:**
- React + TypeScript
- Vite
- Tailwind CSS
- Socket.io Client
- React Router
- Zustand (state management)

**Backend:**
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- Socket.io
- JWT Authentication
- Multer (file uploads)

## Kurulum

```bash
# Tüm bağımlılıkları yükle
npm run install:all

# Ortam değişkenlerini ayarla
cp server/.env.example server/.env

# Geliştirme modunda çalıştır
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Giriş
- `GET /api/auth/me` - Aktif kullanıcı bilgisi

### Jobs
- `GET /api/jobs` - İş emirleri listesi
- `POST /api/jobs` - Yeni iş emri oluştur
- `GET /api/jobs/:id` - İş emri detayı
- `PUT /api/jobs/:id` - İş emri güncelle
- `PUT /api/jobs/:id/accept` - İş emri kabul
- `PUT /api/jobs/:id/complete` - İş emri tamamla

### Users
- `GET /api/users` - Kullanıcılar listesi
- `GET /api/users/:id` - Kullanıcı detayı
- `PUT /api/users/:id` - Kullanıcı güncelle

## Proje Yapısı

```
HomePAL/
├── client/          # React frontend
├── server/          # Express backend
├── README.md
└── package.json
```

## Lisans

MIT

