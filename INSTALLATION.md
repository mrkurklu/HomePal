# HomePal Kurulum Rehberi

Bu doküman, HomePal projesinin kurulumu için adım adım talimatları içerir.

## Gereksinimler

- Node.js (v18 veya üzeri)
- npm veya yarn
- MongoDB (yerel veya Atlas)
- Git

## Kurulum Adımları

### 1. Bağımlılıkları Yükleyin

```bash
# Proje kök dizininde tüm paketleri yükleyin
npm run install:all
```

Bu komut root, server ve client dizinlerindeki tüm bağımlılıkları yükleyecektir.

### 2. MongoDB Kurulumu

#### Seçenek A: Yerel MongoDB

1. MongoDB'yi bilgisayarınıza kurun: https://www.mongodb.com/try/download/community
2. MongoDB servisini başlatın:
   ```bash
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   
   # Windows
   net start MongoDB
   ```

#### Seçenek B: MongoDB Atlas (Bulut)

1. https://www.mongodb.com/cloud/atlas adresinden ücretsiz hesap oluşturun
2. Bir cluster oluşturun
3. Connection String'i kopyalayın
4. `.env` dosyasında `MONGO_URI` değerini güncelleyin

### 3. Ortam Değişkenlerini Ayarlayın

Server dizininde `.env` dosyası oluşturun:

```bash
cd server
cp .env.example .env
```

`.env` dosyasını aşağıdaki gibi düzenleyin:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/homepal
JWT_SECRET=your-secret-key-here
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

**Önemli**: `JWT_SECRET` değerini güçlü bir random string ile değiştirin!

### 4. Projeyi Çalıştırın

#### Geliştirme Modu (Frontend + Backend birlikte)

```bash
# Proje kök dizininden
npm run dev
```

Bu komut hem server'ı (localhost:5000) hem de client'ı (localhost:5173) başlatır.

#### Alternatif: Ayrı ayrı çalıştırma

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### 5. Uygulamayı Kullanın

Tarayıcınızda şu adresi açın:
```
http://localhost:5173
```

## İlk Kullanıcıları Oluşturma

Uygulamayı açtıktan sonra:

1. "Kayıt Ol" butonuna tıklayın
2. Ev Sahibi veya Usta olarak kayıt olun
3. Bilgilerinizi girin

## Özellikler

### Ev Sahipleri İçin:
- ✅ İş emri oluşturma
- ✅ İş emirlerinin durumunu takip etme
- ✅ Tamamlanan işlerin geçmişi
- ✅ Profesyonel bilgilerini görüntüleme

### Ustalar İçin:
- ✅ Bekleyen iş emirlerini görüntüleme
- ✅ İş emirlerini kabul etme
- ✅ Müşteri bilgilerini görme
- ✅ İş emrini tamamlayıp fiyat belirleme
- ✅ Randevu yönetimi

## Sorun Giderme

### MongoDB bağlantı hatası

```bash
# MongoDB'nin çalıştığından emin olun
# macOS/Linux
brew services list mongodb-community  # veya
sudo systemctl status mongod

# MongoDB'yi başlatın
brew services start mongodb-community  # veya
sudo systemctl start mongod
```

### Port zaten kullanılıyor

```bash
# Port 5000'i kontrol edin
lsof -ti:5000

# Kullanıcıyı sonlandırın
kill -9 $(lsof -ti:5000)
```

### Bağımlılık hatası

```bash
# Node modules'u sil ve tekrar yükle
rm -rf node_modules server/node_modules client/node_modules
npm run install:all
```

## Production Deploy

Production ortamına deploy etmek için:

1. Environment değişkenlerini production'a uygun ayarlayın
2. MongoDB Atlas kullanın
3. Build alın:
   ```bash
   npm run build
   ```
4. Server'ı başlatın:
   ```bash
   cd server
   npm start
   ```

## Daha Fazla Bilgi

Detaylı dokümantasyon için `README.md` dosyasına bakın.

