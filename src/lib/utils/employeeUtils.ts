import { Employee, Department } from '../types/employee';

export interface DeptStats {
  id: string;
  name: string;
  headCount: number;
  fullTime: number;
  shareholders: number;
  avgEarning: number;
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

export function getDeptStats(departments: Department[], employees: Employee[]): DeptStats[] {
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
