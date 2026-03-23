import { Employee, Department } from '../types/employee';

export const departments: Department[] = [
  { id: 'sales', name: 'Sales Department' },
  { id: 'marketing', name: 'Marketing Department' },
  { id: 'hr', name: 'HR Department' },
  { id: 'finance', name: 'Finance Department' },
  { id: 'engineering', name: 'Engineering Department' },
  { id: 'operations', name: 'Operations Department' },
];

export const employees: Employee[] = [
  {
    id: '001', firstName: 'Bùi Hữu', lastName: 'Hải',
    sex: 'Male', ethnicity: 'Asian', isFullTime: true, isShareholder: true,
    departmentId: 'sales', hireDate: '2020-03-15', birthDate: '1990-03-20',
    benefitsPlan: 'Premium',
    earnings: [
      { month: 1, year: 2025, basicSalary: 2000, overtime: 150, bonus: 850 },
      { month: 2, year: 2025, basicSalary: 2000, overtime: 200, bonus: 300 },
      { month: 3, year: 2025, basicSalary: 2000, overtime: 100, bonus: 500 },
      { month: 1, year: 2024, basicSalary: 1800, overtime: 120, bonus: 400 },
      { month: 2, year: 2024, basicSalary: 1800, overtime: 180, bonus: 250 },
    ],
    vacationDays: [
      { year: 2025, daysUsed: 2, daysAccumulated: 5 },
      { year: 2024, daysUsed: 8, daysAccumulated: 15 },
    ],
    benefits: [
      { plan: 'Premium', amount: 200, year: 2025 },
      { plan: 'Standard', amount: 150, year: 2024, changedAt: '2024-06-01', affectsPayroll: true },
    ],
  },
  {
    id: '002', firstName: 'Lê Chí', lastName: 'Lâm',
    sex: 'Male', ethnicity: 'Asian', isFullTime: false, isShareholder: false,
    departmentId: 'sales', hireDate: '2021-07-01', birthDate: '1995-03-08',
    benefitsPlan: 'Basic',
    earnings: [
      { month: 1, year: 2025, basicSalary: 1500, overtime: 400, bonus: 300 },
      { month: 2, year: 2025, basicSalary: 1500, overtime: 350, bonus: 200 },
      { month: 1, year: 2024, basicSalary: 1300, overtime: 300, bonus: 150 },
    ],
    vacationDays: [
      { year: 2025, daysUsed: 5, daysAccumulated: 22 },
      { year: 2024, daysUsed: 12, daysAccumulated: 18 },
    ],
    benefits: [{ plan: 'Basic', amount: 150, year: 2025 }],
  },
  {
    id: '003', firstName: 'Nguyễn Ngọc', lastName: 'Đại',
    sex: 'Male', ethnicity: 'Asian', isFullTime: true, isShareholder: true,
    departmentId: 'marketing', hireDate: '2019-11-20', birthDate: '1988-07-14',
    benefitsPlan: 'Executive',
    earnings: [
      { month: 1, year: 2025, basicSalary: 2200, overtime: 300, bonus: 300 },
      { month: 2, year: 2025, basicSalary: 2200, overtime: 250, bonus: 400 },
      { month: 1, year: 2024, basicSalary: 2000, overtime: 200, bonus: 350 },
    ],
    vacationDays: [
      { year: 2025, daysUsed: 1, daysAccumulated: 8 },
      { year: 2024, daysUsed: 10, daysAccumulated: 14 },
    ],
    benefits: [
      { plan: 'Executive', amount: 180, year: 2025 },
      { plan: 'Executive', amount: 170, year: 2024 },
    ],
  },
  {
    id: '004', firstName: 'Phan Thị Thanh', lastName: 'Thùy',
    sex: 'Female', ethnicity: 'Asian', isFullTime: true, isShareholder: false,
    departmentId: 'hr', hireDate: '2022-01-10', birthDate: '1993-03-25',
    benefitsPlan: 'Standard',
    earnings: [
      { month: 1, year: 2025, basicSalary: 2100, overtime: 500, bonus: 300 },
      { month: 2, year: 2025, basicSalary: 2100, overtime: 450, bonus: 250 },
      { month: 1, year: 2024, basicSalary: 1900, overtime: 400, bonus: 200 },
    ],
    vacationDays: [
      { year: 2025, daysUsed: 3, daysAccumulated: 10 },
      { year: 2024, daysUsed: 7, daysAccumulated: 12 },
    ],
    benefits: [{ plan: 'Standard', amount: 190, year: 2025 }],
  },
  {
    id: '005', firstName: 'Trần Minh', lastName: 'Khoa',
    sex: 'Male', ethnicity: 'Asian', isFullTime: true, isShareholder: false,
    departmentId: 'engineering', hireDate: '2018-05-03', birthDate: '1992-03-12',
    benefitsPlan: 'Premium',
    earnings: [
      { month: 1, year: 2025, basicSalary: 3000, overtime: 600, bonus: 700 },
      { month: 2, year: 2025, basicSalary: 3000, overtime: 500, bonus: 600 },
      { month: 1, year: 2024, basicSalary: 2700, overtime: 450, bonus: 500 },
    ],
    vacationDays: [
      { year: 2025, daysUsed: 0, daysAccumulated: 25 },
      { year: 2024, daysUsed: 15, daysAccumulated: 20 },
    ],
    benefits: [
      { plan: 'Premium', amount: 220, year: 2025, changedAt: '2025-01-15', affectsPayroll: true },
    ],
  },
  {
    id: '006', firstName: 'Võ Thị', lastName: 'Lan',
    sex: 'Female', ethnicity: 'Asian', isFullTime: false, isShareholder: false,
    departmentId: 'finance', hireDate: '2023-03-01', birthDate: '1997-06-30',
    benefitsPlan: 'Basic',
    earnings: [
      { month: 1, year: 2025, basicSalary: 1200, overtime: 100, bonus: 100 },
      { month: 2, year: 2025, basicSalary: 1200, overtime: 80, bonus: 120 },
      { month: 1, year: 2024, basicSalary: 1100, overtime: 90, bonus: 80 },
    ],
    vacationDays: [
      { year: 2025, daysUsed: 4, daysAccumulated: 6 },
      { year: 2024, daysUsed: 3, daysAccumulated: 5 },
    ],
    benefits: [{ plan: 'Basic', amount: 100, year: 2025 }],
  },
  {
    id: '007', firstName: 'Đinh Quốc', lastName: 'Bảo',
    sex: 'Male', ethnicity: 'Asian', isFullTime: true, isShareholder: true,
    departmentId: 'finance', hireDate: '2017-09-18', birthDate: '1985-03-03',
    benefitsPlan: 'Executive',
    earnings: [
      { month: 1, year: 2025, basicSalary: 3500, overtime: 0, bonus: 1500 },
      { month: 2, year: 2025, basicSalary: 3500, overtime: 0, bonus: 1200 },
      { month: 1, year: 2024, basicSalary: 3200, overtime: 0, bonus: 1000 },
    ],
    vacationDays: [
      { year: 2025, daysUsed: 2, daysAccumulated: 30 },
      { year: 2024, daysUsed: 20, daysAccumulated: 25 },
    ],
    benefits: [{ plan: 'Executive', amount: 350, year: 2025 }],
  },
  {
    id: '008', firstName: 'Hoàng Thị', lastName: 'Mai',
    sex: 'Female', ethnicity: 'Asian', isFullTime: true, isShareholder: false,
    departmentId: 'operations', hireDate: '2021-03-14', birthDate: '1994-03-17',
    benefitsPlan: 'Standard',
    earnings: [
      { month: 1, year: 2025, basicSalary: 1800, overtime: 200, bonus: 200 },
      { month: 2, year: 2025, basicSalary: 1800, overtime: 180, bonus: 180 },
      { month: 1, year: 2024, basicSalary: 1600, overtime: 150, bonus: 160 },
    ],
    vacationDays: [
      { year: 2025, daysUsed: 3, daysAccumulated: 12 },
      { year: 2024, daysUsed: 9, daysAccumulated: 11 },
    ],
    benefits: [
      { plan: 'Standard', amount: 160, year: 2025 },
      { plan: 'Basic', amount: 100, year: 2024, changedAt: '2024-09-01', affectsPayroll: true },
    ],
  },
  {
    id: '009', firstName: 'Ngô Văn', lastName: 'Hùng',
    sex: 'Male', ethnicity: 'Asian', isFullTime: true, isShareholder: false,
    departmentId: 'sales', hireDate: '2023-08-22', birthDate: '1996-03-05',
    benefitsPlan: 'Standard',
    earnings: [
      { month: 1, year: 2025, basicSalary: 1600, overtime: 120, bonus: 200 },
      { month: 2, year: 2025, basicSalary: 1600, overtime: 100, bonus: 180 },
      { month: 1, year: 2024, basicSalary: 1400, overtime: 90, bonus: 150 },
    ],
    vacationDays: [
      { year: 2025, daysUsed: 1, daysAccumulated: 4 },
      { year: 2024, daysUsed: 5, daysAccumulated: 8 },
    ],
    benefits: [{ plan: 'Standard', amount: 140, year: 2025 }],
  },
  {
    id: '010', firstName: 'Lý Thị', lastName: 'Hương',
    sex: 'Female', ethnicity: 'Asian', isFullTime: true, isShareholder: true,
    departmentId: 'marketing', hireDate: '2020-06-15', birthDate: '1991-11-22',
    benefitsPlan: 'Premium',
    earnings: [
      { month: 1, year: 2025, basicSalary: 2400, overtime: 200, bonus: 500 },
      { month: 2, year: 2025, basicSalary: 2400, overtime: 180, bonus: 450 },
      { month: 1, year: 2024, basicSalary: 2200, overtime: 160, bonus: 400 },
    ],
    vacationDays: [
      { year: 2025, daysUsed: 4, daysAccumulated: 14 },
      { year: 2024, daysUsed: 11, daysAccumulated: 16 },
    ],
    benefits: [
      { plan: 'Premium', amount: 210, year: 2025 },
      { plan: 'Standard', amount: 150, year: 2024, changedAt: '2025-02-10', affectsPayroll: true },
    ],
  },
  {
    id: '011', firstName: 'Trịnh Văn', lastName: 'Nam',
    sex: 'Male', ethnicity: 'Asian', isFullTime: false, isShareholder: false,
    departmentId: 'engineering', hireDate: '2022-09-01', birthDate: '1998-03-30',
    benefitsPlan: 'Basic',
    earnings: [
      { month: 1, year: 2025, basicSalary: 2000, overtime: 350, bonus: 300 },
      { month: 2, year: 2025, basicSalary: 2000, overtime: 300, bonus: 280 },
      { month: 1, year: 2024, basicSalary: 1800, overtime: 280, bonus: 240 },
    ],
    vacationDays: [
      { year: 2025, daysUsed: 2, daysAccumulated: 28 },
      { year: 2024, daysUsed: 8, daysAccumulated: 12 },
    ],
    benefits: [{ plan: 'Basic', amount: 130, year: 2025 }],
  },
  {
    id: '012', firstName: 'Đỗ Thị', lastName: 'Linh',
    sex: 'Female', ethnicity: 'Asian', isFullTime: true, isShareholder: false,
    departmentId: 'hr', hireDate: '2021-05-20', birthDate: '1994-08-10',
    benefitsPlan: 'Standard',
    earnings: [
      { month: 1, year: 2025, basicSalary: 1900, overtime: 150, bonus: 200 },
      { month: 2, year: 2025, basicSalary: 1900, overtime: 130, bonus: 180 },
      { month: 1, year: 2024, basicSalary: 1700, overtime: 110, bonus: 160 },
    ],
    vacationDays: [
      { year: 2025, daysUsed: 5, daysAccumulated: 9 },
      { year: 2024, daysUsed: 7, daysAccumulated: 10 },
    ],
    benefits: [{ plan: 'Standard', amount: 165, year: 2025 }],
  },
];

export function getEmployeesByDepartment(departmentId: string | null): Employee[] {
  if (!departmentId) return employees;
  return employees.filter(e => e.departmentId === departmentId);
}

export function getTotalEarnings(emp: Employee, year?: number): number {
  const records = year ? emp.earnings.filter(e => e.year === year) : emp.earnings;
  return records.reduce((sum, e) => sum + e.basicSalary + e.overtime + e.bonus, 0);
}

export function getTotalVacationDays(emp: Employee, year?: number): number {
  const records = year ? emp.vacationDays.filter(v => v.year === year) : emp.vacationDays;
  return records.reduce((sum, v) => sum + v.daysUsed, 0);
}

export function getAverageBenefit(emp: Employee, year?: number): number {
  const records = year ? emp.benefits.filter(b => b.year === year) : emp.benefits;
  if (!records.length) return 0;
  return records.reduce((sum, b) => sum + b.amount, 0) / records.length;
}

export interface DeptStats {
  id: string;
  name: string;
  headCount: number;
  fullTime: number;
  shareholders: number;
  avgEarning: number;
}

export function getDeptStats(): DeptStats[] {
  return departments.map(dept => {
    const emps = employees.filter(e => e.departmentId === dept.id);
    const totalEarn = emps.reduce((s, e) => s + getTotalEarnings(e, 2025), 0);
    return {
      id: dept.id,
      name: dept.name,
      headCount: emps.length,
      fullTime: emps.filter(e => e.isFullTime).length,
      shareholders: emps.filter(e => e.isShareholder).length,
      avgEarning: emps.length ? Math.round(totalEarn / emps.length) : 0,
    };
  });
}
