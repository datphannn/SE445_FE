import { Employee, BenefitsPlan } from "../types/employee";

export const mapEmployee = (item: any): Employee => {
    const rawBenefits = item.benefits || [];

    const mappedBenefits = rawBenefits.map((b: any) => {
        let mappedPlan: BenefitsPlan = 'Basic';
        if (b.plan === 'Dental Plan') mappedPlan = 'Standard';
        else if (b.plan === 'Health Insurance') mappedPlan = 'Premium';
        else if (b.plan === 'Retirement Plan') mappedPlan = 'Executive';

        return {
            ...b,
            plan: mappedPlan,
            year: b.year === 2024 ? 2025 : b.year
        };
    });

    const mappedBenefitsPlan = item.benefitsPlan || item.benefits_plan || (mappedBenefits.length > 0 ? mappedBenefits[0].plan : 'Basic');

    return {
        id: String(item.id || item.employeeId || item.employee_id),
        firstName: item.firstName || item.first_name,
        lastName: item.lastName || item.last_name,
        sex: item.sex,
        ethnicity: item.ethnicity,
        isFullTime: item.isFullTime ?? item.is_full_time ?? false,
        isShareholder: item.isShareholder ?? item.is_shareholder ?? false,
        departmentId: String(item.departmentId || item.department_id),
        hireDate: item.hireDate || item.hire_date,
        birthDate: item.birthDate || item.birth_date,
        benefitsPlan: mappedBenefitsPlan,
        earnings: item.earnings || [],
        vacationDays: item.vacationDays || item.vacation_days || [],
        benefits: mappedBenefits,
    };
};

export const mapEmployeeList = (data: any[]): Employee[] =>
    data.map(mapEmployee);
