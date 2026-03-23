'use client';
import { Bell, BarChart3, Moon, Sun, Menu } from 'lucide-react';
import { useDashboard } from '@/lib/hooks/useDashboard';
import { employees } from '@/lib/data/mockData';

function getAlertCount(alertConfig: { anniversaryDaysThreshold: number; vacationDaysThreshold: number }) {
  const today = new Date();
  const currentMonth = today.getMonth();
  let count = 0;
  employees.forEach(emp => {
    const hire = new Date(emp.hireDate);
    const nextAnniv = new Date(today.getFullYear(), hire.getMonth(), hire.getDate());
    if (nextAnniv < today) nextAnniv.setFullYear(today.getFullYear() + 1);
    const daysToAnniv = Math.ceil((nextAnniv.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysToAnniv <= alertConfig.anniversaryDaysThreshold) count++;
    const currentVac = emp.vacationDays.find(v => v.year === 2025);
    if (currentVac && currentVac.daysAccumulated > alertConfig.vacationDaysThreshold) count++;
    const birth = new Date(emp.birthDate);
    if (birth.getMonth() === currentMonth) count++;
    const hasChange = emp.benefits.some(b => b.affectsPayroll);
    if (hasChange) count++;
  });
  return count;
}

export default function TopNav() {
  const {
    activeView, setActiveView,
    summaryTab, setSummaryTab,
    alertTab, setAlertTab,
    selectedDepartmentId, departments,
    alertConfig,
    isDark, toggleDark,
    setSidebarOpen, sidebarOpen,
  } = useDashboard();

  const alertCount = getAlertCount(alertConfig);
  const selectedDept = departments.find(d => d.id === selectedDepartmentId);

  const summaryTabs = [
    { id: 'earnings',  label: 'Earnings',      icon: '💰' },
    { id: 'vacation',  label: 'Vacation Days',  icon: '🏖️' },
    { id: 'benefits',  label: 'Benefits',       icon: '🏥' },
  ] as const;

  const alertTabs = [
    { id: 'anniversary',      label: 'Anniversary',     icon: '🎂' },
    { id: 'vacation-cap',     label: 'Vacation Cap',    icon: '⚠️' },
    { id: 'benefits-change',  label: 'Benefits Change', icon: '📋' },
    { id: 'birthdays',        label: 'Birthdays',       icon: '🎉' },
  ] as const;

  return (
    <header className="topnav anim-fade-in">
      <div className="topnav-top">
        {/* Mobile hamburger */}
        <button
          className="mobile-menu-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </button>

        {/* Breadcrumb */}
        <div className="breadcrumb topnav-breadcrumb">
          <BarChart3 size={14} className="bc-icon" />
          <span className="bc-company">ACEM Company</span>
          {selectedDept && (
            <>
              <span className="bc-sep">/</span>
              <span className="bc-dept">{selectedDept.name}</span>
            </>
          )}
        </div>

        {/* Title */}
        <div className="topnav-title">
          <h1>Dashboard</h1>
          {selectedDept && <span className="title-sub">— {selectedDept.name.replace(' Department', '')}</span>}
        </div>

        {/* Right actions */}
        <div className="nav-actions">
          {/* Dark mode toggle */}
          <button
            className="icon-btn dark-toggle"
            onClick={toggleDark}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark
              ? <Sun size={15} className="sun-icon" />
              : <Moon size={15} className="moon-icon" />
            }
          </button>

          {/* Summary */}
          <button
            className={`nav-btn summary-btn ${activeView === 'summary' ? 'active' : ''}`}
            onClick={() => setActiveView(activeView === 'summary' ? 'employees' : 'summary')}
          >
            <BarChart3 size={13} />
            <span>Summary</span>
          </button>

          {/* Alert */}
          <button
            className={`nav-btn alert-btn ${activeView === 'alert' ? 'active' : ''}`}
            onClick={() => setActiveView(activeView === 'alert' ? 'employees' : 'alert')}
          >
            <Bell size={13} />
            <span>Alert</span>
            {alertCount > 0 && <span className="alert-badge">{alertCount}</span>}
          </button>
        </div>
      </div>

      {/* Sub-tabs */}
      {activeView === 'summary' && (
        <div className="sub-tabs anim-fade-in">
          {summaryTabs.map(tab => (
            <button
              key={tab.id}
              className={`sub-tab ${summaryTab === tab.id ? 'active' : ''}`}
              onClick={() => setSummaryTab(tab.id)}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      )}
      {activeView === 'alert' && (
        <div className="sub-tabs anim-fade-in">
          {alertTabs.map(tab => (
            <button
              key={tab.id}
              className={`sub-tab ${alertTab === tab.id ? 'active' : ''}`}
              onClick={() => setAlertTab(tab.id)}
            >
              <span>{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      )}

      <style jsx>{`
        .topnav {
          background: var(--topnav-bg);
          border-bottom: 1px solid var(--border);
          position: sticky; top: 0; z-index: 50;
          transition: background 0.2s ease, border-color 0.2s ease;
        }
        .topnav-top {
          display: flex; align-items: center; padding: 10px 20px; gap: 12px;
        }
        .mobile-menu-btn {
          display: none;
          align-items: center; justify-content: center;
          width: 34px; height: 34px; border-radius: 8px;
          border: 1px solid var(--border); background: var(--card-bg);
          cursor: pointer; color: var(--text-secondary);
          transition: all 0.13s; flex-shrink: 0;
        }
        .mobile-menu-btn:hover { border-color: var(--accent); color: var(--accent); }
        .breadcrumb {
          display: flex; align-items: center; gap: 6px;
          font-size: 11px; color: var(--text-muted);
        }
        .bc-icon { color: var(--accent); }
        .bc-company { font-weight: 500; color: var(--text-secondary); }
        .bc-sep { color: var(--border-strong); }
        .bc-dept { color: var(--accent); font-weight: 500; }
        .topnav-title {
          display: flex; align-items: baseline; gap: 6px; flex: 1;
        }
        h1 {
          font-family: var(--font-display);
          font-size: 17px; font-weight: 700;
          color: var(--text-primary); margin: 0;
        }
        .title-sub { font-size: 12px; color: var(--text-muted); font-style: italic; }
        .nav-actions { display: flex; align-items: center; gap: 6px; }
        .icon-btn {
          width: 34px; height: 34px; border-radius: 8px;
          border: 1px solid var(--border); background: var(--card-bg);
          cursor: pointer; color: var(--text-secondary);
          display: flex; align-items: center; justify-content: center;
          transition: all 0.13s; flex-shrink: 0;
        }
        .icon-btn:hover { border-color: var(--accent); color: var(--accent); }
        .sun-icon { color: #f59e0b; }
        .moon-icon { color: #6366f1; }
        .dark-toggle:hover { background: var(--hover-bg); }
        .nav-btn {
          display: flex; align-items: center; gap: 5px;
          padding: 6px 13px; border-radius: 6px;
          font-size: 12px; font-weight: 600; cursor: pointer;
          border: 1px solid var(--border); background: var(--card-bg);
          color: var(--text-secondary); transition: all 0.13s;
          font-family: var(--font-body); position: relative; white-space: nowrap;
        }
        .nav-btn:hover { background: var(--hover-bg); color: var(--text-primary); }
        .summary-btn.active { background: var(--accent); color: white; border-color: var(--accent); }
        .alert-btn.active  { background: var(--danger); color: white; border-color: var(--danger); }
        .alert-badge {
          background: var(--danger); color: white;
          border-radius: 10px; font-size: 9px; font-weight: 700;
          padding: 1px 5px; min-width: 16px; text-align: center;
        }
        .alert-btn.active .alert-badge { background: rgba(255,255,255,0.3); }
        .sub-tabs {
          display: flex; gap: 2px; padding: 0 20px;
          border-top: 1px solid var(--border); overflow-x: auto;
        }
        .sub-tab {
          display: flex; align-items: center; gap: 5px;
          padding: 8px 13px; font-size: 12px; font-weight: 500;
          color: var(--text-muted); background: none; border: none;
          cursor: pointer; border-bottom: 2px solid transparent;
          margin-bottom: -1px; transition: all 0.13s;
          font-family: var(--font-body); white-space: nowrap;
        }
        .sub-tab:hover { color: var(--text-primary); }
        .sub-tab.active { color: var(--accent); border-bottom-color: var(--accent); }

        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
          .topnav-breadcrumb { display: none !important; }
          .nav-btn span { display: none; }
          .nav-btn { padding: 6px 10px; }
          .topnav-top { padding: 10px 14px; }
          .sub-tabs { padding: 0 10px; }
          .tab-label { display: none; }
        }
      `}</style>
    </header>
  );
}
