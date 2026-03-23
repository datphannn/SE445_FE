'use client';
import { useState, useMemo } from 'react';
import { UmbrellaOff, Settings, ChevronUp, ChevronDown } from 'lucide-react';
import { useDashboard } from '@/lib/hooks/useDashboard';
import { departments } from '@/lib/data/mockData';

const CURRENT_YEAR = 2025;

function severityInfo(accumulated: number, threshold: number): { bg: string; text: string; border: string; label: string; pct: number } {
  const over = accumulated - threshold;
  const pct = Math.min(100, (accumulated / (threshold * 1.5)) * 100);
  if (over >= threshold * 0.5) return { bg: '#fef2f2', text: '#b91c1c', border: '#fca5a5', label: 'Critical', pct };
  if (over >= threshold * 0.2) return { bg: '#fff7ed', text: '#c2410c', border: '#fdba74', label: 'High', pct };
  return { bg: '#fffbeb', text: '#d97706', border: '#fde68a', label: 'Warning', pct };
}

export default function VacationCapAlert() {
  const { allEmployees, alertConfig, setAlertConfig } = useDashboard();
  const [showConfig, setShowConfig] = useState(false);
  const [threshold, setThreshold] = useState(alertConfig.vacationDaysThreshold);
  const [sortKey, setSortKey] = useState<'accumulated' | 'name'>('accumulated');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const alerts = useMemo(() => {
    return allEmployees
      .map(emp => {
        const rec = emp.vacationDays.find(v => v.year === CURRENT_YEAR);
        const accumulated = rec?.daysAccumulated ?? 0;
        const used = rec?.daysUsed ?? 0;
        const dept = departments.find(d => d.id === emp.departmentId);
        return { emp, accumulated, used, dept, over: accumulated - alertConfig.vacationDaysThreshold };
      })
      .filter(a => a.accumulated > alertConfig.vacationDaysThreshold)
      .sort((a, b) => {
        if (sortKey === 'accumulated') return sortDir === 'desc' ? b.accumulated - a.accumulated : a.accumulated - b.accumulated;
        const na = `${a.emp.firstName} ${a.emp.lastName}`;
        const nb = `${b.emp.firstName} ${b.emp.lastName}`;
        return sortDir === 'asc' ? na.localeCompare(nb) : nb.localeCompare(na);
      });
  }, [allEmployees, alertConfig.vacationDaysThreshold, sortKey, sortDir]);

  const handleSave = () => {
    setAlertConfig({ ...alertConfig, vacationDaysThreshold: threshold });
    setShowConfig(false);
  };

  const totalOver = alerts.reduce((s, a) => s + a.over, 0);

  return (
    <div className="alert-panel">
      {/* Header */}
      <div className="panel-header">
        <div className="header-left">
          <div className="header-icon"><UmbrellaOff size={18} /></div>
          <div>
            <h2>Vacation Cap Alerts</h2>
            <p>Employees with <strong>{alertConfig.vacationDaysThreshold}+</strong> accumulated vacation days in {CURRENT_YEAR}</p>
          </div>
        </div>
        <div className="header-actions">
          {alerts.length > 0 && (
            <div className="summary-pills">
              <span className="pill red">{alerts.length} over cap</span>
              <span className="pill orange">+{totalOver} excess days total</span>
            </div>
          )}
          <button className="config-btn" onClick={() => setShowConfig(v => !v)}>
            <Settings size={13} /> Configure
          </button>
        </div>
      </div>

      {/* Config */}
      {showConfig && (
        <div className="config-box">
          <label>Alert when accumulated vacation exceeds</label>
          <div className="config-row">
            <input type="number" min={1} max={100} value={threshold} onChange={e => setThreshold(Number(e.target.value))} className="config-input" />
            <span className="config-unit">days</span>
            <input type="range" min={5} max={60} step={1} value={threshold} onChange={e => setThreshold(Number(e.target.value))} className="config-slider" />
            <button className="save-btn" onClick={handleSave}>Save</button>
          </div>
        </div>
      )}

      {/* Sort bar */}
      {alerts.length > 0 && (
        <div className="sort-bar">
          <span>{alerts.length} employee{alerts.length !== 1 ? 's' : ''} over {alertConfig.vacationDaysThreshold}-day cap</span>
          <div className="sort-btns">
            {[{ key: 'accumulated', label: 'Days' }, { key: 'name', label: 'Name' }].map(opt => (
              <button
                key={opt.key}
                className={`sort-btn ${sortKey === opt.key ? 'active' : ''}`}
                onClick={() => {
                  if (sortKey === opt.key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
                  else { setSortKey(opt.key as 'accumulated' | 'name'); setSortDir(opt.key === 'accumulated' ? 'desc' : 'asc'); }
                }}
              >
                {opt.label}
                {sortKey === opt.key && (sortDir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Cards */}
      {alerts.length > 0 ? (
        <div className="cards">
          {alerts.map(({ emp, accumulated, used, dept, over }, i) => {
            const { bg, text, border, label, pct } = severityInfo(accumulated, alertConfig.vacationDaysThreshold);
            const remaining = accumulated - used;
            const initials = `${emp.firstName.charAt(0)}${emp.lastName.charAt(0)}`;
            return (
              <div key={emp.id} className="alert-card" style={{ background: bg, borderColor: border, animationDelay: `${i * 40}ms` }}>
                <div className="card-avatar" style={{ background: text + '18', color: text }}>{initials}</div>
                <div className="card-body">
                  <div className="card-top">
                    <div>
                      <div className="card-name">{emp.firstName} {emp.lastName}</div>
                      <div className="card-meta">
                        {dept?.name.replace(' Department', '')} · {emp.isFullTime ? 'Full-Time' : 'Part-Time'}
                        {emp.isShareholder && <span className="sh-badge">★ SH</span>}
                      </div>
                    </div>
                    <div className="card-right">
                      <span className="over-badge" style={{ background: text + '18', color: text }}>+{over} days over</span>
                      <span className="severity-tag" style={{ background: text, color: 'white' }}>{label}</span>
                    </div>
                  </div>
                  <div className="bar-section">
                    <div className="bar-labels">
                      <span>0</span>
                      <span style={{ color: text }}>Cap: {alertConfig.vacationDaysThreshold}</span>
                      <span>{accumulated} days</span>
                    </div>
                    <div className="bar-track">
                      <div className="bar-cap-line" style={{ left: `${(alertConfig.vacationDaysThreshold / (accumulated * 1.1)) * 100}%` }} />
                      <div className="bar-used" style={{ width: `${(used / (accumulated * 1.1)) * 100}%` }} />
                      <div className="bar-remaining" style={{ width: `${(remaining / (accumulated * 1.1)) * 100}%`, marginLeft: `${(used / (accumulated * 1.1)) * 100}%` }} />
                    </div>
                    <div className="bar-legend">
                      <span><span className="dot used" />Used: {used}d</span>
                      <span><span className="dot remaining" />Remaining: {remaining}d</span>
                      <span style={{ color: text }}>Total: {accumulated}d</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty">
          <UmbrellaOff size={32} />
          <p>No employees over the {alertConfig.vacationDaysThreshold}-day vacation cap</p>
          <span>Try lowering the threshold in Configure</span>
        </div>
      )}

      <style jsx>{`
        .alert-panel { display: flex; flex-direction: column; gap: 12px; }
        .panel-header {
          display: flex; align-items: center; justify-content: space-between;
          background: var(--card-bg); border: 1px solid var(--border);
          border-radius: 10px; padding: 16px 18px; gap: 12px; flex-wrap: wrap;
        }
        .header-left { display: flex; align-items: center; gap: 12px; }
        .header-icon { width: 40px; height: 40px; border-radius: 10px; background: #ffedd5; color: #c2410c; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        h2 { font-family: var(--font-display); font-size: 15px; color: var(--text-primary); margin: 0 0 2px; }
        p { font-size: 12px; color: var(--text-muted); margin: 0; }
        p strong { color: #c2410c; }
        .header-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .summary-pills { display: flex; gap: 6px; }
        .pill { font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 20px; }
        .pill.red { background: #fee2e2; color: #b91c1c; }
        .pill.orange { background: #ffedd5; color: #c2410c; }
        .config-btn { display: flex; align-items: center; gap: 5px; font-size: 12px; padding: 6px 12px; border-radius: 6px; border: 1px solid var(--border); background: var(--card-bg); cursor: pointer; color: var(--text-secondary); font-family: var(--font-body); transition: all 0.13s; }
        .config-btn:hover { border-color: #c2410c; color: #c2410c; }
        .config-box { background: #fff7ed; border: 1px solid #fdba74; border-radius: 10px; padding: 14px 18px; }
        .config-box label { font-size: 12px; color: var(--text-secondary); font-weight: 500; display: block; margin-bottom: 10px; }
        .config-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .config-input { width: 72px; padding: 6px 10px; border: 1px solid var(--border); border-radius: 6px; font-size: 14px; font-family: var(--font-mono); color: var(--text-primary); background: white; outline: none; text-align: center; }
        .config-unit { font-size: 12px; color: var(--text-muted); }
        .config-slider { flex: 1; min-width: 120px; accent-color: #c2410c; }
        .save-btn { background: #c2410c; color: white; border: none; border-radius: 6px; padding: 6px 16px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: var(--font-body); transition: background 0.13s; }
        .save-btn:hover { background: #9a3412; }
        .sort-bar { display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: var(--text-muted); padding: 0 2px; flex-wrap: wrap; gap: 8px; }
        .sort-btns { display: flex; gap: 4px; }
        .sort-btn { display: flex; align-items: center; gap: 3px; background: none; border: 1px solid var(--border); border-radius: 6px; padding: 4px 9px; font-size: 11px; cursor: pointer; color: var(--text-secondary); font-family: var(--font-body); transition: all 0.13s; }
        .sort-btn:hover, .sort-btn.active { border-color: #c2410c; color: #c2410c; }
        .cards { display: flex; flex-direction: column; gap: 8px; }
        .alert-card { border: 1px solid; border-radius: 10px; padding: 14px 16px; display: flex; gap: 12px; animation: cardIn 0.2s ease both; }
        @keyframes cardIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .card-avatar { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 15px; font-weight: 700; flex-shrink: 0; }
        .card-body { flex: 1; min-width: 0; }
        .card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 10px; flex-wrap: wrap; }
        .card-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
        .card-meta { font-size: 11px; color: var(--text-muted); margin-top: 2px; display: flex; align-items: center; gap: 6px; }
        .sh-badge { background: #fef9c3; color: #854d0e; font-size: 9px; font-weight: 700; padding: 1px 5px; border-radius: 8px; }
        .card-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
        .over-badge { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; }
        .severity-tag { font-size: 9px; font-weight: 700; padding: 2px 8px; border-radius: 10px; }
        .bar-section { display: flex; flex-direction: column; gap: 4px; }
        .bar-labels { display: flex; justify-content: space-between; font-size: 9px; color: var(--text-muted); font-family: var(--font-mono); }
        .bar-track { position: relative; height: 10px; background: rgba(0,0,0,0.07); border-radius: 10px; overflow: visible; }
        .bar-cap-line { position: absolute; top: -3px; bottom: -3px; width: 2px; background: currentColor; border-radius: 2px; z-index: 2; }
        .bar-used { position: absolute; left: 0; top: 0; height: 100%; background: #2563eb; border-radius: 10px 0 0 10px; }
        .bar-remaining { position: absolute; top: 0; height: 100%; background: #93c5fd; }
        .bar-legend { display: flex; gap: 12px; font-size: 9px; color: var(--text-muted); }
        .bar-legend span { display: flex; align-items: center; gap: 4px; }
        .dot { width: 8px; height: 8px; border-radius: 2px; display: inline-block; }
        .dot.used { background: #2563eb; }
        .dot.remaining { background: #93c5fd; }
        .empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 48px; color: var(--text-muted); text-align: center; background: var(--card-bg); border: 1px solid var(--border); border-radius: 10px; }
        .empty p { font-size: 14px; color: var(--text-secondary); margin: 0; }
        .empty span { font-size: 11px; }
      `}</style>
    </div>
  );
}
