# 2026 Maaş ve Bordro Hesaplama Uygulaması (v2.7)

Modern, kapsamlı, yüksek performanslı ve mevzuata tam uyumlu 2026 yılı maaş, vergi ve bordro hesaplama platformu.

![Sürüm](https://img.shields.io/badge/Sürüm-v2.7-blue.svg)
![Yıl](https://img.shields.io/badge/Mevzuat-2026-emerald.svg)
![React](https://img.shields.io/badge/React-19-cyan.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-indigo.svg)

---

## 🌟 Sürüm 2.7 Yenilikleri
- **Gözü Yormayan Zarif Arka Plan:** Yumuşak, dengeli ve koyulaştırılmış estetik nakit/dolar arka plan dokusu.
- **Sadeleştirilmiş Header:** Gereksiz butonlar arındırılmış, modern ve akıcı üst navigasyon.
- **v2.7 Sürüm Etiketi:** Başlıkta ve imza alanında dinamik sürüm göstergesi.
- **Tek Tık Taşınabilir HTML (`Maas_Hesapla.html`):** Kurulum gerektirmeyen, doğrudan çift tıkla her cihazda çalışan derleme çıktısı.

---

## 🚀 Temel Özellikler

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

## 📤 GitHub'a Yükleme (Push) Adımları

Projeyi kendi GitHub deponuza göndermek için terminalden şu komutları uygulayabilirsiniz:

```bash
# 1. Kendi GitHub deponuzun linkini ekleyin:
git remote add origin https://github.com/KULLANICI_ADINIZ/REPO_ADINIZ.git

# 2. Ana dala geçin ve gönderin:
git branch -M main
git push -u origin main
```

---

## 📄 Tek Dosya Bağımsız Sürüm (Portable HTML)

İnternet bağlantısı veya Node.js ortamı gerekmeksizin doğrudan tarayıcıda çift tıklanarak çalışabilen tek dosya sürümüne kök dizindeki **`Maas_Hesapla.html`** dosyasından ulaşabilirsiniz.
