'use client';
import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { useDashboard } from '@/lib/hooks/useDashboard';
import { getAverageBenefit, departments } from '@/lib/data/mockData';
import FilterBar, { FilterState, defaultFilter } from './FilterBar';
import { useFilteredEmployees } from '@/lib/hooks/useFilteredEmployees';

const PLAN_COLORS: Record<string, string> = {
  Basic: '#94a3b8',
  Standard: '#06b6d4',
  Premium: '#2563eb',
  Executive: '#d97706',
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
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

function PieTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: { fill: string } }[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
      <p style={{ color: payload[0].payload.fill, fontWeight: 600 }}>{payload[0].name}</p>
      <p style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>${payload[0].value.toLocaleString()}</p>
    </div>
  );
}

export default function BenefitsPanel() {
  const { filteredEmployees } = useDashboard();
  const [filter, setFilter] = useState<FilterState>(defaultFilter);

  const employees = useFilteredEmployees(filteredEmployees, filter);
  const currentYear = filter.year;

  // Shareholder vs Non-shareholder avg benefit
  const shareholders = employees.filter(e => e.isShareholder);
  const nonShareholders = employees.filter(e => !e.isShareholder);
  const avgSH = shareholders.length
    ? Math.round(shareholders.reduce((s, e) => s + getAverageBenefit(e, currentYear), 0) / shareholders.length)
    : 0;
  const avgNonSH = nonShareholders.length
    ? Math.round(nonShareholders.reduce((s, e) => s + getAverageBenefit(e, currentYear), 0) / nonShareholders.length)
    : 0;

  // Plan distribution
  const planData = useMemo(() => {
    const counts: Record<string, { count: number; total: number }> = {};
    employees.forEach(e => {
      const plan = e.benefitsPlan;
      if (!counts[plan]) counts[plan] = { count: 0, total: 0 };
      counts[plan].count++;
      counts[plan].total += getAverageBenefit(e, currentYear);
    });
    return Object.entries(counts).map(([plan, vals]) => ({
      name: plan,
      count: vals.count,
      avg: Math.round(vals.total / vals.count),
      fill: PLAN_COLORS[plan] || '#94a3b8',
    }));
  }, [employees, currentYear]);

  // Bar chart: avg benefit by plan, SH vs non-SH
  const shVsPlanData = useMemo(() => {
    const plans = ['Basic', 'Standard', 'Premium', 'Executive'];
    return plans.map(plan => {
      const sh = employees.filter(e => e.benefitsPlan === plan && e.isShareholder);
      const nonsh = employees.filter(e => e.benefitsPlan === plan && !e.isShareholder);
      return {
        plan,
        Shareholder: sh.length ? Math.round(sh.reduce((s, e) => s + getAverageBenefit(e, currentYear), 0) / sh.length) : 0,
        'Non-Shareholder': nonsh.length ? Math.round(nonsh.reduce((s, e) => s + getAverageBenefit(e, currentYear), 0) / nonsh.length) : 0,
      };
    }).filter(r => r.Shareholder > 0 || r['Non-Shareholder'] > 0);
  }, [employees, currentYear]);

  // Dept breakdown
  const deptData = useMemo(() => {
    const byDept: Record<string, { total: number; count: number; name: string }> = {};
    employees.forEach(emp => {
      const dept = departments.find(d => d.id === emp.departmentId);
      const name = dept?.name.replace(' Department', '') ?? emp.departmentId;
      if (!byDept[emp.departmentId]) byDept[emp.departmentId] = { total: 0, count: 0, name };
      byDept[emp.departmentId].total += getAverageBenefit(emp, currentYear);
      byDept[emp.departmentId].count++;
    });
    return Object.values(byDept)
      .map(r => ({ ...r, avg: Math.round(r.total / r.count) }))
      .sort((a, b) => b.avg - a.avg);
  }, [employees, currentYear]);

  const totalBenefits = employees.reduce((s, e) => s + getAverageBenefit(e, currentYear), 0);
  const overallAvg = employees.length ? Math.round(totalBenefits / employees.length) : 0;

  return (
    <div className="panel">
      <FilterBar filter={filter} onChange={setFilter} />

      {/* KPI row */}
      <div className="kpi-row">
        <div className="kpi kpi-overall">
          <p className="kpi-label">Overall Avg Benefit</p>
          <p className="kpi-value">${overallAvg.toLocaleString()}</p>
          <p className="kpi-sub">per employee · {currentYear}</p>
        </div>
        <div className="kpi kpi-sh">
          <p className="kpi-label">Shareholders</p>
          <p className="kpi-value" style={{ color: '#d97706' }}>${avgSH.toLocaleString()}</p>
          <p className="kpi-sub">{shareholders.length} employee{shareholders.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="kpi kpi-nonsh">
          <p className="kpi-label">Non-Shareholders</p>
          <p className="kpi-value" style={{ color: '#2563eb' }}>${avgNonSH.toLocaleString()}</p>
          <p className="kpi-sub">{nonShareholders.length} employee{nonShareholders.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="kpi">
          <p className="kpi-label">SH Premium</p>
          <p className="kpi-value" style={{ color: avgSH > avgNonSH ? '#16a34a' : '#dc2626' }}>
            {avgSH > avgNonSH ? '+' : ''}{avgSH - avgNonSH > 0 ? '$' : '-$'}{Math.abs(avgSH - avgNonSH).toLocaleString()}
          </p>
          <p className="kpi-sub">vs non-shareholders</p>
        </div>
      </div>

      {/* Two-col charts */}
      <div className="two-cols">
        {/* Pie: plan distribution */}
        <div className="chart-card">
          <h3>Benefits Plan Distribution</h3>
          <p className="chart-sub">Employee count by plan type</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={planData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={72} innerRadius={36} paddingAngle={3}>
                {planData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar: avg benefit by plan */}
        <div className="chart-card">
          <h3>Avg Benefit by Plan</h3>
          <p className="chart-sub">Shareholder vs Non-Shareholder</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={shVsPlanData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="plan" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Shareholder" fill="#d97706" radius={[4, 4, 0, 0]} maxBarSize={32} />
              <Bar dataKey="Non-Shareholder" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Plan detail cards */}
      <div className="plan-cards">
        {planData.map(plan => (
          <div key={plan.name} className="plan-card" style={{ borderTop: `3px solid ${plan.fill}` }}>
            <p className="plan-name" style={{ color: plan.fill }}>{plan.name}</p>
            <p className="plan-avg">${plan.avg.toLocaleString()}</p>
            <p className="plan-sub">avg benefit · {plan.count} emp</p>
          </div>
        ))}
      </div>

      {/* Dept table */}
      <div className="table-card">
        <div style={{ padding: '14px 18px 0' }}>
          <h3>Department Average Benefits</h3>
          <p className="chart-sub">Average benefit per employee by department — {currentYear}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Department</th>
              <th>Employees</th>
              <th>Avg Benefit</th>
              <th>vs Overall Avg</th>
              <th>Benefit Distribution</th>
            </tr>
          </thead>
          <tbody>
            {deptData.map((row, i) => {
              const diff = row.avg - overallAvg;
              const pct = overallAvg > 0 ? ((diff / overallAvg) * 100).toFixed(1) : '0';
              const barPct = overallAvg > 0 ? Math.min(100, (row.avg / (overallAvg * 1.5)) * 100) : 50;
              return (
                <tr key={i}>
                  <td className="dept-cell">{row.name}</td>
                  <td>{row.count}</td>
                  <td className="money">${row.avg.toLocaleString()}</td>
                  <td className={diff > 0 ? 'up' : diff < 0 ? 'down' : ''}>
                    {diff === 0 ? 'At avg' : `${diff > 0 ? '+' : ''}$${Math.abs(diff)} (${diff > 0 ? '+' : ''}${pct}%)`}
                  </td>
                  <td>
                    <div className="dist-bar-bg">
                      <div className="dist-bar-fill" style={{ width: `${barPct}%`, background: Object.values(PLAN_COLORS)[i % 4] }} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .panel { display: flex; flex-direction: column; gap: 14px; }
        .kpi-row { display: flex; gap: 12px; flex-wrap: wrap; }
        .kpi {
          background: var(--card-bg); border: 1px solid var(--border);
          border-radius: 10px; padding: 14px 16px; flex: 1; min-width: 130px;
        }
        .kpi-label { font-size: 10px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 4px; }
        .kpi-value { font-family: var(--font-display); font-size: 22px; color: var(--text-primary); line-height: 1.1; }
        .kpi-sub { font-size: 10px; color: var(--text-muted); margin-top: 3px; }
        .kpi-sh { border-top: 2px solid #fde68a; }
        .kpi-nonsh { border-top: 2px solid #bfdbfe; }
        .two-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 700px) { .two-cols { grid-template-columns: 1fr; } }
        .chart-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 10px; padding: 16px 18px; }
        h3 { font-family: var(--font-display); font-size: 14px; color: var(--text-primary); margin: 0 0 2px; }
        .chart-sub { font-size: 11px; color: var(--text-muted); margin: 0 0 14px; }
        .plan-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        @media (max-width: 700px) { .plan-cards { grid-template-columns: repeat(2, 1fr); } }
        .plan-card {
          background: var(--card-bg); border: 1px solid var(--border); border-radius: 10px;
          padding: 14px 16px; border-top-width: 3px;
        }
        .plan-name { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
        .plan-avg { font-family: var(--font-display); font-size: 20px; color: var(--text-primary); line-height: 1; }
        .plan-sub { font-size: 10px; color: var(--text-muted); margin-top: 3px; }
        .table-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 12px; }
        thead { background: var(--table-head-bg); }
        th { padding: 8px 14px; text-align: left; font-size: 10px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 1px solid var(--border); }
        tr { border-bottom: 1px solid var(--border); }
        tr:last-child { border-bottom: none; }
        tr:hover td { background: var(--hover-bg); }
        td { padding: 10px 14px; color: var(--text-secondary); }
        .dept-cell { color: var(--text-primary); font-weight: 500; }
        .money { font-family: var(--font-mono); color: var(--text-primary); }
        .up { color: #16a34a; font-weight: 600; }
        .down { color: var(--danger); font-weight: 600; }
        .dist-bar-bg { height: 7px; background: var(--code-bg); border-radius: 10px; overflow: hidden; width: 100%; }
        .dist-bar-fill { height: 100%; border-radius: 10px; }
      `}</style>
    </div>
  );
}
