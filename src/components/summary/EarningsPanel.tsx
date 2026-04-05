'use client';
import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useDashboard } from '@/lib/hooks/useDashboard';
import { getTotalEarnings } from '@/lib/utils/employeeUtils';
import FilterBar, { FilterState, defaultFilter } from './FilterBar';
import { useFilteredEmployees } from '@/lib/hooks/useFilteredEmployees';

import { Department } from '@/lib/types/employee';
const ACCENT_COLORS = ['#2563eb', '#0ea5e9', '#06b6d4', '#10b981', '#8b5cf6', '#f59e0b'];

// ── Stat tile ──────────────────────────────────────────────────
function KpiTile({ label, value, prev, prefix = '$' }: { label: string; value: number; prev: number; prefix?: string }) {
  const diff = value - prev;
  const pct = prev > 0 ? ((diff / prev) * 100).toFixed(1) : '—';
  const up = diff > 0;
  const neutral = diff === 0;
  return (
    <div className="kpi">
      <p className="kpi-label">{label}</p>
      <p className="kpi-value">{prefix}{value.toLocaleString()}</p>
      <p className={`kpi-delta ${up ? 'up' : neutral ? 'neutral' : 'down'}`}>
        {neutral ? <Minus size={11} /> : up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
        {neutral ? 'No change' : `${up ? '+' : ''}${pct}% vs ${Number(filter_year_ref) - 1}`}
      </p>
      <style jsx>{`
        .kpi {
          background: var(--card-bg); border: 1px solid var(--border);
          border-radius: 10px; padding: 14px 16px; flex: 1; min-width: 140px;
        }
        .kpi-label { font-size: 10px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 4px; }
        .kpi-value { font-family: var(--font-display); font-size: 22px; color: var(--text-primary); line-height: 1.1; }
        .kpi-delta { display: flex; align-items: center; gap: 4px; font-size: 11px; margin-top: 4px; }
        .kpi-delta.up { color: #16a34a; }
        .kpi-delta.down { color: var(--danger); }
        .kpi-delta.neutral { color: var(--text-muted); }
      `}</style>
    </div>
  );
}
// tiny workaround to get year into KpiTile without prop drilling
let filter_year_ref = 2025;

// ── Custom Tooltip ─────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--card-bg)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '10px 14px', fontSize: 12, minWidth: 160,
      boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
    }}>
      <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, fontFamily: 'var(--font-display)' }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginTop: 3 }}>
          <span style={{ color: p.color, fontWeight: 500 }}>{p.name}</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>${p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

// ── Group-by helpers ───────────────────────────────────────────
type GroupKey = 'shareholder' | 'gender' | 'ethnicity' | 'employment' | 'department';

function getGroupLabel(emp: { isShareholder: boolean; sex: string; ethnicity: string; isFullTime: boolean; departmentId: string }, key: GroupKey, departments: Department[]): string {
  switch (key) {
    case 'shareholder': return emp.isShareholder ? 'Shareholder' : 'Non-Shareholder';
    case 'gender': return emp.sex;
    case 'ethnicity': return emp.ethnicity;
    case 'employment': return emp.isFullTime ? 'Full-Time' : 'Part-Time';
    case 'department': return departments.find(d => d.id === emp.departmentId)?.name.replace(' Department', '') ?? emp.departmentId;
  }
}

export default function EarningsPanel() {
  const { filteredEmployees, departments } = useDashboard();
  const [filter, setFilter] = useState<FilterState>(defaultFilter);
  const [groupBy, setGroupBy] = useState<GroupKey>('gender');

  filter_year_ref = filter.year;

  const employees = useFilteredEmployees(filteredEmployees, filter);

  const currentYear = filter.year;
  const prevYear = currentYear - 1;

  // KPI totals
  const totalCurrent = useMemo(() =>
    employees.reduce((s, e) => s + getTotalEarnings(e, currentYear), 0),
    [employees, currentYear]);
  const totalPrev = useMemo(() =>
    employees.reduce((s, e) => s + getTotalEarnings(e, prevYear), 0),
    [employees, prevYear]);
  const avgCurrent = employees.length ? Math.round(totalCurrent / employees.length) : 0;
  const avgPrev = employees.length ? Math.round(totalPrev / employees.length) : 0;

  // Chart data — group by selection, current vs prev year
  const chartData = useMemo(() => {
    const groups: Record<string, { current: number; prev: number; count: number }> = {};
    employees.forEach(emp => {
      const key = getGroupLabel(emp, groupBy, departments);
      if (!groups[key]) groups[key] = { current: 0, prev: 0, count: 0 };
      groups[key].current += getTotalEarnings(emp, currentYear);
      groups[key].prev += getTotalEarnings(emp, prevYear);
      groups[key].count++;
    });
    return Object.entries(groups).map(([name, vals]) => ({
      name,
      [`${currentYear}`]: vals.current,
      [`${prevYear}`]: vals.prev,
      count: vals.count,
    }));
  }, [employees, groupBy, currentYear, prevYear]);

  // Monthly trend (current year)
  const monthlyData = useMemo(() => {
    const months: Record<number, number> = {};
    employees.forEach(emp => {
      emp.earnings.filter(e => e.year === currentYear).forEach(e => {
        months[e.month] = (months[e.month] || 0) + e.basicSalary + e.overtime + e.bonus;
      });
    });
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return Object.entries(months)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([m, total]) => ({ month: monthNames[Number(m) - 1], total }));
  }, [employees, currentYear]);

  // Department breakdown table
  const deptTable = useMemo(() => {
    const byDept: Record<string, { current: number; prev: number; count: number; name: string }> = {};
    employees.forEach(emp => {
      const dept = departments.find(d => d.id === emp.departmentId);
      const name = dept?.name.replace(' Department', '') ?? emp.departmentId;
      if (!byDept[emp.departmentId]) byDept[emp.departmentId] = { current: 0, prev: 0, count: 0, name };
      byDept[emp.departmentId].current += getTotalEarnings(emp, currentYear);
      byDept[emp.departmentId].prev += getTotalEarnings(emp, prevYear);
      byDept[emp.departmentId].count++;
    });
    return Object.values(byDept).sort((a, b) => b.current - a.current);
  }, [employees, currentYear, prevYear]);

  const GROUP_OPTIONS: { value: GroupKey; label: string }[] = [
    { value: 'shareholder', label: 'Shareholder' },
    { value: 'gender', label: 'Gender' },
    { value: 'ethnicity', label: 'Ethnicity' },
    { value: 'employment', label: 'Employment Type' },
    { value: 'department', label: 'Department' },
  ];

  return (
    <div className="panel">
      <FilterBar filter={filter} onChange={setFilter} />

      {/* KPI row */}
      <div className="kpi-row">
        <KpiTile label="Total Earnings" value={totalCurrent} prev={totalPrev} />
        <KpiTile label="Avg per Employee" value={avgCurrent} prev={avgPrev} />
        <KpiTile label="Employees Included" value={employees.length} prev={employees.length} prefix="" />
      </div>

      {/* Group-by chart */}
      <div className="chart-card">
        <div className="chart-header">
          <div>
            <h3>Earnings Comparison</h3>
            <p>Total earnings by group — {currentYear} vs {prevYear}</p>
          </div>
          <div className="group-pills">
            {GROUP_OPTIONS.map(opt => (
              <button
                key={opt.value}
                className={`pill ${groupBy === opt.value ? 'active' : ''}`}
                onClick={() => setGroupBy(opt.value)}
              >{opt.label}</button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'var(--font-body)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            <Bar dataKey={String(currentYear)} fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={48} />
            <Bar dataKey={String(prevYear)} fill="#bfdbfe" radius={[4, 4, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly trend */}
      {monthlyData.length > 0 && (
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3>Monthly Trend — {currentYear}</h3>
              <p>Total earnings per month across filtered employees</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" radius={[4, 4, 0, 0]} maxBarSize={36}>
                {monthlyData.map((_, i) => (
                  <Cell key={i} fill={ACCENT_COLORS[i % ACCENT_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Dept breakdown table */}
      <div className="table-card">
        <div className="chart-header">
          <div>
            <h3>Department Breakdown</h3>
            <p>Earnings by department — {currentYear} vs {prevYear}</p>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Department</th>
              <th>Employees</th>
              <th>{currentYear} Total</th>
              <th>{prevYear} Total</th>
              <th>Change</th>
              <th>Avg / Employee</th>
            </tr>
          </thead>
          <tbody>
            {deptTable.map((row, i) => {
              const diff = row.current - row.prev;
              const pct = row.prev > 0 ? ((diff / row.prev) * 100).toFixed(1) : '—';
              const up = diff > 0;
              return (
                <tr key={i}>
                  <td className="dept-cell">
                    <span className="dept-dot" style={{ background: ACCENT_COLORS[i % ACCENT_COLORS.length] }} />
                    {row.name}
                  </td>
                  <td>{row.count}</td>
                  <td className="money">${row.current.toLocaleString()}</td>
                  <td className="money muted">${row.prev.toLocaleString()}</td>
                  <td className={up ? 'up' : 'down'}>
                    {up ? '↑' : '↓'} {pct}%
                  </td>
                  <td className="money">${row.count ? Math.round(row.current / row.count).toLocaleString() : 0}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {deptTable.length === 0 && (
          <p className="empty">No data matches the current filters.</p>
        )}
      </div>

      <style jsx>{`
        .panel { display: flex; flex-direction: column; gap: 14px; }
        .kpi-row { display: flex; gap: 12px; flex-wrap: wrap; }
        .chart-card {
          background: var(--card-bg); border: 1px solid var(--border);
          border-radius: 10px; padding: 16px 18px;
        }
        .chart-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; gap: 12px; flex-wrap: wrap; }
        h3 { font-family: var(--font-display); font-size: 14px; color: var(--text-primary); margin: 0 0 2px; }
        p { font-size: 11px; color: var(--text-muted); margin: 0; }
        .group-pills { display: flex; gap: 4px; flex-wrap: wrap; }
        .pill {
          font-size: 11px; padding: 4px 10px; border-radius: 20px;
          border: 1px solid var(--border); background: var(--card-bg);
          cursor: pointer; color: var(--text-muted); font-family: var(--font-body);
          transition: all 0.13s;
        }
        .pill:hover { border-color: var(--accent); color: var(--accent); }
        .pill.active { background: var(--accent); color: white; border-color: var(--accent); }
        .table-card {
          background: var(--card-bg); border: 1px solid var(--border);
          border-radius: 10px; overflow: hidden;
        }
        .table-card .chart-header { padding: 14px 18px 0; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 12px; }
        thead { background: var(--table-head-bg); }
        th {
          padding: 8px 14px; text-align: left; font-size: 10px; font-weight: 600;
          color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em;
          border-bottom: 1px solid var(--border);
        }
        tr { border-bottom: 1px solid var(--border); }
        tr:last-child { border-bottom: none; }
        tr:hover td { background: var(--hover-bg); }
        td { padding: 10px 14px; color: var(--text-secondary); }
        .dept-cell { display: flex; align-items: center; gap: 8px; color: var(--text-primary); font-weight: 500; }
        .dept-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .money { font-family: var(--font-mono); color: var(--text-primary); }
        .muted { color: var(--text-muted) !important; }
        .up { color: #16a34a; font-weight: 600; }
        .down { color: var(--danger); font-weight: 600; }
        .empty { padding: 24px; text-align: center; color: var(--text-muted); font-size: 12px; }
      `}</style>
    </div>
  );
}
