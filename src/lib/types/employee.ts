export type Sex = 'Male' | 'Female' | 'Other';
export type Ethnicity = 'Asian' | 'White' | 'Black' | 'Hispanic' | 'Other';
export type BenefitsPlan = 'Basic' | 'Standard' | 'Premium' | 'Executive';

export interface EarningRecord {
  month: number;
  year: number;
  basicSalary: number;
  overtime: number;
  bonus: number;
}

export interface VacationRecord {
  year: number;
  daysUsed: number;
  daysAccumulated: number;
}

export interface BenefitRecord {
  plan: BenefitsPlan;
  amount: number;
  year: number;
  changedAt?: string;
  affectsPayroll?: boolean;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  sex: Sex;
  ethnicity: Ethnicity;
  isFullTime: boolean;
  isShareholder: boolean;
  departmentId: string;
  hireDate: string;
  birthDate: string;
  benefitsPlan: BenefitsPlan;
  earnings: EarningRecord[];
  vacationDays: VacationRecord[];
  benefits: BenefitRecord[];
}

export interface Department {
  id: string;
  name: string;
  headCount?: number;
}

export interface AlertConfig {
  anniversaryDaysThreshold: number;
  vacationDaysThreshold: number;
}
