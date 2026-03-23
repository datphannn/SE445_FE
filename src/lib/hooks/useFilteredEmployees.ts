import { useMemo } from 'react';
import { Employee } from '../types/employee';
import { FilterState } from '@/components/summary/FilterBar';

export function useFilteredEmployees(employees: Employee[], filter: FilterState): Employee[] {
  return useMemo(() => {
    return employees.filter(emp => {
      if (filter.shareholder !== 'all') {
        if (filter.shareholder === 'yes' && !emp.isShareholder) return false;
        if (filter.shareholder === 'no' && emp.isShareholder) return false;
      }
      if (filter.gender !== 'all' && emp.sex !== filter.gender) return false;
      if (filter.ethnicity !== 'all' && emp.ethnicity !== filter.ethnicity) return false;
      if (filter.employment !== 'all') {
        if (filter.employment === 'fulltime' && !emp.isFullTime) return false;
        if (filter.employment === 'parttime' && emp.isFullTime) return false;
      }
      return true;
    });
  }, [employees, filter]);
}
