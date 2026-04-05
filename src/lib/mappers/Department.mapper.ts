import { Department } from "../types/employee";

export const mapDepartment = (item: any): Department => ({
  id: String(item.departmentId || item.department_id),
  name: item.departmentName || item.department_name,
  headCount: item.headCount || item.head_count,
});

export const mapDepartmentList = (data: any[]): Department[] =>
  data.map(mapDepartment);