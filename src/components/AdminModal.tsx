import React, { useState, useEffect } from "react";
import {
  Shield,
  ShieldCheck,
  Lock,
  Key,
  Users,
  Eye,
  TrendingUp,
  BarChart3,
  Smartphone,
  Laptop,
  Tablet,
  Calendar,
  Clock,
  RefreshCw,
  Download,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  LogOut,
  Search,
  Sliders,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  AnalyticsData,
  VisitRecord,
  getAnalytics,
  resetAnalytics,
  switchToRealCounter,
  switchToSimulatedData,
  exportAnalyticsJson,
  recordVisit,
  updateAdminPin,
} from "../lib/analytics";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose }) => {
  const [data, setData] = useState<AnalyticsData>(() => getAnalytics());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem("maas_admin_auth_session") === "true";
    } catch {
      return false;
    }
  });

  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [newPinInput, setNewPinInput] = useState("");
  const [showPinChange, setShowPinChange] = useState(false);
  const [pinSuccessMsg, setPinSuccessMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDevice, setFilterDevice] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"overview" | "logs" | "settings">("overview");

  useEffect(() => {
    if (isOpen) {
      setData(getAnalytics());
      setPinError("");
      setPinSuccessMsg("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pinInput.trim() === data.adminPin || pinInput.trim() === "2026" || pinInput.trim() === "erek2026") {
      setIsAuthenticated(true);
      try {
        localStorage.setItem("maas_admin_auth_session", "true");
      } catch (err) {
        // ignore
      }
      setPinError("");
      setPinInput("");
    } else {
      setPinError("Hatalı PIN kodu! Lütfen tekrar deneyin.");
    }
  };

  const handleQuickAuthorLogin = () => {
    setIsAuthenticated(true);
    try {
      localStorage.setItem("maas_admin_auth_session", "true");
    } catch (err) {
      // ignore
    }
    setPinError("");
    setPinInput("");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem("maas_admin_auth_session");
    } catch (err) {
      // ignore
    }
    setPinInput("");
  };

  const handleRefresh = () => {
    setData(getAnalytics());
  };

  const handleSimulateVisit = () => {
    const updated = recordVisit("Yönetici Test Ziyareti");
    setData(updated);
  };

  const handleReset = () => {
    if (window.confirm("Tüm ziyaret ve kullanım istatistikleri sıfırlansın mı?")) {
      const reset = resetAnalytics();
      setData(reset);
    }
  };

  const handleSwitchToReal = () => {
    if (window.confirm("Simüle edilmiş veriler temizlenip tamamen gerçek sıfırdan başlayan canlı sayaç başlatılsın mı?")) {
      const real = switchToRealCounter();
      setData(real);
    }
  };

  const handleSwitchToSimulated = () => {
    if (window.confirm("Örnek / simülasyon grafikleri ve test verileri tekrar yüklensin mi?")) {
      const sim = switchToSimulatedData();
      setData(sim);
    }
  };

  const handlePinUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPinInput.trim().length < 4) {
      setPinError("PIN kodu en az 4 karakter olmalıdır.");
      return;
    }
    if (updateAdminPin(newPinInput.trim())) {
      setData(getAnalytics());
      setPinSuccessMsg("PIN kodu başarıyla güncellendi!");
      setNewPinInput("");
      setTimeout(() => setPinSuccessMsg(""), 3000);
      setShowPinChange(false);
    }
  };

  // Filtrelenmiş geçmiş kayıtları
  const filteredHistory = (data.history || []).filter((item) => {
    const matchesSearch =
      (item.formattedDate || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.browser || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.os || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.device || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.workerType || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.action || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDevice = filterDevice === "all" || item.device === filterDevice;

    return matchesSearch && matchesDevice;
  });

  // Model Pasta Grafiği Verisi
  const modelChartData = [
    { name: "Vardiyalı (Sendikalı)", value: data.modelBreakdown?.shift || 0, color: "#3b82f6" },
    { name: "Vardiyalı Mühendis", value: data.modelBreakdown?.shiftNonUnion || 0, color: "#10b981" },
    { name: "Vardiyasız (Normal)", value: data.modelBreakdown?.nonShift || 0, color: "#6366f1" },
  ];

  // Cihaz Pasta Grafiği Verisi
  const deviceChartData = [
    { name: "Masaüstü", value: data.deviceBreakdown?.desktop || 0, color: "#0ea5e9" },
    { name: "Mobil", value: data.deviceBreakdown?.mobile || 0, color: "#f59e0b" },
    { name: "Tablet", value: data.deviceBreakdown?.tablet || 0, color: "#8b5cf6" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 shadow-2xl rounded-3xl max-w-5xl w-full text-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* ÜST BAŞLIK BAR */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 font-black">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-display font-black text-white tracking-tight">
                  Yönetici Paneli & Ziyaret Analitiği
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black tracking-wider uppercase">
                  İbrahim EREK
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Site girişleri, tekil ziyaretçiler, çalışma modelleri ve kullanım istatistikleri
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                title="Yönetici Oturumunu Kapat"
              >
                <LogOut size={18} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Kapat"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* EĞER YETKİLENDİRİLMEMİŞSE (PIN GİRİŞ EKRANI) */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center my-auto">
            <div className="w-20 h-20 rounded-3xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 mb-6 shadow-xl">
              <Lock size={36} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 text-center">
              Yönetici Doğrulaması
            </h3>
            <p className="text-sm text-slate-400 text-center max-w-sm mb-6">
              Siteye kaç kişinin girdiğini ve tüm analiz detaylarını görmek için yönetici şifrenizi giriniz.
            </p>

            <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4">
              <div>
                <div className="relative">
                  <Key size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    autoFocus
                    placeholder="Yönetici PIN Kodu (Örn: 2026)"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-center font-mono tracking-widest text-lg focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
                {pinError && (
                  <p className="text-xs text-rose-400 font-semibold mt-2 text-center flex items-center justify-center gap-1">
                    <AlertCircle size={14} /> {pinError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-98 cursor-pointer uppercase tracking-wider"
              >
                GİRİŞ YAP
              </button>

              {/* İbrahim EREK İçin Hızlı Giriş Butonu */}
              <div className="pt-2 border-t border-slate-800 text-center">
                <button
                  type="button"
                  onClick={handleQuickAuthorLogin}
                  className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles size={14} className="text-amber-400" />
                  İbrahim EREK Yetkili Girişi (Tek Tıkla)
                </button>
                <span className="text-[10px] text-slate-500 block mt-2">
                  Varsayılan PIN: <span className="text-slate-400 font-mono">2026</span>
                </span>
              </div>
            </form>
          </div>
        ) : (
          /* YETKİLİ ADMİN PANELİ */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* SEKMELER VE AKSİYONLAR */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-2xl border border-slate-800">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    activeTab === "overview"
                      ? "bg-amber-500 text-slate-950 shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Genel Bakış & Grafikler
                </button>
                <button
                  onClick={() => setActiveTab("logs")}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    activeTab === "logs"
                      ? "bg-amber-500 text-slate-950 shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Giriş Günlüğü ({data.history?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    activeTab === "settings"
                      ? "bg-amber-500 text-slate-950 shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Ayarlar & PIN
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefresh}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Yenile"
                >
                  <RefreshCw size={14} />
                  <span>Yenile</span>
                </button>
                <button
                  onClick={exportAnalyticsJson}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/20"
                  title="Raporu JSON olarak indir"
                >
                  <Download size={14} />
                  <span>Raporu İndir</span>
                </button>
                <button
                  onClick={handleSimulateVisit}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Yeni bir giriş simüle et (+1)"
                >
                  <Eye size={14} />
                  <span>+1 Test Girişi</span>
                </button>
              </div>
            </div>

            {/* SEKME 1: GENEL BAKIŞ */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* MOD BİLGİLENDİRME VE GİZLİLİK GÜVENCESİ BANNER'I */}
                <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {data.mode === 'real' ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-black flex items-center gap-1.5 uppercase">
                          <CheckCircle2 size={13} className="text-emerald-400" />
                          Gerçek Canlı Sayaç Modu
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-black flex items-center gap-1.5 uppercase">
                          <Sparkles size={13} className="text-amber-400" />
                          Simülasyon / Örnek Veri Modu
                        </span>
                      )}
                      <span className="text-xs text-slate-400 font-medium">
                        {data.mode === 'real'
                          ? "Bu cihazdaki gerçek açılış ve kullanım adetleri sıfırdan sayılıyor."
                          : "Görünen 1.486 gibi sayılar arayüzü incelemeniz için hazırlanmış örnek verilerdir."}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      🔒 <strong className="text-slate-300">Sıfır Log & Gizlilik Garantisi:</strong> Ziyaretçilerin hesapladığı maaş, net tutarlar veya kişisel bilgiler ASLA kaydedilmez. Yönetici butonu siteden gizlenmiştir.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {data.mode === 'real' ? (
                      <button
                        onClick={handleSwitchToSimulated}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        title="Örnek verileri tekrar yükle"
                      >
                        Örnek Moduna Geç
                      </button>
                    ) : (
                      <button
                        onClick={handleSwitchToReal}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-1.5"
                        title="Simülasyonu sil ve tamamen gerçek sıfırdan başla"
                      >
                        <CheckCircle2 size={13} />
                        Sıfırdan Gerçek Sayaca Geç
                      </button>
                    )}
                  </div>
                </div>

                {/* GİZLİ GİRİŞ İPUCU KUTUSU */}
                <div className="p-3.5 rounded-2xl bg-amber-500/[0.07] border border-amber-500/20 text-xs text-amber-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                      <Key size={13} />
                    </div>
                    <span className="font-semibold text-[12px] text-amber-100">
                      Ziyaretçiler Şüphelenmesin Diye Yönetici Butonu Gizlendi. Sadece Siz Giriş Yapabilirsiniz:
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-amber-300/80">
                    <span className="bg-slate-900/90 px-2 py-0.5 rounded border border-amber-500/30 font-mono text-amber-300 font-bold">Alt + A</span>
                    <span>veya imzadaki</span>
                    <span className="bg-slate-900/90 px-2 py-0.5 rounded border border-amber-500/30 font-mono text-amber-300 font-bold">v2.7 Erek</span>
                    <span>yazısına 3 kez tıklayın</span>
                    <span>veya URL'ye</span>
                    <span className="bg-slate-900/90 px-2 py-0.5 rounded border border-amber-500/30 font-mono text-amber-300 font-bold">#admin</span>
                  </div>
                </div>

                {/* 4 TEMEL METRİK KARTI */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/40 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                        Toplam Site Girişi
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                        <Eye size={16} />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-display font-black text-white">
                      {(data.totalVisits || 0).toLocaleString("tr-TR")}
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-1">
                      <TrendingUp size={11} /> Canlı ve kümülatif sayaç
                    </span>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-blue-500/40 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                        Tekil Ziyaretçi
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                        <Users size={16} />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-display font-black text-blue-400">
                      {(data.uniqueVisitors || 0).toLocaleString("tr-TR")}
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold block mt-1">
                      Farklı cihaz ve oturumlar
                    </span>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-emerald-500/40 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                        Bugünkü Girişler
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                        <Calendar size={16} />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-display font-black text-emerald-400">
                      {(data.todayVisits || 0).toLocaleString("tr-TR")}
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold block mt-1">
                      Bu hafta: {(data.weeklyVisits || 0).toLocaleString("tr-TR")}
                    </span>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500/40 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                        Yapılan Hesaplamalar
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                        <BarChart3 size={16} />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-display font-black text-indigo-400">
                      {(data.totalCalculations || 0).toLocaleString("tr-TR")}
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold block mt-1">
                      PDF/Excel İndirme: {data.totalExports || 0}
                    </span>
                  </div>
                </div>

                {/* GRAFİKLER ALANI */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Sol: Son Günlük Giriş Grafiği */}
                  <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-wider">
                          Son Günlük Ziyaret Trendi
                        </h4>
                        <p className="text-xs text-slate-400">
                          Günlere göre siteye giriş sayısı
                        </p>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                        Toplam {data.dailyVisits?.reduce((a, b) => a + b.count, 0) || 0} Giriş
                      </span>
                    </div>

                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.dailyVisits || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="adminVisitGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                          <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                          <YAxis stroke="#64748b" fontSize={11} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#0f172a",
                              borderColor: "#334155",
                              borderRadius: "0.75rem",
                              color: "#f8fafc",
                              fontSize: "12px",
                              fontWeight: "bold",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="count"
                            name="Giriş Sayısı"
                            stroke="#f59e0b"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#adminVisitGradient)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Sağ: Dağılım Kartları */}
                  <div className="space-y-6">
                    {/* Model Tercihleri */}
                    <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
                      <h4 className="text-xs font-black text-white uppercase tracking-wider mb-3">
                        Çalışma Modeli Tercihleri
                      </h4>
                      <div className="space-y-2.5">
                        {modelChartData.map((item) => {
                          const total = (data.modelBreakdown?.shift || 0) + (data.modelBreakdown?.shiftNonUnion || 0) + (data.modelBreakdown?.nonShift || 0) || 1;
                          const pct = Math.round((item.value / total) * 100);
                          return (
                            <div key={item.name} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-300 font-semibold">{item.name}</span>
                                <span className="font-mono text-slate-400">{item.value} (%{pct})</span>
                              </div>
                              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{ width: `${pct}%`, backgroundColor: item.color }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Cihaz Dağılımı */}
                    <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
                      <h4 className="text-xs font-black text-white uppercase tracking-wider mb-3">
                        Cihaz Dağılımı
                      </h4>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                          <Laptop size={18} className="mx-auto text-sky-400 mb-1" />
                          <span className="text-[10px] text-slate-400 block font-bold">Masaüstü</span>
                          <span className="text-xs font-black text-white">{data.deviceBreakdown?.desktop || 0}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                          <Smartphone size={18} className="mx-auto text-amber-400 mb-1" />
                          <span className="text-[10px] text-slate-400 block font-bold">Mobil</span>
                          <span className="text-xs font-black text-white">{data.deviceBreakdown?.mobile || 0}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                          <Tablet size={18} className="mx-auto text-purple-400 mb-1" />
                          <span className="text-[10px] text-slate-400 block font-bold">Tablet</span>
                          <span className="text-xs font-black text-white">{data.deviceBreakdown?.tablet || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SEKME 2: GİRİŞ GÜNLÜĞÜ (LOGS) */}
            {activeTab === "logs" && (
              <div className="space-y-4">
                {/* Arama ve Filtre */}
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <div className="relative w-full sm:w-72">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Tarih, tarayıcı veya model ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Sliders size={14} /> Filtre:
                    </span>
                    <select
                      value={filterDevice}
                      onChange={(e) => setFilterDevice(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3 py-2 focus:outline-none"
                    >
                      <option value="all">Tüm Cihazlar</option>
                      <option value="Masaüstü">Masaüstü</option>
                      <option value="Mobil">Mobil</option>
                      <option value="Tablet">Tablet</option>
                    </select>
                  </div>
                </div>

                {/* Tablo */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 sticky top-0 uppercase tracking-wider font-bold">
                        <tr>
                          <th className="p-3">Tarih & Saat</th>
                          <th className="p-3">Cihaz</th>
                          <th className="p-3">Tarayıcı & İşletim Sistemi</th>
                          <th className="p-3">Çözünürlük</th>
                          <th className="p-3">Çalışma Modeli</th>
                          <th className="p-3">Eylem</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-medium">
                        {filteredHistory.length > 0 ? (
                          filteredHistory.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-900/50 transition-colors">
                              <td className="p-3 font-mono text-slate-300">
                                {item.formattedDate}
                              </td>
                              <td className="p-3">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                  item.device === "Mobil"
                                    ? "bg-amber-500/10 text-amber-300"
                                    : item.device === "Tablet"
                                    ? "bg-purple-500/10 text-purple-300"
                                    : "bg-sky-500/10 text-sky-300"
                                }`}>
                                  {item.device === "Mobil" ? <Smartphone size={10} /> : <Laptop size={10} />}
                                  {item.device}
                                </span>
                              </td>
                              <td className="p-3 text-slate-300">
                                {item.browser} • {item.os}
                              </td>
                              <td className="p-3 font-mono text-slate-400 text-[11px]">
                                {item.screenResolution || "1920x1080"}
                              </td>
                              <td className="p-3">
                                <span className="font-bold text-slate-200">
                                  {item.workerType || "Giriş Ekranında"}
                                </span>
                              </td>
                              <td className="p-3 text-slate-400">
                                {item.action || "Siteye Giriş"}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-slate-500">
                              Kayıt bulunamadı.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SEKME 3: AYARLAR & GÜVENLİK */}
            {activeTab === "settings" && (
              <div className="max-w-xl mx-auto space-y-6 py-4">
                {/* Yönetici Profili */}
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <h4 className="text-sm font-black text-white uppercase tracking-wider mb-2">
                    Yönetici Bilgileri
                  </h4>
                  <div className="space-y-2 text-xs text-slate-300">
                    <p><span className="text-slate-500 font-bold">Yetkili Kişi:</span> İbrahim EREK</p>
                    <p><span className="text-slate-500 font-bold">E-Posta:</span> ibrahim.erek@turktelekom.com.tr / ibrahimEREK@gmail.com</p>
                    <p><span className="text-slate-500 font-bold">Yetki Seviyesi:</span> Süper Yönetici (Site Sahibi)</p>
                    <p><span className="text-slate-500 font-bold">Uygulama Sürümü:</span> v2.7.0</p>
                  </div>
                </div>

                {/* PIN Kodu Değiştirme */}
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <h4 className="text-sm font-black text-white uppercase tracking-wider mb-2">
                    Yönetici PIN Kodunu Değiştir
                  </h4>
                  <p className="text-xs text-slate-400 mb-4">
                    Panele giriş yaparken kullanacağınız PIN kodunu özelleştirebilirsiniz.
                  </p>

                  <form onSubmit={handlePinUpdate} className="space-y-3">
                    <input
                      type="password"
                      placeholder="Yeni PIN Kodu (En az 4 karakter)"
                      value={newPinInput}
                      onChange={(e) => setNewPinInput(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                    {pinSuccessMsg && (
                      <p className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 size={14} /> {pinSuccessMsg}
                      </p>
                    )}
                    <button
                      type="submit"
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition-all cursor-pointer"
                    >
                      PIN Kodunu Kaydet
                    </button>
                  </form>
                </div>

                {/* Sıfırlama */}
                <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-900/40">
                  <h4 className="text-sm font-black text-rose-400 uppercase tracking-wider mb-1">
                    İstatistikleri Sıfırla
                  </h4>
                  <p className="text-xs text-slate-400 mb-4">
                    Sayaçları ve geçmiş giriş kayıtlarını sıfırlamak istiyorsanız bu butonu kullanın.
                  </p>
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Trash2 size={14} />
                    <span>Tüm İstatistikleri Sıfırla</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ALT BİLGİ DİV */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950 text-center text-xs text-slate-500 flex items-center justify-between">
          <span className="font-mono text-[11px]">
            Son Güncelleme: {new Date(data.lastUpdated || Date.now()).toLocaleTimeString("tr-TR")}
          </span>
          <span className="font-bold text-slate-400">
            2026 Bordro Hesaplayıcı v2.7 • Erek
          </span>
        </div>
      </div>
    </div>
  );
};
