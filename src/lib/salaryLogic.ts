import { MonthInput, SalaryResult } from '../types';

// 2025 Official Parameters
const SGK_CEILING = 150018.75 * 1.5; // SGK tavanı genellikle asgari ücretin 7.5 katıdır (2025 için 247k civarı)
const MIN_WAGE_GROSS_2025 = 33030.00;
const MIN_WAGE_SGK_2025 = MIN_WAGE_GROSS_2025 * 0.15;
const MIN_WAGE_TAX_BASE_2025 = MIN_WAGE_GROSS_2025 - MIN_WAGE_SGK_2025; // 28,075.50

// 2025 Wage Income Tax Brackets (Official)
const TAX_BRACKETS = [
  { limit: 158000, rate: 0.15 },
  { limit: 330000, rate: 0.20 },
  { limit: 1200000, rate: 0.27 },
  { limit: 4300000, rate: 0.35 },
  { limit: Infinity, rate: 0.40 }
];

// 2026 Allowance Values (Varsayılan değerler, eğer sözleşmenizde farklıysa güncellenebilir)
const FAMILY_ALLOWANCE_VAL = 1500; // Örnek Aile yardımı (Eşi çalışmayanlar için)
const CHILD_ALLOWANCE_VAL = 500;   // Örnek Çocuk yardımı (Çocuk başına)

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
  const effectiveMonths: MonthInput[] = months.map(m => ({
    ...m,
    workerType: selectedWorkerType || m.workerType || 'shift'
  }));
  const firstIdx = effectiveMonths.findIndex(m => m.baseGross > 0);
  if (firstIdx > -1) {
    for (let i = 0; i < firstIdx; i++) {
      effectiveMonths[i] = { 
        ...effectiveMonths[firstIdx],
        holidayWorkHours: 0,
        bonusDays: 0,
        hasHolidayBonus: false,
        holidayBonusGross: 0,
        yemekGun: 22
      };
    }
  }
  let lastVal: MonthInput = effectiveMonths[0] || months[0];
  for (let i = 0; i < 12; i++) {
    if (effectiveMonths[i].baseGross > 0) {
      lastVal = effectiveMonths[i];
    } else {
      effectiveMonths[i] = { 
        ...lastVal,
        holidayWorkHours: 0,
        bonusDays: 0,
        hasHolidayBonus: false,
        holidayBonusGross: 0,
        yemekGun: 22
      };
    }
  }

  const getMonthlyDetails = (m: MonthInput, currentCumulativeTax: number) => {
    if (!m || m.baseGross === 0) {
      return { totalGross: 0, sgkEmployee: 0, unemployment: 0, totalSgk: 0,
               gvBaseInput: 0, dvBaseInput: 0, taxObj: { tax: 0, bracketRate: '15' },
               nonCashNT: 0, childAllowanceGross: 0, familyAllowanceGross: 0 };
    }
    const DAILY_GROSS = m.baseGross / 30;
    const HOURLY_GROSS = DAILY_GROSS / 7.5;
    const holidayGross = m.workerType === 'non-shift' ? 0 : ((m.holidayWorkHours || 0) * (DAILY_GROSS * 2.0)); 
    const ikramiyeGross = ((m.bonusDays || 0) * (DAILY_GROSS * 1.0)); 
    const vardiyaGross = m.shiftHours ? (m.shiftHours * (685.20 / 7.5)) : ((m.shiftDays || 0) * 685.20); 
    const shuttleGross = m.workerType === 'non-shift' ? 0 : (m.hasShuttle ? (20 * 332.83) : ((m.shiftDays || 0) * 332.83));
    const istanbulGross = m.baseGross * 0.06;
    const additionalHolidayBonus = m.hasHolidayBonus ? 17875 : (m.holidayBonusGross || 0);
    
    // Non-Cash benefits target net values (Telekom specifications)
    // Only applied if we assume it's a shifted / telekom user... we will apply if yemekGun > 0 or istanbul > 0
    const hasYanHaklar = (m.yemekGun || 0) > 0 || (m.istanbulTazminati || 0) > 0;
    const targetYemekNt = (m.yemekGun || 0) * 550;
    const targetPstnAdslNt = hasYanHaklar ? (128.99 + 522.86) : 0;
    const targetSsyvNt = hasYanHaklar ? 2769.75 : 0;
    const targetHayatNt = hasYanHaklar ? 86.58 : 0;
    const ssyvKesintisiCash = hasYanHaklar ? 923.25 : 0; // cash deduction later

    let familyAllowanceGross = 0;
    if (m.isMarried && !m.spouseWorks) {
        familyAllowanceGross = m.familyAllowanceGrossOverride ?? FAMILY_ALLOWANCE_VAL;
    }
    const childAllowanceGross = (m.childCount || 0) * (m.childAllowanceGrossOverride ?? CHILD_ALLOWANCE_VAL);

    let marginalGV = 0.20; 
    let nbPstnAdsl = targetPstnAdslNt / (1 - marginalGV - 0.00759);
    let yemekNominator = targetYemekNt - 300 * (m.yemekGun || 0) * (marginalGV + 0.00759);
    let nbYemek = yemekNominator > 0 ? (yemekNominator / (1 - marginalGV - 0.00759)) : targetYemekNt;
    if (nbYemek < targetYemekNt) nbYemek = targetYemekNt; 
    let nbHayat = targetHayatNt / (1 - 0.15 - 0.00759);
    let nbSsyv = targetSsyvNt / (1 - 0.15 - (marginalGV * 0.85) - 0.00759);

    let totalGross = 0, sgkEmployee = 0, unemployment = 0, totalSgk = 0, gvBaseInput = 0, dvBaseInput = 0, taxObj = { tax: 0, bracketRate: '15' };

    for(let i=0; i<3; i++) {
        // Recalculate with refined NBs
        totalGross = m.baseGross + holidayGross + ikramiyeGross + vardiyaGross + shuttleGross + istanbulGross + additionalHolidayBonus
                           + nbPstnAdsl + nbYemek + nbHayat + nbSsyv + familyAllowanceGross + childAllowanceGross;
        
        let exemptFamilySGK = familyAllowanceGross > 0 ? Math.min(familyAllowanceGross, MIN_WAGE_GROSS_2025 * 0.10) : 0;
        let exemptChildSGK = childAllowanceGross > 0 ? Math.min(childAllowanceGross, MIN_WAGE_GROSS_2025 * 0.02 * Math.min(m.childCount || 0, 2)) : 0;

        let sgkBaseInput = totalGross - nbPstnAdsl - nbYemek - exemptFamilySGK - exemptChildSGK; 
        const sgkBase = Math.min(Math.max(sgkBaseInput, 0), SGK_CEILING);
        sgkEmployee = sgkBase * 0.14;
        unemployment = sgkBase * 0.01;
        totalSgk = sgkEmployee + unemployment;
        
        gvBaseInput = totalGross - totalSgk;
        if (m.workerType !== 'non-shift' && m.isUnionMember) gvBaseInput -= (m.baseGross / 30) * 0.80; 
        if (hasYanHaklar) gvBaseInput -= 86.58; // Hayat GV istisna
        gvBaseInput -= (296.59 * (m.yemekGun || 0)); // Yemek GV istisna
        if (gvBaseInput < 0) gvBaseInput = 0;

        taxObj = calculateIncomeTax(gvBaseInput, currentCumulativeTax);
        
        let applicableRateStr = taxObj.bracketRate.split('-').pop() || "20";
        marginalGV = parseInt(applicableRateStr) / 100;
        
        // Refine NBs
        nbPstnAdsl = targetPstnAdslNt / (1 - marginalGV - 0.00759);
        let nYemek = targetYemekNt - 300 * (m.yemekGun || 0) * (marginalGV + 0.00759);
        nbYemek = nYemek > 0 ? (nYemek / (1 - marginalGV - 0.00759)) : targetYemekNt;
        if (nbYemek < targetYemekNt) nbYemek = targetYemekNt;
        nbSsyv = targetSsyvNt / (1 - 0.15 - (marginalGV * 0.85) - 0.00759);
    }

    dvBaseInput = totalGross - (300 * (m.yemekGun || 0));
    
    // Net shuttle value calculation if hasShuttle is true (EVET) - to prevent cash addition to net Paid
    const sgkShuttle = m.workerType === 'non-shift' ? 0 : (m.hasShuttle ? (20 * 332.83 * 0.15) : ((m.shiftDays || 0) * 332.83 * 0.15));
    const taxShuttle = m.workerType === 'non-shift' ? 0 : (m.hasShuttle ? ((20 * 332.83 * 0.85) * marginalGV) : (((m.shiftDays || 0) * 332.83) * marginalGV));
    const stampShuttle = m.workerType === 'non-shift' ? 0 : (m.hasShuttle ? (20 * 332.83 * 0.00759) : ((m.shiftDays || 0) * 332.83 * 0.00759));
    const netShuttle = (m.workerType !== 'non-shift') ? (shuttleGross - sgkShuttle - taxShuttle - stampShuttle) : 0;
    
    return {
       totalGross, sgkEmployee, unemployment, totalSgk, gvBaseInput, dvBaseInput, taxObj,
       nonCashNT: targetYemekNt + targetPstnAdslNt + targetSsyvNt + targetHayatNt + ssyvKesintisiCash,
       childAllowanceGross, familyAllowanceGross
    };
  };

  for (let i = 0; i < 12; i++) {
    const data = months[i];
    const effDet = getMonthlyDetails(effectiveMonths[i], cumulativeTaxBase);
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

    const currDet = getMonthlyDetails(data, cumulativeTaxBase);
    
    // Taxes
    const stampBefore = currDet.dvBaseInput * 0.00759;
    const finalIncomeTax = Math.max(0, currDet.taxObj.tax - minWageExemptionGV);
    const finalStampTax = Math.max(0, stampBefore - minWageExemptionDV);
    
    const totalLegalDeductions = currDet.totalSgk + finalIncomeTax + finalStampTax;
    const legalNet = currDet.totalGross - totalLegalDeductions;
    
    // Private deductions (Non-cash reversed out)
    const bysKesintisi = (data.bysManuel || 0);
    const dernekKesintisi = (data.isDernekMember ? 150 : 0);
    const unionDuesDeduction = (data.isUnionMember ? (data.baseGross / 30) * 0.80 : 0);
    
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
