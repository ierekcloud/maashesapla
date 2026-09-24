# 2026 Maaş ve Bordro Hesaplama Uygulaması

Modern, kapsamlı ve mevzuata tam uyumlu 2026 yılı maaş ve bordro hesaplama platformu.

## 🚀 Özellikler

- **3 Farklı Çalışma Modeli:**
  - **Vardiyalı (Sendikalı):** Vardiya primleri, vardiyalı çalışma günleri, sendika aidatı (%80 brüt yevmiye), ikramiye günleri (20-20-20-20-20-12), servis ve bayram parası hesaplamaları.
  - **Vardiyasız (Normal Mesai):** Aylık sabit 21 gün net yemek kartı (550 TL/gün), otomatik 13 günlük sabit servis hakkı (4.717,05 TL), ikramiye ve isteğe bağlı bayram parası.
  - **Vardiyalı (Vardiyalı Mühendis / Kapsam Dışı):** Sendikasız vardiya modeli ve kapsam dışı haklar.
- **2026 Vergi & SGK Mevzuatı:**
  - Güncel gelir vergisi dilimleri (%15, %20, %27, %35, %40) ve asgari ücret istisnası.
  - Yemek parası SGK & Gelir Vergisi muafiyeti hesaplaması.
  - Damga vergisi istisnası ve kümülatif matrah takibi.
- **Şık ve Ergonomik Arayüz:**
  - Oval, açılır-kapanır çocuk sayısı ve aile durumu seçicileri.
  - Koyu (Dark) ve Açık (Light) tema desteği.
  - Anlık aylık detay grafikleri (Alan grafiği ve Gider dağılımı pasta grafiği).
- **Dışa Aktarma & Raporlama:**
  - Resmi formatta detaylı PDF bordro dökümü (Türkçe karakter destekli `jsPDF` + `autoTable`).
  - Tek tıkla bağımsız tek dosya HTML çıktısı (`Maas_Hesapla.html`).

---

## 🛠️ Kurulum ve Çalıştırma

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyebilirsiniz:

### 1. Depoyu Klonlayın
```bash
git clone <repo-url>
cd <repo-folder>
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Geliştirme Sunucusunu Başlatın
```bash
npm run dev
```
Uygulama varsayılan olarak `http://localhost:3000` adresinde çalışacaktır.

### 4. Canlı (Production) Derleme
```bash
npm run build
```
Derleme çıktısı `dist/` klasörüne ve kök dizindeki bağımsız `Maas_Hesapla.html` dosyasına aktarılır.

---

## 📄 Tek Dosya Bağımsız Sürüm (Portable HTML)

İnternet bağlantısı veya Node.js ortamı gerekmeksizin doğrudan tarayıcıda çift tıklanarak çalışabilen tek dosya sürümüne kök dizindeki **`Maas_Hesapla.html`** dosyasından ulaşabilirsiniz.
