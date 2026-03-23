'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Employee, Department, AlertConfig } from '../types/employee';
import { employees as allEmployees, departments as allDepartments, getEmployeesByDepartment } from '../data/mockData';

type ActiveView = 'employees' | 'summary' | 'alert';
type SummaryTab = 'earnings' | 'vacation' | 'benefits';
type AlertTab = 'anniversary' | 'vacation-cap' | 'benefits-change' | 'birthdays';

interface DashboardContextType {
  selectedDepartmentId: string | null;
  setSelectedDepartmentId: (id: string | null) => void;
  departments: Department[];
  filteredEmployees: Employee[];
  allEmployees: Employee[];

  activeView: ActiveView;
  setActiveView: (v: ActiveView) => void;
  summaryTab: SummaryTab;
  setSummaryTab: (t: SummaryTab) => void;
  alertTab: AlertTab;
  setAlertTab: (t: AlertTab) => void;

  alertConfig: AlertConfig;
  setAlertConfig: (c: AlertConfig) => void;

  // Sprint 5: dark mode + mobile sidebar
  isDark: boolean;
  toggleDark: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>('employees');
  const [summaryTab, setSummaryTab] = useState<SummaryTab>('earnings');
  const [alertTab, setAlertTab] = useState<AlertTab>('anniversary');
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    anniversaryDaysThreshold: 30,
    vacationDaysThreshold: 20,
  });
  const [isDark, setIsDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Persist dark mode in localStorage
  useEffect(() => {
    const saved = localStorage.getItem('acem-dark-mode');
    if (saved === 'true') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDark = () => {
    setIsDark(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('acem-dark-mode', 'true');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('acem-dark-mode', 'false');
      }
      return next;
    });
  };

  const filteredEmployees = getEmployeesByDepartment(selectedDepartmentId);

  return (
    <DashboardContext.Provider value={{
      selectedDepartmentId, setSelectedDepartmentId,
      departments: allDepartments,
      filteredEmployees, allEmployees,
      activeView, setActiveView,
      summaryTab, setSummaryTab,
      alertTab, setAlertTab,
      alertConfig, setAlertConfig,
      isDark, toggleDark,
      sidebarOpen, setSidebarOpen,
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider');
  return ctx;
}
