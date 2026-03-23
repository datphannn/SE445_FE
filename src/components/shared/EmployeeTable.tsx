'use client';
import { useState, useMemo } from 'react';
import {
  Search, ArrowUpDown, ChevronDown, X,
  User, Briefcase, Calendar, Star, TrendingUp, Clock, Heart
} from 'lucide-react';
import { useDashboard } from '@/lib/hooks/useDashboard';
import { Employee } from '@/lib/types/employee';
import { getTotalEarnings, getTotalVacationDays, getAverageBenefit, departments } from '@/lib/data/mockData';

const CURRENT_YEAR = 2025;
const PAGE_SIZE = 8;

type SortKey = 'id' | 'firstName' | 'lastName' | 'sex' | 'ethnicity' | 'isFullTime' | 'totalEarning' | 'totalDayoffs' | 'avgBenefit';

type EnrichedEmployee = Employee & {
  totalEarning: number;
  totalDayoffs: number;
  avgBenefit: number;
};

// ─── Stat Card ────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; color: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: color + '18', color }}>{icon}</div>
      <div>
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
        {sub && <p className="stat-sub">{sub}</p>}
      </div>
      <style jsx>{`
        .stat-card {
          background: var(--card-bg); border: 1px solid var(--border);
          border-radius: 10px; padding: 14px 16px;
          display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0;
        }
        .stat-icon {
          width: 36px; height: 36px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .stat-label { font-size: 10px; color: var(--text-muted); font-weight: 500; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 2px; }
        .stat-value { font-family: var(--font-display); font-size: 18px; color: var(--text-primary); line-height: 1; }
        .stat-sub { font-size: 10px; color: var(--text-muted); margin-top: 2px; }
      `}</style>
    </div>
  );
}

// ─── Employee Detail Drawer ────────────────────────────────────
function EmployeeDrawer({ emp, onClose }: { emp: EnrichedEmployee; onClose: () => void }) {
  const dept = departments.find(d => d.id === emp.departmentId);
  const hireDate = new Date(emp.hireDate);
  const birthDate = new Date(emp.birthDate);
  const yearsAtCompany = new Date().getFullYear() - hireDate.getFullYear();

  const currentVac = emp.vacationDays.find(v => v.year === CURRENT_YEAR);

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-avatar">
            {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
          </div>
          <div className="drawer-title">
            <h2>{emp.firstName} {emp.lastName}</h2>
            <p>{dept?.name ?? emp.departmentId} · #{emp.id}</p>
          </div>
          <button className="close-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="drawer-body">
          {/* Badges */}
          <div className="badge-row">
            <span className={`badge ${emp.isShareholder ? 'badge-gold' : 'badge-gray'}`}>
              <Star size={10} /> {emp.isShareholder ? 'Shareholder' : 'Non-Shareholder'}
            </span>
            <span className={`badge ${emp.isFullTime ? 'badge-blue' : 'badge-orange'}`}>
              <Briefcase size={10} /> {emp.isFullTime ? 'Full-Time' : 'Part-Time'}
            </span>
            <span className="badge badge-purple">
              <Heart size={10} /> {emp.benefitsPlan}
            </span>
          </div>

          {/* Info Grid */}
          <div className="info-grid">
            <InfoRow icon={<User size={12} />} label="Gender" value={emp.sex} />
            <InfoRow icon={<User size={12} />} label="Ethnicity" value={emp.ethnicity} />
            <InfoRow icon={<Calendar size={12} />} label="Hire Date" value={hireDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} />
            <InfoRow icon={<Calendar size={12} />} label="Birthday" value={birthDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
            <InfoRow icon={<Clock size={12} />} label="Tenure" value={`${yearsAtCompany} year${yearsAtCompany !== 1 ? 's' : ''}`} />
          </div>

          {/* Earnings breakdown */}
          <div className="drawer-section">
            <p className="section-title">2025 Earnings Breakdown</p>
            <div className="earn-bars">
              {emp.earnings.filter(e => e.year === CURRENT_YEAR).map(e => {
                const total = e.basicSalary + e.overtime + e.bonus;
                return (
                  <div key={`${e.month}-${e.year}`} className="earn-month">
                    <div className="earn-label">M{e.month}</div>
                    <div className="bar-stack">
                      <div className="bar-seg basic" style={{ width: `${(e.basicSalary / total) * 100}%` }} title={`Basic: $${e.basicSalary}`} />
                      <div className="bar-seg ot" style={{ width: `${(e.overtime / total) * 100}%` }} title={`OT: $${e.overtime}`} />
                      <div className="bar-seg bonus" style={{ width: `${(e.bonus / total) * 100}%` }} title={`Bonus: $${e.bonus}`} />
                    </div>
                    <div className="earn-total">${total.toLocaleString()}</div>
                  </div>
                );
              })}
            </div>
            <div className="earn-legend">
              <span><span className="dot basic" />Basic</span>
              <span><span className="dot ot" />Overtime</span>
              <span><span className="dot bonus" />Bonus</span>
            </div>
          </div>

          {/* Vacation */}
          <div className="drawer-section">
            <p className="section-title">2025 Vacation Days</p>
            <div className="vac-row">
              <div className="vac-used">
                <span className="vac-num">{currentVac?.daysUsed ?? 0}</span>
                <span className="vac-lab">Used</span>
              </div>
              <div className="vac-bar-wrap">
                <div className="vac-bar-bg">
                  <div
                    className="vac-bar-fill"
                    style={{ width: `${Math.min(100, ((currentVac?.daysUsed ?? 0) / Math.max(1, currentVac?.daysAccumulated ?? 1)) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="vac-accum">
                <span className="vac-num">{currentVac?.daysAccumulated ?? 0}</span>
                <span className="vac-lab">Accumulated</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .drawer-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.18);
          z-index: 200; display: flex; justify-content: flex-end;
          animation: overlayIn 0.18s ease;
        }
        @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
        .drawer {
          width: 380px; max-width: 95vw;
          background: var(--card-bg); height: 100%; overflow-y: auto;
          box-shadow: -8px 0 32px rgba(0,0,0,0.12);
          animation: drawerIn 0.22s cubic-bezier(0.16,1,0.3,1);
          display: flex; flex-direction: column;
        }
        @keyframes drawerIn { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .drawer-header {
          display: flex; align-items: center; gap: 12px;
          padding: 20px 20px 16px; border-bottom: 1px solid var(--border);
          background: linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%);
          flex-shrink: 0;
        }
        .drawer-avatar {
          width: 44px; height: 44px; border-radius: 12px;
          background: linear-gradient(135deg, #1e40af, #3b82f6);
          color: white; font-family: var(--font-display); font-size: 16px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .drawer-title { flex: 1; min-width: 0; }
        .drawer-title h2 {
          font-family: var(--font-display); font-size: 16px;
          color: var(--text-primary); margin: 0 0 2px;
        }
        .drawer-title p { font-size: 11px; color: var(--text-muted); margin: 0; }
        .close-btn {
          background: none; border: none; cursor: pointer; color: var(--text-muted);
          display: flex; align-items: center; padding: 6px; border-radius: 6px;
          transition: background 0.12s;
        }
        .close-btn:hover { background: var(--hover-bg); color: var(--text-primary); }
        .drawer-body { flex: 1; padding: 16px 20px; display: flex; flex-direction: column; gap: 16px; }
        .badge-row { display: flex; gap: 6px; flex-wrap: wrap; }
        .badge {
          display: flex; align-items: center; gap: 4px;
          font-size: 10px; font-weight: 600; padding: 3px 8px; border-radius: 20px;
          font-family: var(--font-body);
        }
        .badge-gold { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }
        .badge-gray { background: #f4f3f0; color: #78716c; border: 1px solid var(--border); }
        .badge-blue { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
        .badge-orange { background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; }
        .badge-purple { background: #faf5ff; color: #7c3aed; border: 1px solid #ddd6fe; }
        .info-grid { display: flex; flex-direction: column; gap: 0; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
        .drawer-section { display: flex; flex-direction: column; gap: 10px; }
        .section-title { font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; }
        .earn-bars { display: flex; flex-direction: column; gap: 6px; }
        .earn-month { display: flex; align-items: center; gap: 8px; }
        .earn-label { font-size: 10px; color: var(--text-muted); width: 20px; font-family: var(--font-mono); }
        .bar-stack { flex: 1; height: 14px; display: flex; border-radius: 4px; overflow: hidden; }
        .bar-seg { height: 100%; transition: width 0.5s ease; }
        .bar-seg.basic { background: #3b82f6; }
        .bar-seg.ot { background: #f59e0b; }
        .bar-seg.bonus { background: #10b981; }
        .earn-total { font-size: 10px; font-family: var(--font-mono); color: var(--text-muted); width: 55px; text-align: right; }
        .earn-legend { display: flex; gap: 12px; }
        .earn-legend span { display: flex; align-items: center; gap: 4px; font-size: 10px; color: var(--text-muted); }
        .dot { width: 8px; height: 8px; border-radius: 2px; display: inline-block; }
        .dot.basic { background: #3b82f6; }
        .dot.ot { background: #f59e0b; }
        .dot.bonus { background: #10b981; }
        .vac-row { display: flex; align-items: center; gap: 12px; }
        .vac-used, .vac-accum { text-align: center; flex-shrink: 0; }
        .vac-num { font-family: var(--font-display); font-size: 22px; color: var(--text-primary); display: block; line-height: 1; }
        .vac-lab { font-size: 9px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; }
        .vac-bar-wrap { flex: 1; }
        .vac-bar-bg { height: 8px; background: var(--code-bg); border-radius: 10px; overflow: hidden; }
        .vac-bar-fill { height: 100%; background: linear-gradient(90deg, #3b82f6, #06b6d4); border-radius: 10px; transition: width 0.6s ease; }
      `}</style>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="info-row">
      <span className="info-icon">{icon}</span>
      <span className="info-label">{label}</span>
      <span className="info-value">{value}</span>
      <style jsx>{`
        .info-row {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 12px; border-bottom: 1px solid var(--border); font-size: 12px;
        }
        .info-row:last-child { border-bottom: none; }
        .info-icon { color: var(--text-muted); flex-shrink: 0; }
        .info-label { color: var(--text-muted); flex: 1; }
        .info-value { font-weight: 500; color: var(--text-primary); font-family: var(--font-body); }
      `}</style>
    </div>
  );
}

// ─── Main Table ────────────────────────────────────────────────
export default function EmployeeTable() {
  const { filteredEmployees, selectedDepartmentId } = useDashboard();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [drawerEmp, setDrawerEmp] = useState<EnrichedEmployee | null>(null);

  const selectedDept = departments.find(d => d.id === selectedDepartmentId);

  const enriched: EnrichedEmployee[] = useMemo(() =>
    filteredEmployees.map(emp => ({
      ...emp,
      totalEarning: getTotalEarnings(emp, CURRENT_YEAR),
      totalDayoffs: getTotalVacationDays(emp, CURRENT_YEAR),
      avgBenefit: getAverageBenefit(emp, CURRENT_YEAR),
    })), [filteredEmployees]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return enriched.filter(emp =>
      emp.id.includes(q) ||
      emp.firstName.toLowerCase().includes(q) ||
      emp.lastName.toLowerCase().includes(q) ||
      emp.sex.toLowerCase().includes(q) ||
      emp.ethnicity.toLowerCase().includes(q)
    );
  }, [enriched, search]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    let av: string | number = String((a as unknown as Record<string, unknown>)[sortKey] ?? '');
    let bv: string | number = String((b as unknown as Record<string, unknown>)[sortKey] ?? '');
    if (['totalEarning', 'totalDayoffs', 'avgBenefit'].includes(sortKey)) {
      av = (a as unknown as Record<string, number>)[sortKey];
      bv = (b as unknown as Record<string, number>)[sortKey];
    }
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  }), [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  // Stats
  const totalEarnings = enriched.reduce((s, e) => s + e.totalEarning, 0);
  const totalVacDays = enriched.reduce((s, e) => s + e.totalDayoffs, 0);
  const shareholders = enriched.filter(e => e.isShareholder).length;
  const fullTime = enriched.filter(e => e.isFullTime).length;

  const columns: { key: SortKey; label: string }[] = [
    { key: 'id', label: 'ID' },
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'sex', label: 'Sex' },
    { key: 'ethnicity', label: 'Ethnicity' },
    { key: 'isFullTime', label: 'Type' },
    { key: 'totalEarning', label: 'Total Earning' },
    { key: 'totalDayoffs', label: 'Days Off' },
    { key: 'avgBenefit', label: 'Avg Benefit' },
  ];

  return (
    <>
      {drawerEmp && <EmployeeDrawer emp={drawerEmp} onClose={() => setDrawerEmp(null)} />}

      <div className="wrapper">
        {/* Stat cards */}
        <div className="stat-cards">
          <StatCard icon={<User size={16} />} label="Employees" value={String(enriched.length)} sub={`${fullTime} full-time`} color="#2563eb" />
          <StatCard icon={<TrendingUp size={16} />} label="Total Earnings" value={`$${(totalEarnings / 1000).toFixed(1)}k`} sub="YTD 2025" color="#16a34a" />
          <StatCard icon={<Star size={16} />} label="Shareholders" value={String(shareholders)} sub={`${enriched.length - shareholders} non-SH`} color="#d97706" />
          <StatCard icon={<Calendar size={16} />} label="Vacation Days" value={String(totalVacDays)} sub="total used 2025" color="#7c3aed" />
        </div>

        {/* Table */}
        <div className="table-card">
          <div className="table-header">
            <div className="table-title-wrap">
              <User size={14} className="icon" />
              <h2>{selectedDept ? selectedDept.name : 'All Employees'}</h2>
              <span className="count-badge">{sorted.length}</span>
            </div>
            <div className="search-wrap">
              <Search size={13} className="search-icon" />
              <input
                className="search-input"
                placeholder="Search name, ID, gender..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
              {search && (
                <button className="clear-btn" onClick={() => setSearch('')}><X size={11} /></button>
              )}
            </div>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  {columns.map(col => (
                    <th key={col.key} onClick={() => handleSort(col.key)} className={sortKey === col.key ? 'sorted' : ''}>
                      <span className="th-inner">
                        {col.label}
                        <ArrowUpDown size={10} className={`sort-icon ${sortKey === col.key ? 'active' : ''}`} />
                      </span>
                    </th>
                  ))}
                  <th>Detail</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((emp, i) => {
                  const isExpanded = expandedId === emp.id;
                  return (
                    <>
                      <tr
                        key={emp.id}
                        className={isExpanded ? 'expanded' : ''}
                        style={{ animationDelay: `${i * 25}ms` }}
                        onClick={() => setExpandedId(isExpanded ? null : emp.id)}
                      >
                        <td><span className="id-badge">{emp.id}</span></td>
                        <td className="name-cell">{emp.firstName}</td>
                        <td className="name-cell">{emp.lastName}</td>
                        <td><span className={`tag gender-${emp.sex.toLowerCase()}`}>{emp.sex}</span></td>
                        <td className="eth-cell">{emp.ethnicity}</td>
                        <td>
                          <span className={`tag ${emp.isFullTime ? 'ft' : 'pt'}`}>
                            {emp.isFullTime ? 'Full-Time' : 'Part-Time'}
                          </span>
                        </td>
                        <td className="money-cell">
                          <span>${emp.totalEarning.toLocaleString()}</span>
                          {emp.isShareholder && <Star size={10} className="sh-star" />}
                        </td>
                        <td className="num-cell">{emp.totalDayoffs}</td>
                        <td className="money-cell">${Math.round(emp.avgBenefit).toLocaleString()}</td>
                        <td>
                          <button className="expand-row-btn" onClick={e => { e.stopPropagation(); setExpandedId(isExpanded ? null : emp.id); }}>
                            <ChevronDown size={12} className={isExpanded ? 'rotated' : ''} />
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${emp.id}-detail`} className="detail-row">
                          <td colSpan={10}>
                            <div className="inline-detail">
                              <div className="inline-detail-cols">
                                <div className="inline-col">
                                  <p className="inline-label">Hire Date</p>
                                  <p className="inline-val">{new Date(emp.hireDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                </div>
                                <div className="inline-col">
                                  <p className="inline-label">Birthday</p>
                                  <p className="inline-val">{new Date(emp.birthDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                                </div>
                                <div className="inline-col">
                                  <p className="inline-label">Benefits Plan</p>
                                  <p className="inline-val">{emp.benefitsPlan}</p>
                                </div>
                                <div className="inline-col">
                                  <p className="inline-label">Shareholder</p>
                                  <p className="inline-val">{emp.isShareholder ? '✅ Yes' : '❌ No'}</p>
                                </div>
                                <div className="inline-col">
                                  <p className="inline-label">Vac Accumulated</p>
                                  <p className="inline-val">{emp.vacationDays.find(v => v.year === CURRENT_YEAR)?.daysAccumulated ?? 0} days</p>
                                </div>
                              </div>
                              <button className="full-detail-btn" onClick={e => { e.stopPropagation(); setDrawerEmp(emp); }}>
                                View Full Profile →
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>

            {paged.length === 0 && (
              <div className="empty-state">
                <User size={28} />
                <p>No employees found</p>
                {search && <button onClick={() => setSearch('')} className="clear-search">Clear search</button>}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <span className="page-info">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length}
              </span>
              <div className="page-btns">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="page-btn">← Prev</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)} className={`page-btn num ${p === page ? 'active' : ''}`}>{p}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="page-btn">Next →</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .wrapper { display: flex; flex-direction: column; gap: 16px; }
        .stat-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        @media (max-width: 900px) { .stat-cards { grid-template-columns: repeat(2, 1fr); } }

        /* Table card */
        .table-card {
          background: var(--card-bg); border: 1px solid var(--border);
          border-radius: 10px; overflow: hidden;
        }
        .table-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 18px; border-bottom: 1px solid var(--border); gap: 12px; flex-wrap: wrap;
        }
        .table-title-wrap { display: flex; align-items: center; gap: 8px; }
        .icon { color: var(--text-muted); }
        h2 {
          font-size: 13px; font-weight: 600; color: var(--text-primary);
          margin: 0; font-family: var(--font-display);
        }
        .count-badge {
          background: var(--accent-subtle); color: var(--accent);
          font-size: 10px; font-weight: 700; padding: 1px 7px; border-radius: 10px;
        }
        .search-wrap { position: relative; display: flex; align-items: center; }
        .search-icon { position: absolute; left: 9px; color: var(--text-muted); pointer-events: none; }
        .search-input {
          background: var(--input-bg); border: 1px solid var(--border);
          border-radius: 6px; padding: 7px 28px 7px 28px;
          font-size: 12px; color: var(--text-primary); width: 220px;
          outline: none; font-family: var(--font-body); transition: border-color 0.15s;
        }
        .search-input:focus { border-color: var(--accent); }
        .search-input::placeholder { color: var(--text-muted); }
        .clear-btn {
          position: absolute; right: 8px; background: none; border: none;
          cursor: pointer; color: var(--text-muted); display: flex; align-items: center;
        }

        /* Table */
        .table-scroll { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        thead { background: var(--table-head-bg); }
        th {
          padding: 9px 14px; text-align: left; font-size: 10px; font-weight: 600;
          color: var(--text-muted); letter-spacing: 0.06em; text-transform: uppercase;
          cursor: pointer; white-space: nowrap; border-bottom: 1px solid var(--border);
          user-select: none; transition: color 0.12s;
        }
        th:hover, th.sorted { color: var(--accent); }
        .th-inner { display: flex; align-items: center; gap: 4px; }
        .sort-icon { opacity: 0.3; }
        .sort-icon.active { opacity: 1; color: var(--accent); }

        tr {
          border-bottom: 1px solid var(--border);
          cursor: pointer;
          animation: rowIn 0.2s ease both;
        }
        @keyframes rowIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        tr:last-child { border-bottom: none; }
        tr:hover td { background: #f8f9ff; }
        tr.expanded td { background: #f0f7ff; }

        td { padding: 9px 14px; color: var(--text-secondary); white-space: nowrap; transition: background 0.1s; }

        .id-badge {
          font-family: var(--font-mono); font-size: 11px;
          background: var(--code-bg); padding: 2px 6px; border-radius: 4px; color: var(--text-muted);
        }
        .name-cell { color: var(--text-primary); font-weight: 500; }
        .eth-cell { color: var(--text-secondary); }

        .tag {
          font-size: 10px; font-weight: 600; padding: 2px 8px;
          border-radius: 10px; white-space: nowrap;
        }
        .tag.gender-male { background: #dbeafe; color: #1d4ed8; }
        .tag.gender-female { background: #fce7f3; color: #be185d; }
        .tag.ft { background: #dcfce7; color: #15803d; }
        .tag.pt { background: #fef9c3; color: #854d0e; }

        .money-cell {
          color: var(--text-primary); font-family: var(--font-mono); font-size: 12px;
          display: flex; align-items: center; gap: 5px;
        }
        .sh-star { color: #d97706; }
        .num-cell { font-family: var(--font-mono); color: var(--text-secondary); }

        .expand-row-btn {
          background: none; border: 1px solid var(--border); cursor: pointer;
          color: var(--text-muted); display: flex; align-items: center;
          padding: 4px 5px; border-radius: 5px; transition: all 0.12s;
        }
        .expand-row-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-subtle); }
        .rotated { transform: rotate(180deg); }

        /* Inline expanded detail */
        .detail-row td { padding: 0; background: #f8fbff; }
        .inline-detail {
          padding: 12px 18px; display: flex; align-items: center; gap: 20px;
          border-bottom: 2px solid #dbeafe; flex-wrap: wrap;
          animation: detailIn 0.15s ease;
        }
        @keyframes detailIn { from { opacity: 0; } to { opacity: 1; } }
        .inline-detail-cols { display: flex; gap: 24px; flex: 1; flex-wrap: wrap; }
        .inline-col { display: flex; flex-direction: column; gap: 2px; }
        .inline-label { font-size: 9px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; }
        .inline-val { font-size: 12px; font-weight: 500; color: var(--text-primary); font-family: var(--font-body); }
        .full-detail-btn {
          background: var(--accent); color: white; border: none; cursor: pointer;
          font-size: 11px; font-weight: 600; padding: 7px 14px; border-radius: 6px;
          font-family: var(--font-body); white-space: nowrap; transition: background 0.12s;
        }
        .full-detail-btn:hover { background: #1d4ed8; }

        /* Empty */
        .empty-state {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          padding: 48px; color: var(--text-muted); font-size: 13px;
        }
        .clear-search {
          font-size: 12px; color: var(--accent); background: none; border: none;
          cursor: pointer; text-decoration: underline;
        }

        /* Pagination */
        .pagination {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 18px; border-top: 1px solid var(--border); flex-wrap: wrap; gap: 8px;
        }
        .page-info { font-size: 11px; color: var(--text-muted); }
        .page-btns { display: flex; gap: 4px; }
        .page-btn {
          font-size: 11px; padding: 5px 10px; border-radius: 5px;
          border: 1px solid var(--border); background: var(--card-bg);
          cursor: pointer; color: var(--text-secondary); font-family: var(--font-body);
          transition: all 0.12s;
        }
        .page-btn:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
        .page-btn:disabled { opacity: 0.4; cursor: default; }
        .page-btn.num.active { background: var(--accent); color: white; border-color: var(--accent); }
      `}</style>
    </>
  );
}
