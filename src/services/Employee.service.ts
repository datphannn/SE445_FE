import api from "./Axios.service";
import { mapEmployeeList } from "../lib/mappers/Employee.mapper";

export const getEmployees = async () => {
    const res = await api.get("/employees");
    const data = res.data?.data ?? res.data;

    if (!Array.isArray(data)) {
        console.warn("Unexpected employees response:", data);
        return [];
    }

    console.log("Fetched employees:", data);
    return mapEmployeeList(data);
};