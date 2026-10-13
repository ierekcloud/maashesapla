// Site Ziyaret ve Kullanım İstatistikleri Yönetimi (Admin Analytics)
export interface VisitRecord {
  id: string;
  timestamp: string; // ISO string
  formattedDate: string; // GG.AA.YYYY, SS:DD:SS
  device: 'Masaüstü' | 'Mobil' | 'Tablet';
  browser: string;
  os: string;
  screenResolution: string;
  workerType?: string;
  action?: string;
}

export interface AnalyticsData {
  totalVisits: number;
  uniqueVisitors: number;
  todayVisits: number;
  weeklyVisits: number;
  monthlyVisits: number;
  totalCalculations: number;
  totalExports: number;
  modelBreakdown: {
    shift: number;
    shiftNonUnion: number;
    nonShift: number;
  };
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  dailyVisits: { date: string; count: number }[];
  history: VisitRecord[];
  lastUpdated: string;
  adminPin: string;
  mode?: 'simulated' | 'real';
}

const STORAGE_KEY = 'maas_site_analytics_v2';
const VISITOR_ID_KEY = 'maas_unique_visitor_id';
const DEFAULT_PIN = '2026';

// Cihaz ve Tarayıcı tespiti
function detectClient() {
  if (typeof window === 'undefined') {
    return {
      device: 'Masaüstü' as const,
      browser: 'Bilinmiyor',
      os: 'Bilinmiyor',
      screenResolution: '1920x1080',
    };
  }

  const ua = navigator.userAgent || '';
  const width = window.innerWidth || 1024;

  let device: 'Masaüstü' | 'Mobil' | 'Tablet' = 'Masaüstü';
  if (/iPad|Tablet/i.test(ua) || (width >= 640 && width <= 1024 && 'ontouchstart' in window)) {
    device = 'Tablet';
  } else if (/Mobi|Android|iPhone/i.test(ua) || width < 640) {
    device = 'Mobil';
  }

  let browser = 'Bilinmiyor';
  if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
  else if (ua.indexOf('SamsungBrowser') > -1) browser = 'Samsung Internet';
  else if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) browser = 'Opera';
  else if (ua.indexOf('Trident') > -1) browser = 'Internet Explorer';
  else if (ua.indexOf('Edge') > -1 || ua.indexOf('Edg') > -1) browser = 'Microsoft Edge';
  else if (ua.indexOf('Chrome') > -1) browser = 'Google Chrome';
  else if (ua.indexOf('Safari') > -1) browser = 'Apple Safari';

  let os = 'Bilinmiyor';
  if (ua.indexOf('Win') > -1) os = 'Windows';
  else if (ua.indexOf('Mac') > -1 && !/iPhone|iPad|iPod/.test(ua)) os = 'macOS';
  else if (ua.indexOf('Linux') > -1 && !/Android/.test(ua)) os = 'Linux';
  else if (ua.indexOf('Android') > -1) os = 'Android';
  else if (/iPhone|iPad|iPod/.test(ua)) os = 'iOS';

  const screenResolution = `${window.screen?.width || window.innerWidth}x${window.screen?.height || window.innerHeight}`;

  return { device, browser, os, screenResolution };
}

// Başlangıç için gerçekçi temel geçmiş üretici (sitenin daha önceki kullanımlarını yansıtır)
function generateInitialData(): AnalyticsData {
  const days: { date: string; count: number }[] = [];
  const now = new Date();
  
  // Son 7 günün dağılımı
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayLabel = d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
    // Hafta içi daha yoğun, hafta sonu biraz daha az
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const baseCount = isWeekend ? Math.floor(18 + Math.random() * 15) : Math.floor(45 + Math.random() * 30);
    days.push({ date: dayLabel, count: baseCount });
  }

  const initialHistory: VisitRecord[] = [
    {
      id: 'vis_init_1',
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      formattedDate: new Date(Date.now() - 1000 * 60 * 12).toLocaleString('tr-TR'),
      device: 'Masaüstü',
      browser: 'Google Chrome',
      os: 'Windows',
      screenResolution: '1920x1080',
      workerType: 'Vardiyalı (Sendikalı)',
      action: 'Bordro Analizi & Yıllık Hesaplama',
    },
    {
      id: 'vis_init_2',
      timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      formattedDate: new Date(Date.now() - 1000 * 60 * 35).toLocaleString('tr-TR'),
      device: 'Mobil',
      browser: 'Apple Safari',
      os: 'iOS',
      screenResolution: '390x844',
      workerType: 'Vardiyasız',
      action: 'Net Maaş Sorgulama',
    },
    {
      id: 'vis_init_3',
      timestamp: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
      formattedDate: new Date(Date.now() - 1000 * 60 * 75).toLocaleString('tr-TR'),
      device: 'Masaüstü',
      browser: 'Microsoft Edge',
      os: 'Windows',
      screenResolution: '2560x1440',
      workerType: 'Vardiyalı (Vardiyalı Mühendis)',
      action: 'BYS & Mesai Hesaplama',
    },
    {
      id: 'vis_init_4',
      timestamp: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
      formattedDate: new Date(Date.now() - 1000 * 60 * 140).toLocaleString('tr-TR'),
      device: 'Mobil',
      browser: 'Google Chrome',
      os: 'Android',
      screenResolution: '412x915',
      workerType: 'Vardiyalı (Sendikalı)',
      action: 'Arşive Kayıt',
    },
  ];

  return {
    totalVisits: 1486,
    uniqueVisitors: 412,
    todayVisits: 38,
    weeklyVisits: 284,
    monthlyVisits: 1190,
    totalCalculations: 742,
    totalExports: 198,
    modelBreakdown: {
      shift: 840,
      shiftNonUnion: 385,
      nonShift: 261,
    },
    deviceBreakdown: {
      desktop: 890,
      mobile: 520,
      tablet: 76,
    },
    dailyVisits: days,
    history: initialHistory,
    lastUpdated: new Date().toISOString(),
    adminPin: DEFAULT_PIN,
    mode: 'simulated',
  };
}

export function getAnalytics(): AnalyticsData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = generateInitialData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const data = JSON.parse(raw);
    return data;
  } catch (e) {
    return generateInitialData();
  }
}

export function saveAnalytics(data: AnalyticsData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Analytics kaydedilemedi:', e);
  }
}

// Yeni bir ziyaret kaydı oluşturur ve sayaçları artırır
export function recordVisit(action: string = 'Siteye Giriş'): AnalyticsData {
  const current = getAnalytics();
  const client = detectClient();
  const now = new Date();
  const dateStr = now.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });

  // Tekil ziyaretçi kontrolü
  let isNewUnique = false;
  try {
    let visitorId = localStorage.getItem(VISITOR_ID_KEY);
    if (!visitorId) {
      visitorId = 'usr_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      localStorage.setItem(VISITOR_ID_KEY, visitorId);
      isNewUnique = true;
    }
  } catch (e) {
    // ignore
  }

  // Son güncel günlük grafiği güncelle
  const daily = [...(current.dailyVisits || [])];
  const todayEntry = daily.find((d) => d.date === dateStr);
  if (todayEntry) {
    todayEntry.count += 1;
  } else {
    daily.push({ date: dateStr, count: 1 });
    if (daily.length > 14) daily.shift();
  }

  // Cihaz dağılımını artır
  const deviceKey =
    client.device === 'Mobil' ? 'mobile' : client.device === 'Tablet' ? 'tablet' : 'desktop';
  const updatedDevice = {
    ...current.deviceBreakdown,
    [deviceKey]: (current.deviceBreakdown?.[deviceKey] || 0) + 1,
  };

  const newRecord: VisitRecord = {
    id: 'vis_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
    timestamp: now.toISOString(),
    formattedDate: now.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    device: client.device,
    browser: client.browser,
    os: client.os,
    screenResolution: client.screenResolution,
    action,
  };

  const updatedHistory = [newRecord, ...(current.history || [])].slice(0, 100);

  const updated: AnalyticsData = {
    ...current,
    totalVisits: (current.totalVisits || 0) + 1,
    uniqueVisitors: (current.uniqueVisitors || 0) + (isNewUnique ? 1 : 0),
    todayVisits: (current.todayVisits || 0) + 1,
    weeklyVisits: (current.weeklyVisits || 0) + 1,
    monthlyVisits: (current.monthlyVisits || 0) + 1,
    deviceBreakdown: updatedDevice,
    dailyVisits: daily,
    history: updatedHistory,
    lastUpdated: now.toISOString(),
  };

  saveAnalytics(updated);
  return updated;
}

// Çalışma modeli seçildiğinde istatistiği güncelle
export function recordModelChoice(model: 'shift' | 'shift-non-union' | 'non-shift'): void {
  const current = getAnalytics();
  const key = model === 'shift' ? 'shift' : model === 'shift-non-union' ? 'shiftNonUnion' : 'nonShift';
  
  const modelName =
    model === 'shift'
      ? 'Vardiyalı (Sendikalı)'
      : model === 'shift-non-union'
      ? 'Vardiyalı (Mühendis)'
      : 'Vardiyasız (Normal)';

  const updated: AnalyticsData = {
    ...current,
    modelBreakdown: {
      ...current.modelBreakdown,
      [key]: (current.modelBreakdown?.[key] || 0) + 1,
    },
  };

  // Son kayda model bilgisini ekle
  if (updated.history && updated.history.length > 0) {
    updated.history[0] = {
      ...updated.history[0],
      workerType: modelName,
    };
  }

  saveAnalytics(updated);
}

// Hesaplama yapıldığında sayacı artır
export function recordCalculationEvent(): void {
  const current = getAnalytics();
  const updated: AnalyticsData = {
    ...current,
    totalCalculations: (current.totalCalculations || 0) + 1,
  };
  saveAnalytics(updated);
}

// PDF/Excel indirme yapıldığında sayacı artır
export function recordExportEvent(): void {
  const current = getAnalytics();
  const updated: AnalyticsData = {
    ...current,
    totalExports: (current.totalExports || 0) + 1,
  };
  saveAnalytics(updated);
}

// Gerçek Sıfırdan Başlayan Sayaç Moduna Geç (Simülasyonu Temizle)
export function switchToRealCounter(): AnalyticsData {
  const current = getAnalytics();
  const client = detectClient();
  const now = new Date();
  const dateStr = now.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });

  const freshRecord: VisitRecord = {
    id: 'vis_real_1',
    timestamp: now.toISOString(),
    formattedDate: now.toLocaleString('tr-TR'),
    device: client.device,
    browser: client.browser,
    os: client.os,
    screenResolution: client.screenResolution,
    workerType: 'Vardiyalı (Sendikalı)',
    action: 'Gerçek Canlı Sayaç Başlatıldı',
  };

  const realData: AnalyticsData = {
    mode: 'real',
    totalVisits: 1,
    uniqueVisitors: 1,
    todayVisits: 1,
    weeklyVisits: 1,
    monthlyVisits: 1,
    totalCalculations: 0,
    totalExports: 0,
    modelBreakdown: {
      shift: 0,
      shiftNonUnion: 0,
      nonShift: 0,
    },
    deviceBreakdown: {
      desktop: client.device === 'Masaüstü' ? 1 : 0,
      mobile: client.device === 'Mobil' ? 1 : 0,
      tablet: client.device === 'Tablet' ? 1 : 0,
    },
    dailyVisits: [{ date: dateStr, count: 1 }],
    history: [freshRecord],
    lastUpdated: now.toISOString(),
    adminPin: current.adminPin || DEFAULT_PIN,
  };
  saveAnalytics(realData);
  return realData;
}

// Örnek / Simülasyon Veri Moduna Geri Dön
export function switchToSimulatedData(): AnalyticsData {
  const current = getAnalytics();
  const initial = generateInitialData();
  initial.adminPin = current.adminPin || DEFAULT_PIN;
  saveAnalytics(initial);
  return initial;
}

// İstatistikleri sıfırla
export function resetAnalytics(): AnalyticsData {
  return switchToRealCounter();
}

// Admin PIN güncelle
export function updateAdminPin(newPin: string): boolean {
  if (!newPin || newPin.trim().length < 4) return false;
  const current = getAnalytics();
  current.adminPin = newPin.trim();
  saveAnalytics(current);
  return true;
}

// İstatistikleri JSON olarak dışa aktar
export function exportAnalyticsJson(): void {
  const data = getAnalytics();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Maas_Analitik_Raporu_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
