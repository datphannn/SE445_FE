// services/department.service.ts
import api from "./Axios.service";
import { mapDepartmentList } from "../lib/mappers/Department.mapper";

export const getDepartments = async () => {
  const res = await api.get("/departments");
  const data = res.data?.data ?? res.data;

  if (!Array.isArray(data)) {
    console.warn("Unexpected departments response:", data);
    return [];
  }

  console.log("Fetched departments:", data);
  return mapDepartmentList(data);
};