'use client';
import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, LineChart, Line, Cell
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import { useDashboard } from '@/lib/hooks/useDashboard';
import { getTotalVacationDays, departments } from '@/lib/data/mockData';
import FilterBar, { FilterState, defaultFilter } from './FilterBar';
import { useFilteredEmployees } from '@/lib/hooks/useFilteredEmployees';

const COLORS = ['#7c3aed', '#8b5cf6', '#a78bfa', '#06b6d4', '#10b981', '#f59e0b'];

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--card-bg)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '10px 14px', fontSize: 12,
      boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
    }}>
      <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, fontFamily: 'var(--font-display)' }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginTop: 3 }}>
          <span style={{ color: p.color, fontWeight: 500 }}>{p.name}</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{p.value} days</span>
        </div>
      ))}
    </div>
  );
}

type GroupKey = 'shareholder' | 'gender' | 'ethnicity' | 'employment';

function getGroupLabel(emp: { isShareholder: boolean; sex: string; ethnicity: string; isFullTime: boolean }, key: GroupKey): string {
  switch (key) {
    case 'shareholder': return emp.isShareholder ? 'Shareholder' : 'Non-Shareholder';
    case 'gender': return emp.sex;
    case 'ethnicity': return emp.ethnicity;
    case 'employment': return emp.isFullTime ? 'Full-Time' : 'Part-Time';
  }
}

export default function VacationPanel() {
  const { filteredEmployees, alertConfig } = useDashboard();
  const [filter, setFilter] = useState<FilterState>(defaultFilter);
  const [groupBy, setGroupBy] = useState<GroupKey>('gender');

  const employees = useFilteredEmployees(filteredEmployees, filter);
  const currentYear = filter.year;
  const prevYear = currentYear - 1;

  const totalCurrent = useMemo(() => employees.reduce((s, e) => s + getTotalVacationDays(e, currentYear), 0), [employees, currentYear]);
  const totalPrev = useMemo(() => employees.reduce((s, e) => s + getTotalVacationDays(e, prevYear), 0), [employees, prevYear]);
  const avgCurrent = employees.length ? (totalCurrent / employees.length).toFixed(1) : '0';
  const avgPrev = employees.length ? (totalPrev / employees.length).toFixed(1) : '0';

  // Near-cap employees
  const nearCap = useMemo(() =>
    employees.filter(e => {
      const rec = e.vacationDays.find(v => v.year === currentYear);
      return rec && rec.daysAccumulated > alertConfig.vacationDaysThreshold;
    }), [employees, currentYear, alertConfig.vacationDaysThreshold]);

  // Group chart
  const chartData = useMemo(() => {
    const groups: Record<string, { current: number; prev: number }> = {};
    employees.forEach(emp => {
      const key = getGroupLabel(emp, groupBy);
      if (!groups[key]) groups[key] = { current: 0, prev: 0 };
      groups[key].current += getTotalVacationDays(emp, currentYear);
      groups[key].prev += getTotalVacationDays(emp, prevYear);
    });
    return Object.entries(groups).map(([name, vals]) => ({
      name, [`${currentYear}`]: vals.current, [`${prevYear}`]: vals.prev,
    }));
  }, [employees, groupBy, currentYear, prevYear]);

  // Individual usage (top 10 by usage)
  const individualData = useMemo(() =>
    employees
      .map(e => ({
        name: `${e.firstName.split(' ').pop()} ${e.lastName}`,
        used: getTotalVacationDays(e, currentYear),
        accumulated: e.vacationDays.find(v => v.year === currentYear)?.daysAccumulated ?? 0,
      }))
      .sort((a, b) => b.used - a.used)
      .slice(0, 10),
    [employees, currentYear]);

  // Dept breakdown
  const deptTable = useMemo(() => {
    const byDept: Record<string, { current: number; prev: number; count: number; name: string }> = {};
    employees.forEach(emp => {
      const dept = departments.find(d => d.id === emp.departmentId);
      const name = dept?.name.replace(' Department', '') ?? emp.departmentId;
      if (!byDept[emp.departmentId]) byDept[emp.departmentId] = { current: 0, prev: 0, count: 0, name };
      byDept[emp.departmentId].current += getTotalVacationDays(emp, currentYear);
      byDept[emp.departmentId].prev += getTotalVacationDays(emp, prevYear);
      byDept[emp.departmentId].count++;
    });
    return Object.values(byDept).sort((a, b) => b.current - a.current);
  }, [employees, currentYear, prevYear]);

  const GROUP_OPTIONS: { value: GroupKey; label: string }[] = [
    { value: 'shareholder', label: 'Shareholder' },
    { value: 'gender', label: 'Gender' },
    { value: 'ethnicity', label: 'Ethnicity' },
    { value: 'employment', label: 'Employment' },
  ];

  const diffTotal = totalCurrent - totalPrev;
  const diffAvg = parseFloat(avgCurrent) - parseFloat(avgPrev);

  return (
    <div className="panel">
      <FilterBar filter={filter} onChange={setFilter} />

      {/* Alert banner */}
      {nearCap.length > 0 && (
        <div className="alert-banner">
          <AlertTriangle size={14} />
          <span><strong>{nearCap.length} employee{nearCap.length > 1 ? 's' : ''}</strong> have accumulated more than {alertConfig.vacationDaysThreshold} days of vacation</span>
        </div>
      )}

      {/* KPIs */}
      <div className="kpi-row">
        {[
          { label: 'Total Days Used', value: totalCurrent, prev: totalPrev, diff: diffTotal },
          { label: `Avg Days / Employee`, value: parseFloat(avgCurrent), prev: parseFloat(avgPrev), diff: diffAvg },
          { label: 'Employees Tracked', value: employees.length, prev: employees.length, diff: 0 },
          { label: 'Over Vacation Cap', value: nearCap.length, prev: 0, diff: nearCap.length },
        ].map((kpi, i) => {
          const up = kpi.diff > 0; const neutral = kpi.diff === 0;
          return (
            <div key={i} className="kpi">
              <p className="kpi-label">{kpi.label}</p>
              <p className="kpi-value">{kpi.value}</p>
              <p className={`kpi-delta ${up ? 'up' : neutral ? 'neutral' : 'down'}`}>
                {neutral ? <Minus size={11} /> : up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {neutral ? 'No change' : `${up ? '+' : ''}${kpi.diff.toFixed ? kpi.diff.toFixed(1) : kpi.diff} vs ${prevYear}`}
              </p>
            </div>
          );
        })}
      </div>

      {/* Group chart */}
      <div className="chart-card">
        <div className="chart-header">
          <div>
            <h3>Vacation Days by Group</h3>
            <p>{currentYear} vs {prevYear} — total days used</p>
          </div>
          <div className="group-pills">
            {GROUP_OPTIONS.map(opt => (
              <button key={opt.value} className={`pill ${groupBy === opt.value ? 'active' : ''}`} onClick={() => setGroupBy(opt.value)}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}d`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            <Bar dataKey={String(currentYear)} fill="#7c3aed" radius={[4, 4, 0, 0]} maxBarSize={48} />
            <Bar dataKey={String(prevYear)} fill="#ddd6fe" radius={[4, 4, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Individual usage */}
      {individualData.length > 0 && (
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3>Individual Usage — Top {individualData.length}</h3>
              <p>Days used vs days accumulated in {currentYear}</p>
            </div>
          </div>
          <div className="individual-list">
            {individualData.map((emp, i) => {
              const pct = emp.accumulated > 0 ? Math.min(100, (emp.used / emp.accumulated) * 100) : 0;
              const overCap = emp.accumulated > alertConfig.vacationDaysThreshold;
              return (
                <div key={i} className="individual-row">
                  <div className="emp-name-col">
                    <div className="emp-avatar" style={{ background: COLORS[i % COLORS.length] + '22', color: COLORS[i % COLORS.length] }}>
                      {emp.name.charAt(0)}
                    </div>
                    <span>{emp.name}</span>
                    {overCap && <span className="cap-flag">⚠</span>}
                  </div>
                  <div className="usage-bar-col">
                    <div className="usage-track">
                      <div className="usage-fill" style={{ width: `${pct}%`, background: overCap ? '#dc2626' : COLORS[i % COLORS.length] }} />
                    </div>
                  </div>
                  <div className="usage-nums">
                    <span className="used-num">{emp.used}</span>
                    <span className="accum-num">/ {emp.accumulated} days</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Dept table */}
      <div className="table-card">
        <div className="chart-header" style={{ padding: '14px 18px 0' }}>
          <div>
            <h3>Department Breakdown</h3>
            <p>Total vacation days used — {currentYear} vs {prevYear}</p>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Department</th>
              <th>Employees</th>
              <th>{currentYear} Days</th>
              <th>{prevYear} Days</th>
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
                    <span className="dept-dot" style={{ background: COLORS[i % COLORS.length] }} />
                    {row.name}
                  </td>
                  <td>{row.count}</td>
                  <td className="num">{row.current}</td>
                  <td className="num muted">{row.prev}</td>
                  <td className={up ? 'up' : diff < 0 ? 'down' : ''}>
                    {diff === 0 ? '—' : `${up ? '↑' : '↓'} ${pct}%`}
                  </td>
                  <td className="num">{row.count ? (row.current / row.count).toFixed(1) : 0}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .panel { display: flex; flex-direction: column; gap: 14px; }
        .alert-banner {
          display: flex; align-items: center; gap: 8px;
          background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px;
          padding: 10px 14px; font-size: 12px; color: #c2410c;
        }
        .kpi-row { display: flex; gap: 12px; flex-wrap: wrap; }
        .kpi {
          background: var(--card-bg); border: 1px solid var(--border);
          border-radius: 10px; padding: 14px 16px; flex: 1; min-width: 130px;
        }
        .kpi-label { font-size: 10px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 4px; }
        .kpi-value { font-family: var(--font-display); font-size: 22px; color: var(--text-primary); line-height: 1.1; }
        .kpi-delta { display: flex; align-items: center; gap: 4px; font-size: 11px; margin-top: 4px; }
        .kpi-delta.up { color: #16a34a; }
        .kpi-delta.down { color: var(--danger); }
        .kpi-delta.neutral { color: var(--text-muted); }
        .chart-card {
          background: var(--card-bg); border: 1px solid var(--border);
          border-radius: 10px; padding: 16px 18px;
        }
        .chart-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; gap: 12px; flex-wrap: wrap; }
        h3 { font-family: var(--font-display); font-size: 14px; color: var(--text-primary); margin: 0 0 2px; }
        p { font-size: 11px; color: var(--text-muted); margin: 0; }
        .group-pills { display: flex; gap: 4px; flex-wrap: wrap; }
        .pill { font-size: 11px; padding: 4px 10px; border-radius: 20px; border: 1px solid var(--border); background: var(--card-bg); cursor: pointer; color: var(--text-muted); font-family: var(--font-body); transition: all 0.13s; }
        .pill:hover { border-color: #7c3aed; color: #7c3aed; }
        .pill.active { background: #7c3aed; color: white; border-color: #7c3aed; }
        .individual-list { display: flex; flex-direction: column; gap: 8px; }
        .individual-row { display: flex; align-items: center; gap: 12px; }
        .emp-name-col { display: flex; align-items: center; gap: 7px; min-width: 140px; font-size: 12px; color: var(--text-primary); font-weight: 500; }
        .emp-avatar { width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
        .cap-flag { font-size: 11px; }
        .usage-bar-col { flex: 1; }
        .usage-track { height: 8px; background: var(--code-bg); border-radius: 10px; overflow: hidden; }
        .usage-fill { height: 100%; border-radius: 10px; transition: width 0.5s ease; }
        .usage-nums { display: flex; align-items: baseline; gap: 3px; min-width: 90px; justify-content: flex-end; }
        .used-num { font-family: var(--font-mono); font-size: 13px; font-weight: 600; color: var(--text-primary); }
        .accum-num { font-size: 10px; color: var(--text-muted); }
        .table-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 12px; }
        thead { background: var(--table-head-bg); }
        th { padding: 8px 14px; text-align: left; font-size: 10px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 1px solid var(--border); }
        tr { border-bottom: 1px solid var(--border); }
        tr:last-child { border-bottom: none; }
        tr:hover td { background: var(--hover-bg); }
        td { padding: 10px 14px; color: var(--text-secondary); }
        .dept-cell { display: flex; align-items: center; gap: 8px; color: var(--text-primary); font-weight: 500; }
        .dept-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .num { font-family: var(--font-mono); color: var(--text-primary); }
        .muted { color: var(--text-muted) !important; }
        .up { color: #16a34a; font-weight: 600; }
        .down { color: var(--danger); font-weight: 600; }
      `}</style>
    </div>
  );
}
