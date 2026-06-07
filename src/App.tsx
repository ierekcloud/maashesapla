import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Minus,
  Trash2,
  History,
  Calculator,
  ChartBar,
  Calendar,
  Info,
  Moon,
  Sun,
  TrendingUp,
  Download,
  ArrowLeft,
  Users,
  Briefcase,
  Percent,
  Settings2,
  Lock,
  Copy,
  Check,
  Gift,
  Shield,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { MonthInput, SalaryResult, CalculationHistory } from "./types";
import { calculateYear } from "./lib/salaryLogic";
import { formatCurrency, cn } from "./lib/utils";

// --- Sub-components ---

const DateTimeWeatherWidget = () => {
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    // Istanbul coordinates for weather
    fetch("https://api.open-meteo.com/v1/forecast?latitude=41.0082&longitude=28.9784&current=temperature_2m")
      .then(res => res.json())
      .then(data => setWeather(data.current.temperature_2m))
      .catch(console.error);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-3 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 dark:from-blue-600/60 dark:to-indigo-600/60 px-5 py-3 rounded-3xl border border-blue-400/30 backdrop-blur-md shadow-inner">
      <div className="flex flex-col items-end">
        <span className="text-[12px] font-black text-blue-700 dark:text-blue-100 uppercase tracking-widest">{time.toLocaleDateString("tr-TR")}</span>
        <span className="text-2xl font-display font-black text-slate-950 dark:text-white leading-none">{time.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</span>
      </div>
      {weather !== null && (
        <div className="text-2xl font-black text-indigo-700 dark:text-indigo-200">
          {Math.round(weather)}°C
        </div>
      )}
    </div>
  );
};

const InputField = ({
  label,
  value,
  onChange,
  prefix = "₺",
  suffix = "",
  readOnly = false,
  isHighlight = false,
}: {
  label: string;
  value: number;
  onChange?: (val: number) => void;
  prefix?: string;
  suffix?: string;
  readOnly?: boolean;
  isHighlight?: boolean;
}) => (
  <div className={cn("group relative", isHighlight && "ring-2 ring-amber-500/50 rounded-2xl bg-amber-500/5")}>
    <div className="flex justify-between items-center mb-1.5 px-1">
      <label className={cn("text-[11px] font-black uppercase tracking-widest", isHighlight ? "text-amber-700 dark:text-amber-400" : "text-rose-600 dark:text-rose-400")}>
        {label}
      </label>
      {suffix && (
        <span className="text-[10px] font-bold text-blue-500 uppercase">
          {suffix}
        </span>
      )}
    </div>
    <div className="relative">
      {prefix && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[12px]">
          {prefix}
        </span>
      )}
      <input
        type="number"
        value={value === 0 ? "" : value}
        onChange={(e) =>
          onChange?.(e.target.value === "" ? 0 : Number(e.target.value))
        }
        readOnly={readOnly}
        className={cn(
          "w-full py-2 rounded-xl transition-all outline-none font-bold text-sm tracking-tight border-2",
          prefix ? "pl-8" : "pl-3.5",
          "pr-3.5",
          readOnly
            ? "bg-slate-100 dark:bg-white/5 border-transparent text-slate-400 cursor-not-allowed"
            : "bg-white dark:bg-slate-900 border-slate-100 dark:border-white/5 text-slate-900 dark:text-white focus:border-blue-500/30 focus:bg-slate-50/50 dark:focus:bg-white/[0.08]",
        )}
      />
    </div>
  </div>
);

const ToggleField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5 group hover:border-rose-500/30 transition-all">
    <label className="text-[11px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">
      {label}
    </label>
    <button
      onClick={() => onChange(!value)}
      className={cn(
        "relative w-12 h-6 rounded-full transition-all duration-300 flex items-center px-1",
        value
          ? "bg-rose-600 shadow-lg shadow-rose-500/20"
          : "bg-slate-200 dark:bg-slate-800",
      )}
    >
      <motion.div
        animate={{ x: value ? 24 : 0 }}
        className="w-4 h-4 rounded-full bg-white shadow-sm"
      />
    </button>
  </div>
);

const SegmentedControl = ({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { label: string; value: any }[];
  value: any;
  onChange: (v: any) => void;
}) => (
  <div className="space-y-2">
    <label className="text-[11px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest px-1">
      {label}
    </label>
    <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-white/5">
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={String(opt.value)}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
              isActive
                ? "bg-rose-600 text-white dark:bg-rose-500 dark:text-white shadow-sm font-extrabold"
                : "text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 font-bold",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  </div>
);

const ResultRowMini = ({
  label,
  value,
  isAccent = false,
}: {
  label: string;
  value: number;
  isAccent?: boolean;
}) => (
  <div className="flex items-center justify-between py-3 transition-colors border-b border-slate-100 dark:border-white/5">
    <span
      className={cn(
        "text-[12px] font-black uppercase tracking-widest",
        isAccent
          ? "text-indigo-600 dark:text-indigo-400"
          : "text-slate-800 dark:text-slate-300",
      )}
    >
      {label}
    </span>
    <span
      className={cn(
        "text-[14px] font-mono font-black",
        isAccent
          ? "text-indigo-600 dark:text-indigo-400"
          : "text-rose-600 dark:text-rose-400",
      )}
    >
      {isAccent ? "+" : "-"}
      {formatCurrency(value)}
    </span>
  </div>
);

// --- Main App ---

const initialMonthsStatic: MonthInput[] = Array(12)
  .fill(0)
  .map((_, i) => ({
    baseGross: 0,
    shiftDays: 0,
    bonusDays: [2, 4, 6, 8, 10, 11].includes(i) ? (i === 11 ? 12 : 20) : 0,
    holidayWorkHours: 0,
    isMarried: false,
    spouseWorks: false,
    childCount: 0,
    bysDeduction: false,
    bysManuel: 0,
    holidayBonusGross: 0,
    hasShuttle: false,
    shuttleDays: 21,
    isDernekMember: false,
    isUnionMember: false,
    istanbulTazminati: 0,
    yemekGun: 21,
    familyAllowanceGrossOverride: 1500,
    childAllowanceGrossOverride: 500,
  }));

const safeLocalStorage = {
  getItem: (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn("localStorage is not available", e);
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("localStorage is not available", e);
    }
  },
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn("localStorage is not available", e);
    }
  },
};

const generateId = () => {
  try {
    return crypto.randomUUID();
  } catch (e) {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
};

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"calculator" | "history">(
    "calculator",
  );
  const [activeMonth, setActiveMonth] = useState<number>(() =>
    new Date().getMonth(),
  );
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(true);
  const [showSuggestionBox, setShowSuggestionBox] = useState(true);
  const [isMonthMenuOpen, setIsMonthMenuOpen] = useState(false);
  const [showAppliedFeedback, setShowAppliedFeedback] = useState(false);

  const [workerType, setWorkerType] = useState<"shift" | "non-shift" | "shift-non-union" | null>(null);

  const [monthsData, setMonthsData] = useState<MonthInput[]>(() => {
    const savedType = safeLocalStorage.getItem("salary_worker_type_v3");
    const savedData = safeLocalStorage.getItem("salary_calculator_data_v3");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.length === 12) {
          if (savedType === "shift" || savedType === "non-shift") {
            const defaults = (i: number) => [2, 4, 6, 8, 10, 11].includes(i) ? (i === 11 ? 12 : 20) : 0;
            return parsedData.map((m, i) => ({
              ...m,
              bonusDays: (savedType === "non-shift" && [2, 4, 6, 8, 10, 11].includes(i)) ? defaults(i) : m.bonusDays,
            }));
          }
          return parsedData;
        }
      } catch (e) {
        console.error("Error loading persisted data", e);
      }
    }
    
    // Auto-prepopulate correct defaults if loaded as shift or non-shift on first calculation
    if (savedType === "shift" || savedType === "non-shift") {
      return initialMonthsStatic.map((m, i) => {
        if ([2, 4, 6, 8, 10, 11].includes(i)) {
          return {
            ...m,
            bonusDays: i === 11 ? 12 : 20,
          };
        }
        return m;
      });
    }
    return initialMonthsStatic;
  });

  const [results, setResults] = useState<SalaryResult[]>(() => {
    const savedType = safeLocalStorage.getItem("salary_worker_type_v3") as "shift" | "non-shift" | null;
    const resolvedType = (savedType === "shift" || savedType === "non-shift") ? savedType : null;
    const savedData = safeLocalStorage.getItem("salary_calculator_data_v3");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (Array.isArray(parsedData) && parsedData.length === 12) {
          if (resolvedType === "shift") {
            const migrated = parsedData.map((m, i) => {
              if ([2, 4, 6, 8, 10, 11].includes(i)) {
                return {
                  ...m,
                  bonusDays: m.bonusDays === 0 ? (i === 11 ? 12 : 20) : m.bonusDays,
                };
              }
              return m;
            });
            return calculateYear(migrated, resolvedType);
          }
          return calculateYear(parsedData, resolvedType);
        }
      } catch (e) {
        console.error("Error loading persisted results", e);
      }
    }
    
    let initialData = initialMonthsStatic;
    if (resolvedType === "shift") {
      initialData = initialMonthsStatic.map((m, i) => {
        if ([2, 4, 6, 8, 10, 11].includes(i)) {
          return {
            ...m,
            bonusDays: i === 11 ? 12 : 20,
          };
        }
        return m;
      });
    }
    return calculateYear(initialData, resolvedType);
  });

  const [history, setHistory] = useState<CalculationHistory[]>(() => {
    const savedHistory = safeLocalStorage.getItem("salary_history_v3");
    if (savedHistory) {
      try {
        return JSON.parse(savedHistory);
      } catch (e) {
        console.error("Error loading history", e);
      }
    }
    return [];
  });

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const initialMonths = initialMonthsStatic;

  // Persist monthsData and workerType whenever they change
  useEffect(() => {
    safeLocalStorage.setItem(
      "salary_calculator_data_v3",
      JSON.stringify(monthsData),
    );
    if (workerType) {
      safeLocalStorage.setItem("salary_worker_type_v3", workerType);
    } else {
      safeLocalStorage.removeItem("salary_worker_type_v3");
    }
  }, [monthsData, workerType]);

  // Persist theme whenever it changes
  useEffect(() => {
    safeLocalStorage.setItem("salary_theme_v3", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    (window as any).MaasAppInitialized = true;
    const savedType = safeLocalStorage.getItem("salary_worker_type_v3");
    if (savedType) {
      setWorkerType(savedType as any);
    }
  }, []);

  const shortMonths = [
    "Ocak",
    "Şubat",
    "Mart",
    "Nisan",
    "Mayıs",
    "Haziran",
    "Temmuz",
    "Ağustos",
    "Eylül",
    "Ekim",
    "Kasım",
    "Aralık",
  ];

  const activeResult = results[activeMonth];
  const activeYemekDays =
    (monthsData[activeMonth]?.shiftDays || 0) +
    (monthsData[activeMonth]?.holidayWorkHours || 0);
  const activeYemekAmount = activeYemekDays * 550;

  const chartData = useMemo(() => {
    return results.map((r, i) => {
      const mInput = monthsData[i];
      const mealDays =
        (mInput?.shiftDays || 0) + (mInput?.holidayWorkHours || 0);
      const mealValue = mInput && mInput.baseGross > 0 ? mealDays * 550 : 0;
      return {
        name: shortMonths[i],
        net: r.netPaid,
        yemek: mealValue,
        toplam: r.netPaid + mealValue,
      };
    });
  }, [results, monthsData]);

  const handleWorkerTypeSelect = (type: "shift" | "non-shift" | "shift-non-union") => {
    setWorkerType(type);
    setShowPrivacyNotice(true);
    setShowSuggestionBox(true);

    if (type === "non-shift") {
      setMonthsData((prev) => {
        const nw = prev.map((m, i) => ({
          ...m,
          hasShuttle: false,
          shiftDays: 0,
          bonusDays: [2, 4, 6, 8, 10, 11].includes(i) ? (i === 11 ? 12 : 20) : 0,
          workerType: type,
        }));
        setResults(calculateYear(nw, type));
        return nw;
      });
    } else {
      setMonthsData((prev) => {
        const nw = prev.map((m, i) => {
          let defaultBonus = m.bonusDays;
          if ([2, 4, 6, 8, 10, 11].includes(i)) {
            defaultBonus = i === 11 ? 12 : 20;
          } else {
            defaultBonus = 0;
          }
          let isUnion = m.isUnionMember;
          if (type === 'shift-non-union') {
              isUnion = false;
          }
          return {
            ...m,
            bonusDays: defaultBonus,
            isUnionMember: isUnion,
            workerType: type,
          };
        });
        setResults(calculateYear(nw, type));
        return nw;
      });
    }
  };

  const updateMonth = (index: number, field: keyof MonthInput, val: any) => {
    setMonthsData((prev) => {
      const nw = [...prev];
      nw[index] = {
        ...nw[index],
        [field]: val,
        workerType: workerType || undefined,
      };
      setResults(calculateYear(nw, workerType));
      return nw;
    });
  };

  const saveToHistory = () => {
    if (!activeResult || activeResult.totalGross === 0) return;
    const newEntry: CalculationHistory = {
      ...activeResult,
      id: generateId(),
      date: `${shortMonths[activeMonth]} 2026`,
      input: { ...monthsData[activeMonth] },
    };
    const updated = [newEntry, ...history];
    setHistory(updated);
    safeLocalStorage.setItem("salary_history_v3", JSON.stringify(updated));
    setActiveTab("history");
  };

  const deleteHistory = (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    safeLocalStorage.setItem("salary_history_v3", JSON.stringify(updated));
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();

      doc.setFontSize(16);
      doc.text("2026 Maas Hesaplama Ozeti", 14, 15);

      const cleanCurrency = (val: number) => {
        return formatCurrency(val).replace("₺", "").trim() + " TL";
      };

      const tableData = results.map((r, i) => [
        shortMonths[i],
        cleanCurrency(r.totalGross),
        cleanCurrency(r.sgkEmployee + r.unemploymentEmployee),
        cleanCurrency(r.finalIncomeTax),
        cleanCurrency(r.finalStampTax),
        cleanCurrency(r.netPaid),
      ]);

      autoTable(doc, {
        startY: 25,
        head: [["Ay", "Brut", "SGK", "GV", "DV", "Net"]],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { halign: "right" },
          2: { halign: "right" },
          3: { halign: "right" },
          4: { halign: "right" },
          5: { halign: "right" },
        },
      });

      const totalNet = results.reduce((acc, r) => acc + r.netPaid, 0);
      const totalYemek = results.reduce((acc, r, i) => {
        const mInput = monthsData[i];
        if (!mInput || mInput.baseGross === 0) return acc;
        return (
          acc + ((mInput.shiftDays || 0) + (mInput.holidayWorkHours || 0)) * 550
        );
      }, 0);
      const totalPackage = totalNet + totalYemek;
      const avgNet = totalNet / 12;
      const avgPackage = totalPackage / 12;

      const lastTable = (doc as any).lastAutoTable;
      const finalY = lastTable ? lastTable.finalY : 150;

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`Toplam Net Maas: ${cleanCurrency(totalNet)}`, 14, finalY + 10);
      doc.text(
        `Toplam Yemek Ucreti: ${cleanCurrency(totalYemek)}`,
        14,
        finalY + 18,
      );
      doc.text(
        `Toplam Net + Yemek: ${cleanCurrency(totalPackage)}`,
        14,
        finalY + 26,
      );
      doc.text(
        `Ortalama Aylik Net Maas: ${cleanCurrency(avgNet)}`,
        14,
        finalY + 34,
      );
      doc.text(
        `Ortalama Aylik Toplam Paket: ${cleanCurrency(avgPackage)}`,
        14,
        finalY + 42,
      );

      doc.save("maas-analizi-2026.pdf");
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("PDF oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  const applyToAllMonths = () => {
    const activeData = monthsData[activeMonth];
    setMonthsData((prev) => {
      const nw = prev.map((m, i) => {
        let targetBonusDays = activeData.bonusDays;
        if (workerType === "shift" || workerType === "non-shift") {
          if (activeData.bonusDays === 20 || activeData.bonusDays === 12 || activeData.bonusDays === 0) {
            if ([2, 4, 6, 8, 10, 11].includes(i)) {
              targetBonusDays = i === 11 ? 12 : 20;
            } else {
              targetBonusDays = 0;
            }
          }
        } else {
          targetBonusDays = 0;
        }

        return {
          ...m,
          baseGross: activeData.baseGross,
          shiftDays: activeData.shiftDays,
          bonusDays: targetBonusDays,
          holidayWorkHours: activeData.holidayWorkHours,
          isMarried: activeData.isMarried,
          spouseWorks: activeData.spouseWorks,
          childCount: activeData.childCount,
          bysDeduction: activeData.bysDeduction,
          bysManuel: activeData.bysManuel,
          holidayBonusGross: activeData.holidayBonusGross,
          hasHolidayBonus: activeData.hasHolidayBonus,
          hasShuttle: activeData.hasShuttle,
          shuttleDays: activeData.shuttleDays,
          isDernekMember: activeData.isDernekMember,
          isUnionMember: activeData.isUnionMember,
          istanbulTazminati: activeData.istanbulTazminati,
          yemekGun: activeData.yemekGun,
          familyAllowanceGrossOverride: activeData.familyAllowanceGrossOverride,
          childAllowanceGrossOverride: activeData.childAllowanceGrossOverride,
        };
      });
      setResults(calculateYear(nw, workerType));
      return nw;
    });
    
    // Trigger feedback effect
    setShowAppliedFeedback(true);
    setTimeout(() => {
      setShowAppliedFeedback(false);
    }, 2000);
  };

  const clearActiveMonth = () => {
    setMonthsData((prev) => {
      const nw = [...prev];
      const defaultBonus = (workerType === "shift" || workerType === "non-shift") && [2, 4, 6, 8, 10, 11].includes(activeMonth) ? (activeMonth === 11 ? 12 : 20) : 0;
      nw[activeMonth] = {
        baseGross: 0,
        shiftDays: 0,
        bonusDays: defaultBonus,
        holidayWorkHours: 0,
        isMarried: false,
        spouseWorks: false,
        childCount: 0,
        bysDeduction: false,
        bysManuel: 0,
        holidayBonusGross: 0,
        hasShuttle: false,
        shuttleDays: 21,
        isDernekMember: false,
        isUnionMember: false,
        istanbulTazminati: 0,
        yemekGun: 21,
      };
      setResults(calculateYear(nw, workerType));
      return nw;
    });
  };

  const clearAllMonths = () => {
    safeLocalStorage.removeItem("salary_calculator_data_v3");
    const nw: MonthInput[] = Array(12)
      .fill(0)
      .map((_, i) => ({
        baseGross: 0,
        shiftDays: 0,
        bonusDays: (workerType === "shift" || workerType === "non-shift") && [2, 4, 6, 8, 10, 11].includes(i) ? (i === 11 ? 12 : 20) : 0,
        holidayWorkHours: 0,
        isMarried: false,
        spouseWorks: false,
        childCount: 0,
        bysDeduction: false,
        bysManuel: 0,
        holidayBonusGross: 0,
        hasHolidayBonus: false,
        hasShuttle: false,
        shuttleDays: 21,
        isDernekMember: false,
        isUnionMember: false,
        istanbulTazminati: 0,
        yemekGun: 21,
        familyAllowanceGrossOverride: 1500,
        childAllowanceGrossOverride: 500,
      }));
    setMonthsData(nw);
    setResults(calculateYear(nw, workerType));
    setActiveMonth(0);
  };

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col font-sans selection:bg-blue-200 transition-colors duration-500 relative bg-mesh",
        isDarkMode && "dark",
      )}
    >
      {/* Soft Yellow Glow */}
      {!isDarkMode && (
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at center, #FFF991 0%, transparent 70%)`,
            opacity: 0.6,
            mixBlendMode: "multiply",
          }}
        />
      )}

      {/* Modern Global Header */}
      <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-200 dark:border-white/5 py-4 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Calculator size={20} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-display font-black text-slate-950 dark:text-white uppercase tracking-tighter leading-none">
              MAAŞ ANALİZİ
            </h1>
            <span className="text-[11px] text-slate-600 dark:text-slate-400 font-black uppercase tracking-[0.3em] mt-1.5 hidden md:block leading-none">
              AKILLI BORDRO HESAPLAYICI
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <DateTimeWeatherWidget />
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white dark:bg-white/5 text-slate-500 dark:text-white/50 border border-slate-200 dark:border-white/10 hover:border-blue-500/50 transition-all shadow-sm"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {activeTab === "calculator" && workerType !== null && (
            <button
              onClick={() => setWorkerType(null)}
              className="px-4 md:px-6 py-2.5 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 text-[12px] font-black rounded-2xl shadow-sm active:scale-95 transition-all flex items-center gap-2.5 uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/10"
            >
              <ArrowLeft size={16} />{" "}
              <span className="hidden md:inline">MODEL</span> DEĞİŞTİR
            </button>
          )}
          <button
            onClick={() =>
              setActiveTab(
                activeTab === "calculator" ? "history" : "calculator",
              )
            }
            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-[12px] font-black rounded-2xl shadow-lg active:scale-95 transition-all flex items-center gap-2.5 uppercase tracking-widest"
          >
            {activeTab === "calculator" ? (
              <>
                <History size={16} /> ARŞİV
              </>
            ) : (
              <>
                <Calculator size={16} /> GERİ DÖN
              </>
            )}
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1550px] mx-auto p-2 lg:p-4 relative z-10 flex flex-col justify-center">
        <div className="glass-panel rounded-[2rem] shadow-[0_24px_80px_-15px_rgba(0,0,0,0.06)] dark:shadow-[0_24px_80px_-15px_rgba(0,0,0,0.3)] overflow-hidden lg:h-[calc(100vh-130px)] lg:max-h-[820px] lg:min-h-[640px] flex flex-col">
          <AnimatePresence mode="wait">
            {activeTab === "calculator" && workerType === null && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex-1 flex flex-col items-center justify-center p-8 h-[80vh]"
              >
                <div className="w-24 h-24 mb-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-blue-500/30">
                  <Calculator size={48} strokeWidth={2} />
                </div>
                <h2 className="text-3xl md:text-5xl font-display font-black text-slate-900 dark:text-white text-center mb-6 tracking-tight">
                  Çalışma Modelinizi Seçin
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-center max-w-lg mb-16 text-lg">
                  Doğru bordro analizi için vardiyalı çalışıp çalışmadığınızı
                  belirtmeniz gerekmektedir.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                  <button
                    onClick={() => handleWorkerTypeSelect("shift")}
                    className="group flex flex-col items-center justify-center p-10 w-72 rounded-[3rem] bg-white dark:bg-slate-800/50 border-2 border-transparent hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-slate-800 transition-all duration-500 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl hover:shadow-blue-500/10 relative overflow-hidden"
                  >
                    <div className="w-20 h-20 rounded-[2rem] bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                      <History size={40} strokeWidth={2} />
                    </div>
                    <span className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-3">
                      Vardiyalı (Sendikalı)
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 text-center font-bold tracking-[0.2em] uppercase">
                      7/24 DÖNÜŞÜMLÜ
                    </span>
                  </button>

                  <button
                    onClick={() => handleWorkerTypeSelect("shift-non-union")}
                    className="group flex flex-col items-center justify-center p-10 w-72 rounded-[3rem] bg-white dark:bg-slate-800/50 border-2 border-transparent hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-slate-800 transition-all duration-500 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl hover:shadow-emerald-500/10 relative overflow-hidden"
                  >
                    <div className="w-20 h-20 rounded-[2rem] bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                      <Shield size={40} strokeWidth={2} />
                    </div>
                    <span className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-3">
                      Vardiyalı (Vardiyalı Mühendis)
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 text-center font-bold tracking-[0.2em] uppercase">
                      DÖNÜŞÜMLÜ
                    </span>
                  </button>

                  <button
                    onClick={() => handleWorkerTypeSelect("non-shift")}
                    className="group flex flex-col items-center justify-center p-10 w-72 rounded-[3rem] bg-white dark:bg-slate-800/50 border-2 border-transparent hover:border-indigo-500/50 hover:bg-indigo-50/50 dark:hover:bg-slate-800 transition-all duration-500 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl hover:shadow-indigo-500/10 relative overflow-hidden"
                  >
                    <div className="w-20 h-20 rounded-[2rem] bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                      <Calendar size={40} strokeWidth={2} />
                    </div>
                    <span className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-3">
                      Vardiyasız
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 text-center font-bold tracking-[0.2em] uppercase">
                      NORMAL MESAİ
                    </span>
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === "calculator" && workerType !== null && (
              <motion.div
                key="calc"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden"
              >
                {/* LEFT: Input Form Area */}
                <div className="w-full lg:w-[325px] shrink-0 p-4 overflow-y-auto space-y-3.5 border-r border-slate-200/60 dark:border-white/5 bg-white dark:bg-slate-900/45 lg:order-none order-2">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                    <h3 className="text-[12px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] leading-none">
                      VERİ GİRİŞ ALANI
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={clearActiveMonth}
                        className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Verileri Sıfırla"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-5">
                      <InputField
                        label="BRÜT MAAŞ"
                        value={monthsData[activeMonth].baseGross}
                        onChange={(v) =>
                          updateMonth(activeMonth, "baseGross", v)
                        }
                      />

                      {(workerType === "shift" || workerType === "shift-non-union") && (
                        <div className="grid grid-cols-2 gap-4">
                          <InputField
                            label="VARDİYA GÜNÜ"
                            value={monthsData[activeMonth].shiftDays}
                            onChange={(v) => updateMonth(activeMonth, "shiftDays", v)}
                            prefix=""
                            suffix="GÜN"
                          />
                          {workerType === "shift" && (
                            <InputField
                              label={[2, 4, 6, 8, 10, 11].includes(activeMonth) ? "İKRAMİYE GÜN (BONUS AYI)" : "İKRAMİYE GÜN"}
                              value={monthsData[activeMonth].bonusDays}
                              onChange={(v) => updateMonth(activeMonth, "bonusDays", v)}
                              prefix=""
                              suffix="GÜN"
                            />
                          )}
                        </div>
                      )}
                      
                      {workerType === "non-shift" && (
                        <div className="grid grid-cols-1 gap-4">
                          <InputField
                            label={[2, 4, 6, 8, 10, 11].includes(activeMonth) ? "İKRAMİYE GÜN (BONUS AYI)" : "İKRAMİYE GÜN"}
                            value={monthsData[activeMonth].bonusDays}
                            onChange={(v) => updateMonth(activeMonth, "bonusDays", v)}
                            prefix=""
                            suffix="GÜN"
                            isHighlight={[2, 4, 6, 8, 10, 11].includes(activeMonth)}
                          />
                          {[2, 4, 6, 8, 10, 11].includes(activeMonth) && (
                            <div className="text-[10px] text-amber-700 dark:text-amber-400 font-bold px-1 mt-1">
                              ₺ Bu ay ikramiye alacaksın.
                            </div>
                          )}
                        </div>
                      )}

                      {workerType === "shift" && (
                        <>
                          <div className="p-3.5 bg-rose-500/[0.03] dark:bg-rose-500/[0.02] rounded-2xl border border-rose-500/10 dark:border-white/5 text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed flex gap-2">
                            <span className="text-xs shrink-0 mt-0.5">⚠️</span>
                            <span>
                              <strong>Vardiya & Bayram Notu:</strong> Resmi
                              bayram günlerinde çalıştıysanız, bu günleri{" "}
                              <strong>"Bayram Mesai Günü"</strong> olarak ayrıca
                              belirtin ve normal <strong>"Vardiya Günü"</strong>{" "}
                              sayısından düşerek giriş yapın.
                            </span>
                          </div>

                          <div className="grid grid-cols-1 gap-4">
                            <InputField
                              label="BAYRAM MESAİ GÜNÜ"
                              value={monthsData[activeMonth].holidayWorkHours}
                              onChange={(v) =>
                                updateMonth(activeMonth, "holidayWorkHours", v)
                              }
                              prefix=""
                              suffix="GÜN"
                            />
                          </div>

                          <div className="grid grid-cols-1 gap-4">
                            <SegmentedControl
                              label="BAYRAM PARASI"
                              options={[
                                { label: "EVET", value: true },
                                { label: "HAYIR", value: false },
                              ]}
                              value={
                                monthsData[activeMonth].hasHolidayBonus || false
                              }
                              onChange={(v) =>
                                updateMonth(activeMonth, "hasHolidayBonus", v)
                              }
                            />
                          </div>
                        </>
                      )}


                      {workerType === "shift" && (
                        <div className="grid grid-cols-1 gap-4">
                          <SegmentedControl
                            label="SERVİS KULLANIYOR MU?"
                            options={[
                              { label: "EVET", value: true },
                              { label: "HAYIR", value: false },
                            ]}
                            value={monthsData[activeMonth].hasShuttle}
                            onChange={(v) =>
                              updateMonth(activeMonth, "hasShuttle", v)
                            }
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <SegmentedControl
                          label="MEDENİ DURUM"
                          options={[
                            { label: "EVLİ", value: true },
                            { label: "BEKAR", value: false },
                          ]}
                          value={monthsData[activeMonth].isMarried}
                          onChange={(v) =>
                            updateMonth(activeMonth, "isMarried", v)
                          }
                        />
                        <div
                          className={cn(
                            "transition-opacity",
                            !monthsData[activeMonth].isMarried &&
                              "opacity-30 pointer-events-none",
                          )}
                        >
                          <SegmentedControl
                            label="EŞ DURUMU"
                            options={[
                              { label: "ÇALIŞIYOR", value: true },
                              { label: "ÇALIŞMIYOR", value: false },
                            ]}
                            value={monthsData[activeMonth].spouseWorks}
                            onChange={(v) =>
                              updateMonth(activeMonth, "spouseWorks", v)
                            }
                          />
                        </div>
                      </div>

                      <div
                        className={cn(
                          "transition-opacity",
                          !monthsData[activeMonth].isMarried &&
                            "opacity-30 pointer-events-none",
                        )}
                      >
                        <SegmentedControl
                          label="ÇOCUK SAYISI"
                          options={[
                            { label: "YOK", value: 0 },
                            { label: "1", value: 1 },
                            { label: "2", value: 2 },
                            { label: "3", value: 3 },
                            { label: "4+", value: 4 },
                          ]}
                          value={monthsData[activeMonth].childCount}
                          onChange={(v) =>
                            updateMonth(activeMonth, "childCount", v)
                          }
                        />

                             {(workerType === "shift" || workerType === "non-shift") && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ToggleField
                              label="TEKNİKER DERNEK ÜYE MİSİN ?"
                              value={monthsData[activeMonth].isDernekMember}
                              onChange={(v) =>
                                updateMonth(activeMonth, "isDernekMember", v)
                              }
                            />
                            <ToggleField
                              label="SENDİKA ÜYELİĞİ"
                              value={monthsData[activeMonth].isUnionMember}
                              onChange={(v) =>
                                updateMonth(activeMonth, "isUnionMember", v)
                              }
                            />
                          </div>
                        )}

                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <ToggleField
                              label="BYS KESİNTİSİ"
                              value={monthsData[activeMonth].bysDeduction}
                              onChange={(v) =>
                                updateMonth(activeMonth, "bysDeduction", v)
                              }
                            />
                          </div>
                          <div
                            className={cn(
                              "w-32 transition-opacity",
                              !monthsData[activeMonth].bysDeduction &&
                                "opacity-30 pointer-events-none",
                            )}
                          >
                            <InputField
                              label="TUTAR"
                              value={monthsData[activeMonth].bysManuel}
                              onChange={(v) =>
                                updateMonth(activeMonth, "bysManuel", v)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* MIDDLE: Results & Net Payment */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-slate-950/45 lg:order-none order-3">
                  {workerType === "shift" &&
                    [2, 4, 6, 8, 10, 11].includes(activeMonth) && (
                      <div className="bg-gradient-to-r from-orange-500/[0.08] to-amber-500/[0.04] dark:from-orange-500/[0.06] dark:to-transparent border border-orange-500/20 dark:border-orange-500/30 rounded-2xl p-3 flex items-center gap-3 shadow-sm">
                        <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                          <Gift size={16} className="animate-pulse" />
                        </div>
                        <span className="text-[11px] font-black text-orange-850 dark:text-orange-450 uppercase tracking-widest leading-none flex items-center gap-1.5">
                          BU AY İKRAMİYE ALACAKSIN 💰
                        </span>
                      </div>
                    )}

                  <div className="max-w-[580px] mx-auto w-full bg-slate-900 dark:bg-slate-800 rounded-[1.5rem] p-4.5 shadow-2xl relative overflow-hidden group border border-slate-700 dark:border-white/10">
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-transparent to-emerald-500/10 opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
 
                    <div className="grid grid-cols-1 gap-4 relative z-10 items-stretch justify-items-center">
                      {/* Sol Taraf: Bankaya Yatan Net Maaş (Kare & Göz Alıcı Modern Tasarım) */}
                      <div className="bg-slate-950/40 dark:bg-black/25 border border-slate-700/50 dark:border-white/[0.04] p-4 rounded-xl flex flex-col justify-between text-center aspect-video w-full max-w-[280px] hover:border-emerald-500/20 transition-all duration-300 relative group/card overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
                        
                        <div className="w-full flex justify-between items-center">
                          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.12em] filter drop-shadow-[0_2px_8px_rgba(16,185,129,0.3)]">
                            NET MAAŞ (BANKA)
                          </span>
                          <button
                            onClick={() =>
                              handleCopy(
                                "net",
                                formatCurrency(activeResult.netPaid),
                              )
                            }
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] uppercase font-black tracking-widest rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 active:scale-95 transition-all cursor-pointer"
                            title="Net maaşı kopyala"
                          >
                            {copiedKey === "net" ? (
                              <Check size={8} className="text-emerald-400" />
                            ) : (
                              <Copy size={8} className="text-emerald-400" />
                            )}
                            {copiedKey === "net" ? "Kopyalandı" : "Kopyala"}
                          </button>
                        </div>
 
                        <div className="my-auto py-2">
                          <span className="text-2xl sm:text-3xl font-display font-black text-emerald-400 tracking-tighter block filter drop-shadow-[0_4px_12px_rgba(16,185,129,0.2)]">
                            {formatCurrency(activeResult.netPaid)}
                          </span>
                        </div>
 
                        <div className="w-full">
                          <p className="text-[9.5px] text-slate-400 dark:text-slate-300 font-medium leading-normal max-w-[220px] mx-auto">
                            Vergiler ve SGK ödemeleri düşülmüş banka net tutarıdır.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Alt Özet Kutuları */}
                    <div className="flex justify-center gap-3.5 flex-wrap mt-5 pt-4 border-t border-slate-700/60 dark:border-white/10 relative z-10">
                      <div className="bg-white/5 backdrop-blur-md px-4 py-2 rounded-xl border border-white/5 min-w-[110px] text-center">
                        <span className="text-[8px] text-white/40 block uppercase font-black tracking-widest mb-0.5">
                          Brüt Toplam
                        </span>
                        <span className="text-sm text-white font-display font-black">
                          {formatCurrency(activeResult.totalGross)}
                        </span>
                      </div>
                      <div className="bg-white/5 backdrop-blur-md px-4 py-2 rounded-xl border border-white/5 min-w-[110px] text-center">
                        <span className="text-[8px] text-white/40 block uppercase font-black tracking-widest mb-0.5">
                          Vergi Dilimi
                        </span>
                        <span className="text-sm text-rose-300 font-display font-black">
                          %{activeResult.taxBracket}
                        </span>
                      </div>
                      <div className="bg-white/5 backdrop-blur-md px-4 py-2 rounded-xl border border-white/5 min-w-[110px] text-center">
                        <span className="text-[8px] text-white/40 block uppercase font-black tracking-widest mb-0.5">
                          Toplam Yemek
                        </span>
                        <span className="text-sm text-emerald-400 font-display font-black">
                          {formatCurrency(activeYemekAmount)}
                        </span>
                      </div>
                    </div>


                  </div>

                  <div className="hidden">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-600">
                        <Info size={20} />
                      </div>
                      <h4 className="text-[12px] font-black text-slate-900 dark:text-white uppercase tracking-widest">
                        Hesaplama Detayları & Yorumum
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[13px]">
                      <div className="space-y-4">
                        <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                          <h5 className="font-black text-blue-600 dark:text-blue-400 uppercase text-[10px] tracking-widest mb-2">
                            Vardiya Primi Hesabı
                          </h5>
                          <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                            Brüt ücretinizin saatlik karşılığı üzerinden{" "}
                            <span className="text-slate-900 dark:text-white font-bold">
                              %24.66
                            </span>{" "}
                            oranında prim hesaplanır.
                            <br />
                            <br />
                            187.5 saatlik vardiya mesaisi{" "}
                            <span className="text-slate-900 dark:text-white font-bold">
                              25 vardiya gününe
                            </span>{" "}
                            denk gelmektedir.
                          </p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                          <h5 className="font-black text-indigo-600 dark:text-indigo-400 uppercase text-[10px] tracking-widest mb-2">
                            Vasıta (Yol) Ücreti
                          </h5>
                          <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                            Günlük brüt{" "}
                            <span className="text-slate-900 dark:text-white font-bold">
                              303.39 TL
                            </span>{" "}
                            olarak tanımlanmıştır. Çalıştığınız gün sayısı ile
                            çarpılarak brüt toplama eklenir.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-5 bg-blue-600 text-white rounded-[2rem] shadow-xl shadow-blue-500/20">
                          <h5 className="font-black uppercase text-[10px] tracking-[0.2em] mb-3 opacity-70 italic">
                            Brüt Veri Yorumu
                          </h5>
                          <p className="leading-relaxed font-bold italic text-sm">
                            "Verdiğiniz 67.215 TL brüt ana maaştır. Vardiya ve
                            Vasıta gibi kalemler bu rakamın üzerine eklenerek
                            'Toplam Brüt'ü (87.401 TL) oluşturur.
                            <br />
                            <br />
                            Bu seviyedeki bir brüt toplamda, SGK ve İşsizlik
                            kesintileri (~%15) sonrası kalan rakam üzerinden
                            Gelir Vergisi hesaplanır. Yüksek brüt nedeniyle
                            vergi dilimlerine (%20 ve %27) daha hızlı
                            girersiniz."
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-6">
                    {/* Area Chart */}
                    <div className="bg-slate-50/50 dark:bg-white/5 backdrop-blur-md border border-slate-200/60 dark:border-white/10 rounded-2xl p-4 shadow-sm group hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6.5 h-6.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                          <TrendingUp size={13} />
                        </div>
                        <h3 className="font-black text-slate-900 dark:text-white uppercase text-[10px] xl:text-[10.5px] tracking-[0.2em]">
                          Yıllık Seyir
                        </h3>
                      </div>
                      <div className="h-36 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient
                                id="colorNet"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="5%"
                                  stopColor="#10b981"
                                  stopOpacity={0.3}
                                />
                                <stop
                                  offset="95%"
                                  stopColor="#10b981"
                                  stopOpacity={0}
                                />
                              </linearGradient>
                              <linearGradient
                                id="colorToplam"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="5%"
                                  stopColor="#6366f1"
                                  stopOpacity={0.3}
                                />
                                <stop
                                  offset="95%"
                                  stopColor="#6366f1"
                                  stopOpacity={0}
                                />
                              </linearGradient>
                              <linearGradient
                                id="colorYemek"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="5%"
                                  stopColor="#f59e0b"
                                  stopOpacity={0.3}
                                />
                                <stop
                                  offset="95%"
                                  stopColor="#f59e0b"
                                  stopOpacity={0}
                                />
                              </linearGradient>
                            </defs>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              stroke={
                                isDarkMode
                                  ? "rgba(255,255,255,0.05)"
                                  : "rgba(0,0,0,0.08)"
                              }
                            />
                            <XAxis
                              dataKey="name"
                              axisLine={false}
                              tickLine={false}
                              tick={{
                                fontSize: 10,
                                fontWeight: 800,
                                fill: isDarkMode ? "#94a3b8" : "#64748b",
                              }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: isDarkMode
                                  ? "#0f172a"
                                  : "#fff",
                                border: isDarkMode
                                  ? "1px solid rgba(255,255,255,0.05)"
                                  : "none",
                                borderRadius: "16px",
                                boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                                fontSize: "12px",
                                fontWeight: "900",
                                padding: "12px",
                              }}
                              cursor={{ stroke: "#10b981", strokeWidth: 1.5 }}
                              formatter={(value: any, name: any) => {
                                if (name === "net")
                                  return [
                                    formatCurrency(Number(value)),
                                    "Net Maaş (Banka)",
                                  ];
                                if (name === "toplam")
                                  return [
                                    formatCurrency(Number(value)),
                                    "Net + Yemek (Toplam Paket)",
                                  ];
                                if (name === "yemek")
                                  return [
                                    formatCurrency(Number(value)),
                                    "Yemek Ücreti",
                                  ];
                                return [
                                  formatCurrency(Number(value || 0)),
                                  name,
                                ];
                              }}
                            />
                            <Area
                              type="monotone"
                              dataKey="toplam"
                              name="toplam"
                              stroke="#6366f1"
                              strokeWidth={3}
                              fillOpacity={1}
                              fill="url(#colorToplam)"
                            />
                            <Area
                              type="monotone"
                              dataKey="net"
                              name="net"
                              stroke="#10b981"
                              strokeWidth={2.5}
                              fillOpacity={1}
                              fill="url(#colorNet)"
                            />
                            <Area
                              type="monotone"
                              dataKey="yemek"
                              name="yemek"
                              stroke="#f59e0b"
                              strokeWidth={1.5}
                              strokeDasharray="4 4"
                              fillOpacity={1}
                              fill="url(#colorYemek)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Pie Chart - More Prominent at the Bottom */}
                    <div className="bg-slate-50/50 dark:bg-white/5 backdrop-blur-md border border-slate-200/60 dark:border-white/10 rounded-2xl p-4 shadow-sm group hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6.5 h-6.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
                          <ChartBar size={13} />
                        </div>
                        <div className="flex flex-col">
                          <h3 className="font-black text-slate-900 dark:text-white uppercase text-[10px] tracking-[0.2em] leading-none mb-0.5">
                            Maaş Dağılım Analizi
                          </h3>
                          <span className="text-[8.5px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
                            {shortMonths[activeMonth]} 2026 BORDRO DETAYI
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col xl:flex-row items-center justify-around gap-4">
                        <div className="h-44 w-full max-w-[220px] flex items-center justify-center relative shrink-0">
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                              TOPLAM BRÜT
                            </span>
                            <span className="text-lg font-display font-black text-slate-900 dark:text-white mt-1 leading-none">
                              {
                                formatCurrency(activeResult.totalGross).split(
                                  ",",
                                )[0]
                              }
                            </span>
                          </div>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  {
                                    name: "NET MAAŞ",
                                    value: activeResult.netPaid,
                                  },
                                  {
                                    name: "YEMEK ÜCRETİ",
                                    value: activeYemekAmount,
                                  },
                                  {
                                    name: "VERGİ KESİNTİSİ",
                                    value:
                                      activeResult.finalIncomeTax +
                                      activeResult.finalStampTax,
                                  },
                                  {
                                    name: "SGK ÖDEMELERİ",
                                    value:
                                      activeResult.sgkEmployee +
                                      activeResult.unemploymentEmployee,
                                  },
                                ]}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={80}
                                paddingAngle={6}
                                dataKey="value"
                              >
                                <Cell fill="#3b82f6" stroke="transparent" />
                                <Cell fill="#10b981" stroke="transparent" />
                                <Cell fill="#f43f5e" stroke="transparent" />
                                <Cell fill="#f59e0b" stroke="transparent" />
                              </Pie>
                              <Tooltip
                                formatter={(value: number) =>
                                  formatCurrency(value)
                                }
                                contentStyle={{
                                  backgroundColor: isDarkMode
                                    ? "#1e293b"
                                    : "#fff",
                                  border: "none",
                                  borderRadius: "16px",
                                  boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                                  fontSize: "12px",
                                  fontWeight: "900",
                                  padding: "12px",
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="flex flex-col sm:flex-row xl:flex-col gap-2 flex-1 w-full max-w-2xl">
                          <div className="flex-1 flex items-center justify-between p-2 px-3 bg-blue-500/5 dark:bg-blue-500/10 rounded-xl border border-blue-500/10">
                            <div className="flex items-center gap-2.5">
                              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                              <div className="flex flex-col">
                                <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">
                                  Net Ödeme
                                </span>
                                <span className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">
                                  Bankaya Yatan
                                </span>
                              </div>
                            </div>
                            <span className="text-xs xl:text-sm font-mono font-black text-blue-600 dark:text-blue-400">
                              {formatCurrency(activeResult.netPaid)}
                            </span>
                          </div>

                          <div className="flex-1 flex items-center justify-between p-2 px-3 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-xl border border-emerald-500/10">
                            <div className="flex items-center gap-2.5">
                              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                              <div className="flex flex-col">
                                <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">
                                  Yemek Ücreti
                                </span>
                                <span className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">
                                  Metropol Kart
                                </span>
                              </div>
                            </div>
                            <span className="text-xs xl:text-sm font-mono font-black text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(activeYemekAmount)}
                            </span>
                          </div>

                          <div className="flex-1 flex items-center justify-between p-2 px-3 bg-rose-500/5 dark:bg-rose-500/10 rounded-xl border border-rose-500/10">
                            <div className="flex items-center gap-2.5">
                              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                              <div className="flex flex-col">
                                <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">
                                  Toplam Vergi
                                </span>
                                <span className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">
                                  Gelir + Damga
                                </span>
                              </div>
                            </div>
                            <span className="text-xs xl:text-sm font-mono font-black text-rose-600 dark:text-rose-400">
                              {formatCurrency(
                                activeResult.finalIncomeTax +
                                  activeResult.finalStampTax,
                              )}
                            </span>
                          </div>

                          <div className="flex-1 flex items-center justify-between p-2 px-3 bg-amber-500/5 dark:bg-amber-500/10 rounded-xl border border-amber-500/10">
                            <div className="flex items-center gap-2.5">
                              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                              <div className="flex flex-col">
                                <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">
                                  SGK Primi
                                </span>
                                <span className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">
                                  Çalışan Payı
                                </span>
                              </div>
                            </div>
                            <span className="text-xs xl:text-sm font-mono font-black text-amber-600 dark:text-amber-550">
                              {formatCurrency(
                                activeResult.sgkEmployee +
                                  activeResult.unemploymentEmployee,
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center mt-4">
                    <button
                      onClick={exportToPDF}
                      className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[9px] font-black uppercase tracking-widest rounded-lg transition-all shadow-md active:scale-95 flex items-center gap-1.5 group"
                    >
                      <Download
                        size={11}
                        className="group-hover:translate-y-0.5 transition-transform"
                      />
                      PDF DÖNÜŞTÜR
                    </button>
                  </div>
                </div>

                {/* RIGHT: Month Navigation Grid & Info */}
                <div className="w-full lg:w-[340px] bg-slate-100/40 dark:bg-slate-900/45 border-b lg:border-b-0 lg:border-l border-slate-200/60 dark:border-white/5 p-4 lg:p-5 space-y-4 shrink-0 overflow-y-auto lg:order-last order-first">
                  <div className="flex items-center justify-between gap-1.5 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Calendar size={18} className="text-blue-500 shrink-0" />
                      <h3 className="text-[11px] sm:text-[12px] font-black text-slate-900 dark:text-slate-200 uppercase tracking-widest leading-none">
                        BORDRO DÖNEMİ
                      </h3>
                    </div>
                    
                    <button
                      onClick={applyToAllMonths}
                      className={cn(
                        "px-2 py-1 rounded-lg text-[8.5px] font-black uppercase tracking-widest flex items-center gap-1 transition-all active:scale-95 border",
                        showAppliedFeedback
                          ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                          : "bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:scale-[1.02]"
                      )}
                      title="Aktif ayın tüm verilerini diğer aylara kopyalar"
                    >
                      {showAppliedFeedback ? (
                        <>
                          <Check size={11} className="text-emerald-600 dark:text-emerald-400" />
                          2026 YILLIK UYGULANDI!
                        </>
                      ) : (
                        <>
                          <Check size={11} className="text-blue-600 dark:text-blue-400" />
                          2026 YILLIK UYGULA
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    {shortMonths.map((m, i) => {
                      const isFilled = results[i].totalGross > 0;
                      const isActive = activeMonth === i;
                      return (
                        <button
                          key={m}
                          onClick={() => setActiveMonth(i)}
                          className={cn(
                            "relative flex flex-col items-center justify-center py-2 rounded-xl transition-all duration-300 border shadow-sm group",
                            isActive
                              ? "bg-rose-500 text-white border-rose-600 scale-[1.05] z-10 shadow-rose-500/30"
                              : "bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-slate-700/50 hover:scale-105",
                          )}
                        >
                          <span
                            className={cn(
                              "text-[12px] font-black uppercase tracking-widest transition-colors leading-none mb-1",
                              isActive
                                ? "text-white"
                                : workerType === "shift" &&
                                    [2, 4, 6, 8, 10, 11].includes(i)
                                  ? "text-orange-500"
                                  : "",
                            )}
                          >
                            {m}
                          </span>
                          {isFilled ? (
                            <span
                              className={cn(
                                "text-[9px] sm:text-[10px] font-mono font-bold leading-none",
                                isActive
                                  ? "text-rose-100"
                                  : "text-slate-500 dark:text-slate-300",
                              )}
                            >
                              {formatCurrency(results[i].netPaid).split(",")[0]}
                            </span>
                          ) : (
                            <div
                              className={cn(
                                "h-1 w-4 rounded-full mt-1",
                                isActive
                                  ? "bg-white/50"
                                  : "bg-slate-200 dark:bg-slate-700",
                              )}
                            />
                          )}
                          {workerType === "shift" &&
                            [2, 4, 6, 8, 10, 11].includes(i) && (
                              <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.8)] animate-pulse" />
                            )}
                        </button>
                      );
                    })}
                  </div>



                  <button
                    onClick={() => clearAllMonths()}
                    className="w-full py-3 mt-2 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-[11px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 dark:text-rose-400 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Trash2 size={13} />{" "}
                    <span className="inline">TÜM AYLARI TEMİZLE</span>
                  </button>

                  {workerType === "shift" && (
                    <div className="mt-4 p-5 xl:p-6 bg-rose-500/[0.04] dark:bg-rose-500/[0.03] rounded-[1.5rem] border border-rose-500/20 space-y-5 shadow-sm">
                      <div className="flex items-center gap-2.5 pb-2.5 border-b border-rose-500/10 dark:border-white/5">
                        <div className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                          <Info size={14} strokeWidth={2.5} />
                        </div>
                        <span className="text-[11px] xl:text-[12px] font-black text-rose-800 dark:text-rose-400 uppercase tracking-widest leading-none">
                          HESAPLAMA METOTLARI
                        </span>
                      </div>
                      <div className="space-y-3.5 text-[11px] xl:text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                        <div className="flex flex-col gap-1">
                          <span className="font-black text-rose-700 dark:text-rose-400 uppercase text-[10px] tracking-wider leading-none">
                            Vardiya Günü
                          </span>
                          <span>
                            Saatlik Brüt{" "}
                            <strong className="text-slate-900 dark:text-white font-extrabold text-[13px]">
                              91,36 ₺
                            </strong>
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="font-black text-rose-700 dark:text-rose-400 uppercase text-[10px] tracking-wider leading-none">
                            Yemek Ücreti
                          </span>
                          <span>
                            Gün. Net{" "}
                            <strong className="text-slate-900 dark:text-white font-extrabold text-[13px]">
                              550,00 ₺
                            </strong>
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="font-black text-rose-700 dark:text-rose-400 uppercase text-[10px] tracking-wider leading-none">
                            Bayram Parası
                          </span>
                          <span>
                            Brüt{" "}
                            <strong className="text-slate-900 dark:text-white font-extrabold text-[13px]">
                              17.875,00 ₺
                            </strong>
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="font-black text-rose-700 dark:text-rose-400 uppercase text-[10px] tracking-wider leading-none">
                            Sendika Aidatı
                          </span>
                          <span className="text-[11px] xl:text-xs">
                            1 günlük brüt maaşın <strong className="text-slate-950 dark:text-white font-black">yüzde 80</strong> alınır.
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="font-black text-rose-700 dark:text-rose-400 uppercase text-[10px] tracking-wider leading-none">
                            Servis Ücreti
                          </span>
                          <span className="text-[11px] xl:text-xs">
                            Günlük brüt <strong className="text-slate-950 dark:text-white font-black">303</strong> TL'dir.
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Yıllık Özet */}
                  <div className="mt-4 p-5 bg-blue-600/[0.04] dark:bg-blue-400/[0.04] rounded-[1.5rem] border border-blue-500/10 shadow-sm space-y-4">
                    <div className="flex items-center gap-2.5 pb-2.5 border-b border-blue-500/10 dark:border-white/5">
                      <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-pulse" />
                      <span className="text-[11px] xl:text-[12px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest leading-none">
                        Yıllık Özet
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">
                          Top. Net Maaş
                        </span>
                        <span className="text-sm xl:text-base font-display font-black text-slate-900 dark:text-white leading-none">
                          {formatCurrency(
                            results.reduce((acc, r) => acc + r.netPaid, 0),
                          )}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">
                          Top. Yemek Kartı
                        </span>
                        <span className="text-sm xl:text-base font-display font-black text-emerald-600 dark:text-emerald-400 leading-none">
                          {formatCurrency(
                            results.reduce((acc, r, i) => {
                              const mInput = monthsData[i];
                              if (!mInput || mInput.baseGross === 0) return acc;
                              return (
                                acc +
                                ((mInput.shiftDays || 0) +
                                  (mInput.holidayWorkHours || 0)) *
                                  550
                              );
                            }, 0),
                          )}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1.5 bg-white/50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200 dark:border-white/5">
                        <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest leading-none">
                          Net + Yemek (Paket)
                        </span>
                        <span className="text-base xl:text-lg font-display font-black text-slate-950 dark:text-white leading-none">
                          {formatCurrency(
                            results.reduce((acc, r) => acc + r.netPaid, 0) +
                              results.reduce((acc, r, i) => {
                                const mInput = monthsData[i];
                                if (!mInput || mInput.baseGross === 0)
                                  return acc;
                                return (
                                  acc +
                                  ((mInput.shiftDays || 0) +
                                    (mInput.holidayWorkHours || 0)) *
                                    550
                                );
                              }, 0),
                          )}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-blue-500/10">
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">
                            Ort. Net
                          </span>
                          <span className="text-xs xl:text-sm font-display font-black text-slate-700 dark:text-slate-300 leading-none">
                            {formatCurrency(
                              results.reduce((acc, r) => acc + r.netPaid, 0) /
                                12,
                            )}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">
                            Ort. Paket
                          </span>
                          <span className="text-xs xl:text-sm font-display font-black text-emerald-600 dark:text-emerald-400 leading-none">
                            {formatCurrency(
                              (results.reduce((acc, r) => acc + r.netPaid, 0) +
                                results.reduce((acc, r, i) => {
                                  const mInput = monthsData[i];
                                  if (!mInput || mInput.baseGross === 0)
                                    return acc;
                                  return (
                                    acc +
                                    ((mInput.shiftDays || 0) +
                                      (mInput.holidayWorkHours || 0)) *
                                      550
                                  );
                                }, 0)) /
                                12,
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "history" && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-12 max-w-6xl mx-auto"
              >
                <div className="flex items-center justify-between mb-16">
                  <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                    Finansal Arşiv
                  </h2>
                  <button
                    onClick={() => setActiveTab("calculator")}
                    className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black rounded-xl"
                  >
                    GERİ DÖN
                  </button>
                </div>
                {history.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-12 space-y-6">
                      {history.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm flex items-center justify-between border border-slate-100 dark:border-white/5"
                        >
                          <div>
                            <span className="text-xs font-black text-blue-600 uppercase mb-1 block">
                              {item.date}
                            </span>
                            <span className="text-3xl font-black font-mono">
                              {formatCurrency(item.netPaid)}
                            </span>
                          </div>
                          <button
                            onClick={() => deleteHistory(item.id)}
                            className="p-4 bg-rose-50 text-rose-500 rounded-full hover:bg-rose-500 hover:text-white transition-all"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-40 border-4 border-dashed border-slate-100 rounded-[4rem]">
                    <h3 className="text-2xl font-black text-slate-300">
                      Arşiv Boş
                    </h3>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Notification Box */}
      {showSuggestionBox && (
        <div className="fixed bottom-6 right-6 z-50 max-w-[200px] pointer-events-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200/80 dark:border-white/10 shadow-md flex items-center gap-2 transition-all">
          <button
            onClick={() => setShowSuggestionBox(false)}
            className="text-slate-500 hover:text-rose-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <a
            href="mailto:ibrahim.erek@turktelekom.com.tr"
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-5 h-5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Info size={11} strokeWidth={2.5} />
            </div>
            <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 leading-tight text-right break-words">
              Öneri ve Talepleriniz için mail iletebilirsiniz.
            </p>
          </a>
        </div>
      )}

      <footer className="fixed bottom-4 left-4 lg:left-6 z-40 pointer-events-auto flex flex-col items-start gap-2 max-w-[170px] w-full hidden lg:flex">
        {/* Security & Privacy Notice (Square Block) */}
        {showPrivacyNotice && (
          <div className="w-full aspect-square rounded-2xl p-2.5 bg-gradient-to-br from-emerald-500/[0.09] via-teal-500/[0.05] to-cyan-500/[0.04] dark:from-emerald-500/[0.18] dark:via-teal-500/[0.1] dark:to-cyan-500/[0.06] border border-emerald-500/25 dark:border-emerald-500/35 shadow-xl flex flex-col justify-between backdrop-blur-md">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1.5">
                <div className="w-6.5 h-6.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
                  <Lock size={12} className="animate-pulse" />
                </div>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[7px] font-black tracking-wider uppercase">
                  GÜVENLİ
                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                </span>
              </div>
              <button
                onClick={() => setShowPrivacyNotice(false)}
                className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 transition-colors"
                title="Kapat"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-0.5">
              <span className="text-[8px] font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-widest block leading-none">
                GÜVENLİK VE GİZLİLİK
              </span>
              <p className="text-[9px] text-slate-700 dark:text-slate-200 font-semibold leading-normal">
                Girdiğiniz veriler sadece size özeldir. Tamamen tarayıcınızda (yerel olarak) işlenir; başka hiçbir kullanıcı ya da sunucu göremez.
              </p>
            </div>
          </div>
        )}

        {/* Signature */}
        <div className="opacity-60 hover:opacity-100 transition-all group translate-y-1 hover:translate-y-0 pl-1">
          <div className="flex flex-col items-start">
            <span className="text-[8px] font-black tracking-[0.4em] text-slate-500 dark:text-slate-400 uppercase mb-0.5 animate-pulse">
              CREATED BY
            </span>
            <span className="text-xl font-black italic tracking-tighter text-slate-950 dark:text-white bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-blue-600 to-indigo-600 dark:from-white dark:via-blue-400 dark:to-indigo-400 font-serif leading-none">
              Erek
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
