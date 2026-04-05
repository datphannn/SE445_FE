import { Employee } from "../types/employee";

export const mapEmployee = (item: any): Employee => ({
    id: String(item.id || item.employeeId || item.employee_id),
    firstName: item.firstName || item.first_name,
    lastName: item.lastName || item.last_name,
    sex: item.sex,
    ethnicity: item.ethnicity,
    isFullTime: item.isFullTime ?? item.is_full_time ?? false,
    isShareholder: item.isShareholder ?? item.is_shareholder ?? false,
    departmentId: item.departmentId || item.department_id,
    hireDate: item.hireDate || item.hire_date,
    birthDate: item.birthDate || item.birth_date,
    benefitsPlan: item.benefitsPlan || item.benefits_plan,
    earnings: item.earnings || [],
    vacationDays: item.vacationDays || item.vacation_days || [],
    benefits: item.benefits || [],
});

export const mapEmployeeList = (data: any[]): Employee[] =>
    data.map(mapEmployee);
