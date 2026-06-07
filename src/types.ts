export interface MonthInput {
  baseGross: number;
  shiftDays: number;
  shiftHours?: number;
  bonusDays: number;
  holidayWorkHours: number;
  isMarried: boolean;
  spouseWorks: boolean;
  childCount: number;
  bysManuel: number;
  holidayBonusGross: number;
  hasHolidayBonus?: boolean;
  hasShuttle: boolean;
  shuttleDays?: number;
  isDernekMember: boolean;
  isUnionMember: boolean;
  istanbulTazminati: number;
  yemekGun: number;
  familyAllowanceGrossOverride?: number;
  childAllowanceGrossOverride?: number;
  workerType?: 'shift' | 'non-shift' | 'shift-non-union';
}

export interface SalaryResult {
  monthIndex: number;
  totalGross: number;
  sgkEmployee: number;
  unemploymentEmployee: number;
  incomeTaxBase: number;
  cumulativeTaxBaseBefore: number;
  incomeTaxBeforeExemption: number;
  incomeTaxExemption: number;
  finalIncomeTax: number;
  stampTaxBeforeExemption: number;
  stampTaxExemption: number;
  finalStampTax: number;
  totalLegalDeductions: number;
  legalNet: number;
  privateDeductions: number;
  familyAllowance: number;
  childAllowance: number;
  netPaid: number;
  taxBracket: string;
}

export interface CalculationHistory extends SalaryResult {
  id: string;
  date: string;
  input: MonthInput;
}
