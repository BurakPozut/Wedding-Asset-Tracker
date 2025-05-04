# Düğün Hediye Takibi (Wedding Asset Tracker)

Düğününüzde aldığınız altın ve para hediyelerini takip etmek, bağışçıları kaydetmek ve varlıklarınızın değer değişimini izlemek için geliştirilmiş bir web uygulaması.

## Özellikler

- **Varlık Takibi**: Çeyrek Altın, Tam Altın, Reşat, Beşi Bir Yerde, Bilezik, Gram Altın ve para birimlerini (TL, Dolar, Euro) kaydedin.
- **Bağışçı Yönetimi**: Hediye veren kişileri damat veya gelin tarafı olarak etiketleyerek kaydedin.
- **Değer Değişimi**: Varlıklarınızın zaman içerisindeki değer değişimini görselleştirin.
- **Türkçe Arayüz**: Tamamen Türkçe kullanıcı arayüzü.
- **Güvenli Erişim**: Google ile veya e-posta/şifre ile giriş yapın.
- **Mobil Uyumlu**: Responsive tasarım sayesinde her cihazda çalışır.

## Teknolojiler

- **Frontend/Backend**: Next.js 14 (App Router, TypeScript)
- **Stil**: Tailwind CSS
- **Veritabanı**: PostgreSQL ve Prisma ORM
- **Kimlik Doğrulama**: NextAuth.js
- **Grafik**: Chart.js
- **HTTP İstemcisi**: Axios
- **Barındırma**: VPS (Node.js, PM2, Nginx)

## Kurulum

### Gereksinimler

- Node.js 18 veya üstü
- PostgreSQL veritabanı
- npm

### Yerel Geliştirme

1. Projeyi klonlayın:
   ```bash
   git clone https://github.com/kullaniciadiniz/wedding-asset-tracker.git
   cd wedding-asset-tracker
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

3. `.env` dosyasını yapılandırın:
   ```
   DATABASE_URL="postgresql://kullanici:sifre@localhost:5432/wedding_assets?schema=public"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="güvenli-bir-anahtar-oluşturun"
   GOOGLE_CLIENT_ID="google-client-id"
   GOOGLE_CLIENT_SECRET="google-client-secret"
   ```

4. Veritabanı şemasını oluşturun:
   ```bash
   npx prisma migrate dev --name init
   ```

5. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   ```

6. Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresine gidin.

### VPS Üzerinde Dağıtım

1. VPS'inizde Node.js, PM2 ve Nginx kurun:
   ```bash
   # Node.js kurulumu (Ubuntu/Debian üzerinde)
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # PM2 kurulumu
   npm install -g pm2

   # Nginx kurulumu
   sudo apt-get install -y nginx
   ```

2. PostgreSQL veritabanı kurun:
   ```bash
   sudo apt-get install -y postgresql postgresql-contrib
   sudo -u postgres createdb wedding_assets
   ```

3. Projeyi sunucunuza klonlayın ve bağımlılıkları yükleyin:
   ```bash
   git clone https://github.com/kullaniciadiniz/wedding-asset-tracker.git
   cd wedding-asset-tracker
   npm install
   ```

4. `.env` dosyasını yapılandırın (yukarıdaki gibi, sunucu URL'nizle).

5. Veritabanı şemasını oluşturun ve build alın:
   ```bash
   npx prisma migrate deploy
   npm run build
   ```

6. PM2 ile uygulamayı çalıştırın:
   ```bash
   pm2 start npm --name "wedding-asset-tracker" -- start
   pm2 save
   pm2 startup
   ```

7. Nginx yapılandırması:
   ```nginx
   server {
       listen 80;
       server_name sizinalan.com www.sizinalan.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

8. Nginx'i yeniden başlatın:
   ```bash
   sudo service nginx restart
   ```

9. (Opsiyonel) Certbot ile SSL sertifikası edinin:
   ```bash
   sudo apt-get install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d sizinalan.com -d www.sizinalan.com
   ```

## Katkıda Bulunma

1. Bu repoyu forklayın.
2. Yeni bir branch oluşturun (`git checkout -b ozellik/yenilik`).
3. Değişikliklerinizi commit edin (`git commit -m 'Yeni özellik: Açıklama'`).
4. Branch'inizi push edin (`git push origin ozellik/yenilik`).
5. Bir Pull Request oluşturun.

## Lisans

Bu proje MIT Lisansı altında lisanslanmıştır.
