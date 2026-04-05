'use client';
import { useState } from 'react';
import { Bell, BarChart3, Moon, Sun, Menu, LogOut, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDashboard } from '@/lib/hooks/useDashboard';
import { useAuth } from '@/lib/hooks/useAuth';
import { Employee } from '@/lib/types/employee';

function getAlertCount(alertConfig: { anniversaryDaysThreshold: number; vacationDaysThreshold: number }, employees: Employee[]) {
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
  const router = useRouter();
  const { user, logout } = useAuth();
  const {
    activeView, setActiveView,
    summaryTab, setSummaryTab,
    alertTab, setAlertTab,
    selectedDepartmentId, departments,
    alertConfig,
    isDark, toggleDark,
    setSidebarOpen, sidebarOpen,
    allEmployees,
  } = useDashboard();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const alertCount = getAlertCount(alertConfig, allEmployees);
  const selectedDept = departments.find(d => d.id === selectedDepartmentId);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
    admin:   { bg: '#fee2e2', text: '#b91c1c' },
    manager: { bg: '#dbeafe', text: '#1d4ed8' },
    viewer:  { bg: '#f0fdf4', text: '#15803d' },
  };
  const roleStyle = ROLE_COLORS[user?.role ?? 'viewer'];

  const summaryTabs = [
    { id: 'earnings', label: 'Earnings',     icon: '💰' },
    { id: 'vacation', label: 'Vacation Days', icon: '🏖️' },
    { id: 'benefits', label: 'Benefits',      icon: '🏥' },
  ] as const;

  const alertTabs = [
    { id: 'anniversary',     label: 'Anniversary',     icon: '🎂' },
    { id: 'vacation-cap',    label: 'Vacation Cap',    icon: '⚠️' },
    { id: 'benefits-change', label: 'Benefits Change', icon: '📋' },
    { id: 'birthdays',       label: 'Birthdays',       icon: '🎉' },
  ] as const;

  return (
    <header className="topnav anim-fade-in">
      <div className="topnav-top">
        {/* Mobile hamburger */}
        <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu size={18} />
        </button>

        {/* Breadcrumb */}
        <div className="breadcrumb topnav-breadcrumb">
          <BarChart3 size={14} className="bc-icon" />
          <span className="bc-company">ACME Company</span>
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
          {/* Dark mode */}
          <button className="icon-btn" onClick={toggleDark} title={isDark ? 'Light mode' : 'Dark mode'}>
            {isDark ? <Sun size={15} className="sun-icon" /> : <Moon size={15} className="moon-icon" />}
          </button>

          {/* Summary */}
          <button
            className={`nav-btn summary-btn ${activeView === 'summary' ? 'active' : ''}`}
            onClick={() => setActiveView(activeView === 'summary' ? 'employees' : 'summary')}
          >
            <BarChart3 size={13} /><span>Summary</span>
          </button>

          {/* Alert */}
          <button
            className={`nav-btn alert-btn ${activeView === 'alert' ? 'active' : ''}`}
            onClick={() => setActiveView(activeView === 'alert' ? 'employees' : 'alert')}
          >
            <Bell size={13} /><span>Alert</span>
            {alertCount > 0 && <span className="alert-badge">{alertCount}</span>}
          </button>

          {/* User menu */}
          {user && (
            <div className="user-menu-wrap">
              <button className="user-btn" onClick={() => setShowUserMenu(v => !v)}>
                <div className="user-avatar">{user.avatar}</div>
                <div className="user-info">
                  <span className="user-name">{user.name.split(' ').pop()}</span>
                  <span className="user-role" style={{ background: roleStyle.bg, color: roleStyle.text }}>{user.role}</span>
                </div>
                <ChevronDown size={12} className={`chevron ${showUserMenu ? 'open' : ''}`} />
              </button>

              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">{user.avatar}</div>
                    <div>
                      <p className="dropdown-name">{user.name}</p>
                      <p className="dropdown-email">{user.email}</p>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item logout" onClick={handleLogout}>
                    <LogOut size={13} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sub-tabs */}
      {activeView === 'summary' && (
        <div className="sub-tabs anim-fade-in">
          {summaryTabs.map(tab => (
            <button key={tab.id} className={`sub-tab ${summaryTab === tab.id ? 'active' : ''}`} onClick={() => setSummaryTab(tab.id)}>
              <span>{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>
      )}
      {activeView === 'alert' && (
        <div className="sub-tabs anim-fade-in">
          {alertTabs.map(tab => (
            <button key={tab.id} className={`sub-tab ${alertTab === tab.id ? 'active' : ''}`} onClick={() => setAlertTab(tab.id)}>
              <span>{tab.icon}</span><span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Close user menu on outside click */}
      {showUserMenu && <div className="menu-backdrop" onClick={() => setShowUserMenu(false)} />}

      <style jsx>{`
        .topnav {
          background: var(--topnav-bg); border-bottom: 1px solid var(--border);
          position: sticky; top: 0; z-index: 50;
          transition: background 0.2s ease, border-color 0.2s ease;
        }
        .topnav-top { display: flex; align-items: center; padding: 10px 20px; gap: 10px; }
        .mobile-menu-btn {
          display: none; align-items: center; justify-content: center;
          width: 34px; height: 34px; border-radius: 8px;
          border: 1px solid var(--border); background: var(--card-bg);
          cursor: pointer; color: var(--text-secondary); transition: all 0.13s; flex-shrink: 0;
        }
        .mobile-menu-btn:hover { border-color: var(--accent); color: var(--accent); }
        .breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--text-muted); }
        .bc-icon { color: var(--accent); }
        .bc-company { font-weight: 500; color: var(--text-secondary); }
        .bc-sep { color: var(--border-strong); }
        .bc-dept { color: var(--accent); font-weight: 500; }
        .topnav-title { display: flex; align-items: baseline; gap: 6px; flex: 1; }
        h1 { font-family: var(--font-display); font-size: 17px; font-weight: 700; color: var(--text-primary); margin: 0; }
        .title-sub { font-size: 12px; color: var(--text-muted); font-style: italic; }
        .nav-actions { display: flex; align-items: center; gap: 6px; }
        .icon-btn {
          width: 34px; height: 34px; border-radius: 8px;
          border: 1px solid var(--border); background: var(--card-bg);
          cursor: pointer; color: var(--text-secondary);
          display: flex; align-items: center; justify-content: center;
          transition: all 0.13s; flex-shrink: 0;
        }
        .icon-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--hover-bg); }
        .sun-icon { color: #f59e0b; }
        .moon-icon { color: #6366f1; }
        .nav-btn {
          display: flex; align-items: center; gap: 5px; padding: 6px 13px;
          border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;
          border: 1px solid var(--border); background: var(--card-bg);
          color: var(--text-secondary); transition: all 0.13s;
          font-family: var(--font-body); position: relative; white-space: nowrap;
        }
        .nav-btn:hover { background: var(--hover-bg); color: var(--text-primary); }
        .summary-btn.active { background: var(--accent); color: white; border-color: var(--accent); }
        .alert-btn.active  { background: var(--danger); color: white; border-color: var(--danger); }
        .alert-badge { background: var(--danger); color: white; border-radius: 10px; font-size: 9px; font-weight: 700; padding: 1px 5px; }
        .alert-btn.active .alert-badge { background: rgba(255,255,255,0.3); }

        /* User menu */
        .user-menu-wrap { position: relative; }
        .user-btn {
          display: flex; align-items: center; gap: 7px; padding: 5px 10px 5px 5px;
          border: 1px solid var(--border); border-radius: 8px; background: var(--card-bg);
          cursor: pointer; transition: all 0.13s;
        }
        .user-btn:hover { border-color: var(--accent); background: var(--hover-bg); }
        .user-avatar {
          width: 28px; height: 28px; border-radius: 7px;
          background: linear-gradient(135deg, #1e40af, #3b82f6);
          color: white; font-size: 10px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display); flex-shrink: 0;
        }
        .user-info { display: flex; flex-direction: column; align-items: flex-start; gap: 2px; }
        .user-name { font-size: 11px; font-weight: 600; color: var(--text-primary); line-height: 1; }
        .user-role { font-size: 9px; font-weight: 700; padding: 1px 5px; border-radius: 8px; line-height: 1.4; }
        .chevron { color: var(--text-muted); transition: transform 0.2s; }
        .chevron.open { transform: rotate(180deg); }
        .user-dropdown {
          position: absolute; top: calc(100% + 6px); right: 0;
          width: 220px; background: var(--card-bg);
          border: 1px solid var(--border); border-radius: 10px;
          box-shadow: var(--shadow-lg); z-index: 200;
          animation: dropIn 0.15s cubic-bezier(0.16,1,0.3,1);
        }
        @keyframes dropIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        .dropdown-header { display: flex; align-items: center; gap: 10px; padding: 14px 14px 12px; }
        .dropdown-avatar {
          width: 36px; height: 36px; border-radius: 9px; flex-shrink: 0;
          background: linear-gradient(135deg, #1e40af, #3b82f6);
          color: white; font-size: 13px; font-weight: 700;
          display: flex; align-items: center; justify-content: center; font-family: var(--font-display);
        }
        .dropdown-name { font-size: 13px; font-weight: 600; color: var(--text-primary); margin: 0; }
        .dropdown-email { font-size: 11px; color: var(--text-muted); margin: 0; }
        .dropdown-divider { height: 1px; background: var(--border); }
        .dropdown-item {
          display: flex; align-items: center; gap: 8px; width: 100%;
          padding: 10px 14px; font-size: 12px; font-weight: 500;
          background: none; border: none; cursor: pointer;
          color: var(--text-secondary); font-family: var(--font-body);
          transition: background 0.12s; text-align: left;
        }
        .dropdown-item:hover { background: var(--hover-bg); }
        .dropdown-item.logout { color: var(--danger); }
        .dropdown-item.logout:hover { background: var(--danger-subtle); }
        .menu-backdrop { position: fixed; inset: 0; z-index: 199; }

        /* Sub-tabs */
        .sub-tabs { display: flex; gap: 2px; padding: 0 20px; border-top: 1px solid var(--border); overflow-x: auto; }
        .sub-tab {
          display: flex; align-items: center; gap: 5px; padding: 8px 13px;
          font-size: 12px; font-weight: 500; color: var(--text-muted);
          background: none; border: none; cursor: pointer;
          border-bottom: 2px solid transparent; margin-bottom: -1px;
          transition: all 0.13s; font-family: var(--font-body); white-space: nowrap;
        }
        .sub-tab:hover { color: var(--text-primary); }
        .sub-tab.active { color: var(--accent); border-bottom-color: var(--accent); }

        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
          .topnav-breadcrumb { display: none !important; }
          .nav-btn span { display: none; }
          .nav-btn { padding: 6px 9px; }
          .user-info { display: none; }
          .topnav-top { padding: 10px 12px; }
          .sub-tabs { padding: 0 10px; }
          .tab-label { display: none; }
        }
      `}</style>
    </header>
  );
}
