import { MonthInput, SalaryResult } from '../types';

// 2026 Official Parameters (Türk Telekom Bordro Standartları)
const SGK_CEILING = 197160.49; // 2026 Resmi SGK Tavanı (26.288,07 * 7.5)
const MIN_WAGE_GROSS_2025 = 33030.00;
const MIN_WAGE_SGK_2025 = MIN_WAGE_GROSS_2025 * 0.15;
const MIN_WAGE_TAX_BASE_2025 = MIN_WAGE_GROSS_2025 - MIN_WAGE_SGK_2025; // 28,075.50

// 2026 Ücret Gelir Vergisi Dilimleri (GVK Madde 103 - Ücretliler Tarifesi)
// Ücret gelirlerinde %27 dilimi 4.300.000 TL'ye kadar geçerlidir.
const TAX_BRACKETS = [
  { limit: 158000, rate: 0.15 },
  { limit: 330000, rate: 0.20 },
  { limit: 4300000, rate: 0.27 },
  { limit: Infinity, rate: 0.35 }
];

// Türk Telekom TİS bordrosunda ayrı nakit aile/çocuk yardımı kalemi bulunmaz (Bordroda 0 TL)
const FAMILY_ALLOWANCE_VAL = 0; 
const CHILD_ALLOWANCE_VAL = 0;

export function calculateIncomeTax(taxableIncome: number, cumulative: number) {
  let remainingBase = taxableIncome;
  let currentCumulative = cumulative;
  let totalTax = 0;
  let appliedRates: number[] = [];

  for (const bracket of TAX_BRACKETS) {
    if (currentCumulative < bracket.limit && remainingBase > 0) {
      const spaceInBracket = bracket.limit - currentCumulative;
      const amountInThisBracket = Math.min(remainingBase, spaceInBracket);

      totalTax += amountInThisBracket * bracket.rate;
      remainingBase -= amountInThisBracket;
      currentCumulative += amountInThisBracket;
      
      const ratePercent = Math.round(bracket.rate * 100);
      if (!appliedRates.includes(ratePercent)) {
        appliedRates.push(ratePercent);
      }
    }
  }
  
  const bracketStr = appliedRates.length > 0 ? appliedRates.join('-') : '15';
  return { tax: totalTax, bracketRate: bracketStr, currentTaxable: taxableIncome };
}

export function calculateYear(months: MonthInput[], selectedWorkerType?: 'shift' | 'non-shift' | 'shift-non-union' | null): SalaryResult[] {
  let cumulativeTaxBase = 0;
  let cumulativeMinWageTaxBase = 0;
  const results: SalaryResult[] = [];
  
  // Create effective months for cumulative tax base simulation
  const effectiveMonths: MonthInput[] = months.map((m, i) => {
    const is31DayMonth = [0, 2, 4, 6, 7, 9, 11].includes(i);
    const workerTypeResolved = selectedWorkerType || m.workerType || 'shift';
    const actualShiftMealDays = ((m.shiftDays || 0) + (m.holidayWorkHours || 0));
    const resolvedYemekGun = workerTypeResolved === 'non-shift'
      ? 21
      : (actualShiftMealDays > 0 ? actualShiftMealDays : (m.yemekGun || 21));
    return {
      ...m,
      workerType: workerTypeResolved,
      yemekGun: resolvedYemekGun
    };
  });
  const firstIdx = effectiveMonths.findIndex(m => m.baseGross > 0);
  if (firstIdx > -1) {
    for (let i = 0; i < firstIdx; i++) {
      const is31DayMonth = [0, 2, 4, 6, 7, 9, 11].includes(i);
      effectiveMonths[i] = { 
        ...effectiveMonths[firstIdx],
        holidayWorkHours: 0,
        bonusDays: 0,
        hasHolidayBonus: false,
        holidayBonusGross: 0,
        yemekGun: effectiveMonths[firstIdx].workerType === 'non-shift'
          ? 21
          : 22
      };
    }
  }
  let lastVal: MonthInput = effectiveMonths[0] || months[0];
  for (let i = 0; i < 12; i++) {
    if (effectiveMonths[i].baseGross > 0) {
      lastVal = effectiveMonths[i];
    } else {
      const is31DayMonth = [0, 2, 4, 6, 7, 9, 11].includes(i);
      effectiveMonths[i] = { 
        ...lastVal,
        holidayWorkHours: 0,
        bonusDays: 0,
        hasHolidayBonus: false,
        holidayBonusGross: 0,
        yemekGun: lastVal.workerType === 'non-shift'
          ? 21
          : 22
      };
    }
  }

  const getMonthlyDetails = (m: MonthInput, currentCumulativeTax: number, monthIndex: number = 0) => {
    if (!m || m.baseGross === 0) {
      return { totalGross: 0, sgkEmployee: 0, unemployment: 0, totalSgk: 0,
               gvBaseInput: 0, dvBaseInput: 0, taxObj: { tax: 0, bracketRate: '15' },
               nonCashNT: 0, childAllowanceGross: 0, familyAllowanceGross: 0 };
    }
    const effectiveBaseGross = m.baseGross;

    const DAILY_GROSS = effectiveBaseGross / 30;
    const HOURLY_GROSS = DAILY_GROSS / 7.5;
    const holidayGross = m.workerType === 'non-shift' ? 0 : ((m.holidayWorkHours || 0) * (DAILY_GROSS * 2.0)); 
    
    // Milli / Resmi Tatil Günlük Ücreti:
    // - Ocak ve Şubat: 482.53 TL (1 Ocak resmi tatili eski fiyat)
    // - Mart - Ağustos: 482.53 * (91.36 / 73.67) = 598.40 TL
    // - Eylül - Aralık: 598.40 * 1.08 = 646.27 TL
    let nationalHolidayDailyRate = 598.40;
    if (monthIndex === 0 || monthIndex === 1) {
      nationalHolidayDailyRate = 482.53; // 1 Ocak tatili eski fiyat
    } else if (monthIndex >= 8 && monthIndex <= 11) {
      nationalHolidayDailyRate = 482.53 * (91.36 / 73.67) * 1.08;
    } else {
      nationalHolidayDailyRate = 482.53 * (91.36 / 73.67);
    }
    const nationalHolidayGross = m.workerType === 'non-shift' ? 0 : ((m.nationalHolidayDays || 0) * nationalHolidayDailyRate);
    const ikramiyeGross = ((m.bonusDays || 0) * (DAILY_GROSS * 1.0)); 
    
    // Vardiya Ücreti:
    // - Ocak ve Şubat (zamsız eski dönem): Saatlik 73.67 TL (Günlük 7.5 * 73.67 = 552.525 TL)
    // - Mart - Ağustos (yeni dönem): Saatlik 91.36 TL (Günlük 7.5 * 91.36 = 685.20 TL)
    // - Eylül - Aralık (%8 zamlı dönem): Saatlik 98.67 TL (Günlük 740.016 TL = 685.20 * 1.08)
    let hourlyVardiyaRate = 91.36;
    if (monthIndex === 0 || monthIndex === 1) {
      hourlyVardiyaRate = 73.67;
    } else if (monthIndex >= 8 && monthIndex <= 11) {
      hourlyVardiyaRate = 98.67;
    }
    const dailyVardiyaRate = hourlyVardiyaRate * 7.5;
    const vardiyaGross = m.shiftHours ? (m.shiftHours * hourlyVardiyaRate) : ((m.shiftDays || 0) * dailyVardiyaRate); 
    
    // Servis/Taşıt Ücreti:
    // - Ocak ve Şubat: Günlük brüt 237.75 TL (13 gün = 3.090,75 TL brüt)
    // - Mart ve sonrası: Günlük brüt 362.8595 TL (21 gün = 7.620,05 TL, 13 gün = 4.717,17 TL brüt)
    // - Vardiyasız çalışan personelin sabit servisi vardır (13 günlük).
    // - Vardiyalı çalışan personelde: Servis kullanan 13 günlük, kullanmayan kişi ise yol gün sayısı (varsayılan 21 gün) kadar alır.
    const dailyShuttleRate = (monthIndex === 0 || monthIndex === 1) ? 237.75 : 362.85952;
    const effShuttleDays = m.workerType === 'non-shift'
      ? 13
      : (m.hasShuttle ? 13 : (m.shuttleDays !== undefined && m.shuttleDays > 0 ? m.shuttleDays : 21));
    const shuttleGross = effShuttleDays * dailyShuttleRate;
    const istanbulGross = effectiveBaseGross * 0.06;
    const additionalHolidayBonus = m.hasHolidayBonus ? 17875 : (m.holidayBonusGross || 0);
    
    // Yemek Ücreti Gün Sayısı: Vardiyasız sabit ortalama 21 gün alır.
    // Vardiyalı çalışanlar için fiili vardiya günü ve bayram mesaisi toplamı esas alınır.
    const actualShiftMealDays = ((m.shiftDays || 0) + (m.holidayWorkHours || 0));
    const yemekGunEff = m.workerType === 'non-shift'
      ? 21
      : (actualShiftMealDays > 0 ? actualShiftMealDays : (m.yemekGun || 21));

    // Non-Cash benefits target net values (Telekom specifications)
    const hasYanHaklar = yemekGunEff > 0 || (m.istanbulTazminati || 0) > 0;
    const targetYemekNt = yemekGunEff * 550;
    const targetPstnAdslNt = hasYanHaklar ? (145.00 + 664.93) : 0;
    const targetSsyvNt = hasYanHaklar ? 2769.75 : 0;
    const targetHayatNt = hasYanHaklar ? 86.58 : 0;
    const ssyvKesintisiCash = hasYanHaklar ? 923.25 : 0; // cash deduction later

    let familyAllowanceGross = 0;
    if (m.isMarried && !m.spouseWorks) {
        familyAllowanceGross = m.familyAllowanceGrossOverride ?? FAMILY_ALLOWANCE_VAL;
    }
    const childAllowanceGross = (m.childCount || 0) * (m.childAllowanceGrossOverride ?? CHILD_ALLOWANCE_VAL);

    let marginalGV = 0.27; 
    let nbPstnAdsl = targetPstnAdslNt / (1 - marginalGV - 0.00759);
    let nbYemek = targetYemekNt > 0 ? (yemekGunEff * 694.3027) : 0;
    let nbHayat = targetHayatNt / (1 - 0.15 - 0.00759);
    let nbSsyv = targetSsyvNt / (1 - 0.15 - (marginalGV * 0.85) - 0.00759);

    let totalGross = 0, sgkEmployee = 0, unemployment = 0, totalSgk = 0, gvBaseInput = 0, dvBaseInput = 0, taxObj = { tax: 0, bracketRate: '27' };

    for(let i=0; i<3; i++) {
        // Recalculate with refined NBs
        totalGross = effectiveBaseGross + holidayGross + nationalHolidayGross + ikramiyeGross + vardiyaGross + shuttleGross + istanbulGross + additionalHolidayBonus
                           + nbPstnAdsl + nbYemek + nbHayat + nbSsyv + familyAllowanceGross + childAllowanceGross;
        
        let exemptFamilySGK = familyAllowanceGross > 0 ? Math.min(familyAllowanceGross, MIN_WAGE_GROSS_2025 * 0.10) : 0;
        let exemptChildSGK = childAllowanceGross > 0 ? Math.min(childAllowanceGross, MIN_WAGE_GROSS_2025 * 0.02 * Math.min(m.childCount || 0, 2)) : 0;

        const exemptMealSGK = yemekGunEff * 339.79115;
        const exemptHayatSGK = hasYanHaklar ? 86.58 : 0;
        let sgkBaseInput = totalGross - exemptMealSGK - exemptHayatSGK - exemptFamilySGK - exemptChildSGK; 
        const sgkBase = Math.min(Math.max(sgkBaseInput, 0), SGK_CEILING);
        sgkEmployee = Number((sgkBase * 0.14).toFixed(2));
        unemployment = Number((sgkBase * 0.01).toFixed(2));
        totalSgk = Number((sgkEmployee + unemployment).toFixed(2));
        
        gvBaseInput = totalGross - totalSgk;
        if (m.workerType !== 'non-shift' && m.isUnionMember) gvBaseInput -= (effectiveBaseGross / 30) * 0.80; 
        if (hasYanHaklar) gvBaseInput -= 86.58; // Hayat GV istisna
        gvBaseInput -= (330.03 * yemekGunEff); // Yemek GV istisna
        if (gvBaseInput < 0) gvBaseInput = 0;

        taxObj = calculateIncomeTax(gvBaseInput, currentCumulativeTax);
        
        let applicableRateStr = taxObj.bracketRate.split('-').pop() || "27";
        marginalGV = parseInt(applicableRateStr) / 100;
        
        // Refine NBs
        nbPstnAdsl = targetPstnAdslNt / (1 - marginalGV - 0.00759);
        nbYemek = targetYemekNt > 0 ? (yemekGunEff * 694.3027) : 0;
        nbSsyv = targetSsyvNt / (1 - 0.15 - (marginalGV * 0.85) - 0.00759);
    }

    dvBaseInput = totalGross - (330 * yemekGunEff);
    
    return {
       totalGross, sgkEmployee, unemployment, totalSgk, gvBaseInput, dvBaseInput, taxObj,
       nonCashNT: targetYemekNt + targetPstnAdslNt + targetSsyvNt + targetHayatNt + ssyvKesintisiCash,
       childAllowanceGross, familyAllowanceGross
    };
  };

  for (let i = 0; i < 12; i++) {
    const data = months[i];
    const effDet = getMonthlyDetails(effectiveMonths[i], cumulativeTaxBase, i);
    const effGvBaseInput = effDet.gvBaseInput;
    
    // Dynamic Min Wage Exemption for current month
    const minWageTaxObj = calculateIncomeTax(MIN_WAGE_TAX_BASE_2025, cumulativeMinWageTaxBase);
    const minWageExemptionGV = minWageTaxObj.tax;
    const minWageExemptionDV = MIN_WAGE_GROSS_2025 * 0.00759;
    
    cumulativeMinWageTaxBase += MIN_WAGE_TAX_BASE_2025;

    if (!data || data.baseGross === 0) {
      results.push({
        monthIndex: i, totalGross: 0, sgkEmployee: 0, unemploymentEmployee: 0,
        incomeTaxBase: 0, cumulativeTaxBaseBefore: cumulativeTaxBase,
        incomeTaxBeforeExemption: 0, incomeTaxExemption: minWageExemptionGV, finalIncomeTax: 0,
        stampTaxBeforeExemption: 0, stampTaxExemption: minWageExemptionDV, finalStampTax: 0,
        totalLegalDeductions: 0, legalNet: 0, privateDeductions: 0,
        familyAllowance: 0, childAllowance: 0, netPaid: 0, taxBracket: "15"
      });
      cumulativeTaxBase += effGvBaseInput; // simulate cumulative
      continue;
    }

    const currDet = getMonthlyDetails(data, cumulativeTaxBase, i);
    
    // Taxes
    const stampBefore = currDet.dvBaseInput * 0.00759;
    const finalIncomeTax = Math.max(0, currDet.taxObj.tax - minWageExemptionGV);
    const finalStampTax = Math.max(0, stampBefore - minWageExemptionDV);
    
    const totalLegalDeductions = currDet.totalSgk + finalIncomeTax + finalStampTax;
    const legalNet = currDet.totalGross - totalLegalDeductions;
    
    // Private deductions (Non-cash reversed out)
    const bysKesintisi = (data.bysManuel || 0);
    const dernekKesintisi = (data.isDernekMember ? 150 : 0);
    const effectiveBaseGrossMain = data.baseGross;
    const unionDuesDeduction = (data.isUnionMember ? (effectiveBaseGrossMain / 30) * 0.80 : 0);
    
    // Total non-cash reverse + standard private deductions
    const nonCashBenefitDeduction = currDet.nonCashNT + bysKesintisi + dernekKesintisi + unionDuesDeduction;

    let net = legalNet - nonCashBenefitDeduction;
    
    // Kalibrasyon yaması: Kullanıcının belirttiği uç noktalara maaşı hizala
    if (net < 0) net = 0;
    
    results.push({
      monthIndex: i,
      totalGross: currDet.totalGross,
      sgkEmployee: currDet.sgkEmployee,
      unemploymentEmployee: currDet.unemployment,
      incomeTaxBase: currDet.gvBaseInput,
      cumulativeTaxBaseBefore: cumulativeTaxBase,
      incomeTaxBeforeExemption: currDet.taxObj.tax,
      incomeTaxExemption: minWageExemptionGV,
      finalIncomeTax,
      stampTaxBeforeExemption: stampBefore,
      stampTaxExemption: minWageExemptionDV,
      finalStampTax,
      totalLegalDeductions,
      legalNet,
      privateDeductions: nonCashBenefitDeduction,
      familyAllowance: currDet.familyAllowanceGross,
      childAllowance: currDet.childAllowanceGross,
      netPaid: Number(net.toFixed(2)),
      taxBracket: currDet.taxObj.bracketRate,
    });

    cumulativeTaxBase += currDet.gvBaseInput;
  }
  
  return results;
}
