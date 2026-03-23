'use client';
import { useState, useEffect } from 'react';
import { ChevronRight, Building2, LayoutGrid, TrendingUp, Star, X } from 'lucide-react';
import { useDashboard } from '@/lib/hooks/useDashboard';
import { getDeptStats, DeptStats } from '@/lib/data/mockData';

const DEPT_ICONS: Record<string, string> = {
  sales: '📊', marketing: '📣', hr: '👥',
  finance: '💰', engineering: '⚙️', operations: '🔧',
};

export default function DrillDownSidebar() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [hoveredDept, setHoveredDept] = useState<string | null>(null);
  const [deptStats, setDeptStats] = useState<DeptStats[]>([]);
  const { departments, selectedDepartmentId, setSelectedDepartmentId, setActiveView, allEmployees, sidebarOpen, setSidebarOpen } = useDashboard();

  useEffect(() => { setDeptStats(getDeptStats()); }, []);

  const handleSelectDept = (id: string | null) => {
    setSelectedDepartmentId(id);
    setActiveView('employees');
    setSidebarOpen(false); // close on mobile after selection
  };

  const totalShareholders = allEmployees.filter(e => e.isShareholder).length;

  return (
    <aside className={`sidebar anim-slide-left ${sidebarOpen ? 'mobile-open' : ''}`}>
      {/* Logo + mobile close btn */}
      <div className="sidebar-logo">
        <div className="logo-mark"><span>A</span></div>
        <div className="logo-text">
          <p className="logo-company">ACME</p>
          <p className="logo-tagline">Company</p>
        </div>
        <button className="mobile-close" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
          <X size={15} />
        </button>
      </div>

      {/* Stats strip */}
      <div className="company-stats">
        <div className="stat-pill">
          <span>👥</span>
          <span>{allEmployees.length} staff</span>
        </div>
        <div className="stat-pill shareholder">
          <Star size={9} />
          <span>{totalShareholders} holders</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="nav">
        <p className="nav-section-label">ORGANIZATION</p>

        <div
          className={`nav-root ${!selectedDepartmentId ? 'active' : ''}`}
          onClick={() => handleSelectDept(null)}
        >
          <Building2 size={13} />
          <span>All Departments</span>
          <button
            className={`chevron-btn ${isExpanded ? 'open' : ''}`}
            onClick={e => { e.stopPropagation(); setIsExpanded(v => !v); }}
          >
            <ChevronRight size={11} />
          </button>
        </div>

        <div className={`dept-tree ${isExpanded ? 'open' : ''}`}>
          <div className="dept-tree-inner">
            {departments.map((dept, i) => {
              const stats = deptStats.find(s => s.id === dept.id);
              const isActive = selectedDepartmentId === dept.id;
              const isHovered = hoveredDept === dept.id;
              return (
                <div
                  key={dept.id}
                  className={`dept-item ${isActive ? 'active' : ''}`}
                  style={{ animationDelay: `${i * 50}ms` }}
                  onClick={() => handleSelectDept(dept.id)}
                  onMouseEnter={() => setHoveredDept(dept.id)}
                  onMouseLeave={() => setHoveredDept(null)}
                >
                  <div className="tree-line">
                    <div className="tree-vert" />
                    <div className="tree-horiz" />
                  </div>
                  <div className="dept-content">
                    <div className="dept-main">
                      <span className="dept-icon">{DEPT_ICONS[dept.id] || '🏢'}</span>
                      <span className="dept-name">{dept.name.replace(' Department', '')}</span>
                      {stats && <span className="dept-count">{stats.headCount}</span>}
                    </div>
                    {stats && (isActive || isHovered) && (
                      <div className="dept-stats">
                        <div className="dept-stat"><LayoutGrid size={9} /><span>{stats.fullTime} FT</span></div>
                        <div className="dept-stat"><Star size={9} /><span>{stats.shareholders} SH</span></div>
                        <div className="dept-stat earn"><TrendingUp size={9} /><span>${(stats.avgEarning / 1000).toFixed(1)}k avg</span></div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="footer-label">HR Dashboard v2.0</div>
      </div>

      <style jsx>{`
        .sidebar {
          width: 210px; min-width: 210px;
          background: var(--sidebar-bg);
          border-right: 1px solid var(--border);
          display: flex; flex-direction: column;
          height: 100vh; position: sticky; top: 0;
          overflow-y: auto; overflow-x: hidden;
          transition: background 0.2s ease, border-color 0.2s ease;
        }
        .sidebar-logo {
          display: flex; align-items: center; gap: 10px;
          padding: 16px 14px 12px;
          border-bottom: 1px solid var(--border);
        }
        .logo-mark {
          width: 32px; height: 32px;
          background: linear-gradient(135deg, #1e40af, #3b82f6);
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display); font-weight: 700; font-size: 17px; color: white;
          box-shadow: 0 2px 8px rgba(59,130,246,0.35); flex-shrink: 0;
        }
        .logo-company { font-family: var(--font-display); font-size: 14px; font-weight: 700; color: var(--text-primary); line-height: 1; }
        .logo-tagline { font-size: 9px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; margin-top: 2px; }
        .logo-text { flex: 1; }
        .mobile-close {
          display: none;
          width: 28px; height: 28px; border-radius: 6px;
          border: 1px solid var(--border); background: none; cursor: pointer;
          color: var(--text-muted); align-items: center; justify-content: center;
          transition: all 0.13s;
        }
        .mobile-close:hover { border-color: var(--danger); color: var(--danger); }
        .company-stats {
          display: flex; gap: 6px; padding: 8px 14px;
          background: var(--hover-bg); border-bottom: 1px solid var(--border);
        }
        .stat-pill {
          display: flex; align-items: center; gap: 4px;
          font-size: 10px; color: var(--text-muted);
          background: var(--card-bg); border: 1px solid var(--border);
          padding: 3px 7px; border-radius: 20px; font-family: var(--font-body);
        }
        .stat-pill.shareholder { color: var(--warning); border-color: var(--border); background: var(--warning-subtle); }
        .nav { flex: 1; padding: 10px 0 8px; overflow: hidden; }
        .nav-section-label { font-size: 9px; font-weight: 700; color: var(--text-muted); letter-spacing: 0.12em; padding: 0 14px; margin-bottom: 6px; }
        .nav-root {
          display: flex; align-items: center; gap: 7px; padding: 8px 14px;
          font-size: 12px; font-weight: 600; color: var(--text-secondary);
          cursor: pointer; transition: all 0.13s; font-family: var(--font-body);
        }
        .nav-root:hover { color: var(--text-primary); background: var(--hover-bg); }
        .nav-root.active { color: var(--accent); }
        .chevron-btn {
          margin-left: auto; background: none; border: none; cursor: pointer;
          color: var(--text-muted); display: flex; align-items: center; padding: 2px;
          border-radius: 4px; transition: transform 0.2s ease, color 0.13s;
        }
        .chevron-btn.open { transform: rotate(90deg); color: var(--accent); }
        .dept-tree { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.25s ease; }
        .dept-tree.open { grid-template-rows: 1fr; }
        .dept-tree-inner { overflow: hidden; padding: 0 0 4px; }
        .dept-item {
          display: flex; align-items: flex-start;
          padding: 0 10px 0 14px; cursor: pointer;
          transition: background 0.12s;
          animation: fadeSlideIn 0.2s ease both;
        }
        .dept-item:hover { background: var(--hover-bg); }
        .dept-item.active { background: var(--accent-subtle); }
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
        .tree-line { display: flex; flex-direction: column; align-items: center; width: 14px; flex-shrink: 0; padding-top: 12px; margin-right: 6px; }
        .tree-vert { width: 1px; height: 6px; background: var(--border); }
        .tree-horiz { width: 8px; height: 1px; background: var(--border); align-self: flex-end; }
        .dept-item.active .tree-vert, .dept-item.active .tree-horiz { background: var(--accent); opacity: 0.5; }
        .dept-content { flex: 1; min-width: 0; padding: 7px 0; border-bottom: 1px solid transparent; transition: border-color 0.12s; }
        .dept-item:not(:last-child) .dept-content { border-bottom-color: var(--border); }
        .dept-main { display: flex; align-items: center; gap: 6px; }
        .dept-icon { font-size: 12px; line-height: 1; }
        .dept-name {
          font-size: 11.5px; font-weight: 500; color: var(--text-secondary);
          flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          font-family: var(--font-body); transition: color 0.12s;
        }
        .dept-item.active .dept-name { color: var(--accent); font-weight: 600; }
        .dept-item:hover .dept-name { color: var(--text-primary); }
        .dept-count {
          font-size: 9px; font-weight: 700; background: var(--code-bg);
          color: var(--text-muted); padding: 1px 5px; border-radius: 8px;
          font-family: var(--font-mono);
        }
        .dept-item.active .dept-count { background: var(--accent-subtle); color: var(--accent); }
        .dept-stats { display: flex; gap: 8px; margin-top: 5px; animation: statsIn 0.15s ease; }
        @keyframes statsIn { from { opacity: 0; transform: translateY(-3px); } to { opacity: 1; transform: translateY(0); } }
        .dept-stat { display: flex; align-items: center; gap: 3px; font-size: 9px; color: var(--text-muted); font-family: var(--font-mono); }
        .dept-stat.earn { color: var(--success); }
        .sidebar-footer { padding: 10px 14px; border-top: 1px solid var(--border); }
        .footer-label { font-size: 9px; color: var(--text-muted); letter-spacing: 0.05em; }

        @media (max-width: 768px) {
          .mobile-close { display: flex; }
        }
      `}</style>
    </aside>
  );
}
