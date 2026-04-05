'use client';
import { useState, useMemo } from 'react';
import { Cake, Settings, ChevronUp, ChevronDown } from 'lucide-react';
import { useDashboard } from '@/lib/hooks/useDashboard';

function getDaysToAnniversary(hireDate: string): { days: number; nextDate: Date; years: number } {
  const today = new Date();
  const hire = new Date(hireDate);
  let next = new Date(today.getFullYear(), hire.getMonth(), hire.getDate());
  const years = today.getFullYear() - hire.getFullYear();
  if (next <= today) {
    next = new Date(today.getFullYear() + 1, hire.getMonth(), hire.getDate());
  }
  const days = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const completedYears = next.getFullYear() - hire.getFullYear();
  return { days, nextDate: next, years: completedYears };
}

function urgencyColor(days: number, threshold: number): { bg: string; text: string; border: string; label: string } {
  const ratio = days / threshold;
  if (ratio <= 0.2) return { bg: '#fef2f2', text: '#b91c1c', border: '#fca5a5', label: 'Urgent' };
  if (ratio <= 0.5) return { bg: '#fff7ed', text: '#c2410c', border: '#fdba74', label: 'Soon' };
  return { bg: '#f0f9ff', text: '#0369a1', border: '#7dd3fc', label: 'Upcoming' };
}

export default function AnniversaryAlert() {
  const { allEmployees, alertConfig, setAlertConfig, departments } = useDashboard();
  const [showConfig, setShowConfig] = useState(false);
  const [threshold, setThreshold] = useState(alertConfig.anniversaryDaysThreshold);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const alerts = useMemo(() => {
    return allEmployees
      .map(emp => {
        const { days, nextDate, years } = getDaysToAnniversary(emp.hireDate);
        const dept = departments.find(d => d.id === emp.departmentId);
        return { emp, days, nextDate, years, dept };
      })
      .filter(a => a.days <= alertConfig.anniversaryDaysThreshold)
      .sort((a, b) => sortDir === 'asc' ? a.days - b.days : b.days - a.days);
  }, [allEmployees, alertConfig.anniversaryDaysThreshold, sortDir]);

  const handleSave = () => {
    setAlertConfig({ ...alertConfig, anniversaryDaysThreshold: threshold });
    setShowConfig(false);
  };

  return (
    <div className="alert-panel">
      {/* Header */}
      <div className="panel-header">
        <div className="header-left">
          <div className="header-icon"><Cake size={18} /></div>
          <div>
            <h2>Hiring Anniversary Alerts</h2>
            <p>Employees with anniversary within <strong>{alertConfig.anniversaryDaysThreshold} days</strong></p>
          </div>
        </div>
        <div className="header-actions">
          <span className="count-badge">{alerts.length} alert{alerts.length !== 1 ? 's' : ''}</span>
          <button className="config-btn" onClick={() => setShowConfig(v => !v)}>
            <Settings size={13} /> Configure
          </button>
        </div>
      </div>

      {/* Config panel */}
      {showConfig && (
        <div className="config-box">
          <label>Alert me when anniversary is within</label>
          <div className="config-row">
            <input
              type="number" min={1} max={365}
              value={threshold}
              onChange={e => setThreshold(Number(e.target.value))}
              className="config-input"
            />
            <span className="config-unit">days</span>
            <input
              type="range" min={7} max={180} step={7}
              value={threshold}
              onChange={e => setThreshold(Number(e.target.value))}
              className="config-slider"
            />
            <button className="save-btn" onClick={handleSave}>Save</button>
          </div>
        </div>
      )}

      {/* Sort bar */}
      {alerts.length > 0 && (
        <div className="sort-bar">
          <span>Sorted by days remaining</span>
          <button className="sort-btn" onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}>
            {sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {sortDir === 'asc' ? 'Soonest first' : 'Latest first'}
          </button>
        </div>
      )}

      {/* Alert cards */}
      {alerts.length > 0 ? (
        <div className="cards">
          {alerts.map(({ emp, days, nextDate, years, dept }, i) => {
            const { bg, text, border, label } = urgencyColor(days, alertConfig.anniversaryDaysThreshold);
            const initials = `${emp.firstName.charAt(0)}${emp.lastName.charAt(0)}`;
            return (
              <div key={emp.id} className="alert-card" style={{ background: bg, borderColor: border, animationDelay: `${i * 40}ms` }}>
                <div className="card-avatar" style={{ background: text + '20', color: text }}>{initials}</div>
                <div className="card-info">
                  <div className="card-name">{emp.firstName} {emp.lastName}</div>
                  <div className="card-meta">
                    {dept?.name.replace(' Department', '')} · {emp.isFullTime ? 'Full-Time' : 'Part-Time'}
                    {emp.isShareholder && <span className="sh-badge">★ SH</span>}
                  </div>
                  <div className="card-date" style={{ color: text }}>
                    🎂 {years}{years === 1 ? 'st' : years === 2 ? 'nd' : years === 3 ? 'rd' : 'th'} anniversary on{' '}
                    {nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                <div className="card-right">
                  <div className="days-circle" style={{ borderColor: text, color: text }}>
                    <span className="days-num">{days}</span>
                    <span className="days-label">days</span>
                  </div>
                  <span className="urgency-tag" style={{ background: text + '18', color: text }}>{label}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty">
          <Cake size={32} />
          <p>No anniversaries within the next {alertConfig.anniversaryDaysThreshold} days</p>
          <span>Try increasing the threshold in Configure</span>
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
        .header-icon {
          width: 40px; height: 40px; border-radius: 10px;
          background: #dbeafe; color: #1d4ed8;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        h2 { font-family: var(--font-display); font-size: 15px; color: var(--text-primary); margin: 0 0 2px; }
        p { font-size: 12px; color: var(--text-muted); margin: 0; }
        p strong { color: var(--accent); }
        .header-actions { display: flex; align-items: center; gap: 8px; }
        .count-badge {
          background: #dbeafe; color: #1d4ed8; font-size: 11px; font-weight: 700;
          padding: 3px 10px; border-radius: 20px;
        }
        .config-btn {
          display: flex; align-items: center; gap: 5px;
          font-size: 12px; padding: 6px 12px; border-radius: 6px;
          border: 1px solid var(--border); background: var(--card-bg);
          cursor: pointer; color: var(--text-secondary); font-family: var(--font-body);
          transition: all 0.13s;
        }
        .config-btn:hover { border-color: var(--accent); color: var(--accent); }
        .config-box {
          background: #f8f9ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 14px 18px;
        }
        .config-box label { font-size: 12px; color: var(--text-secondary); font-weight: 500; display: block; margin-bottom: 10px; }
        .config-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .config-input {
          width: 72px; padding: 6px 10px; border: 1px solid var(--border); border-radius: 6px;
          font-size: 14px; font-family: var(--font-mono); color: var(--text-primary);
          background: white; outline: none; text-align: center;
        }
        .config-input:focus { border-color: var(--accent); }
        .config-unit { font-size: 12px; color: var(--text-muted); }
        .config-slider { flex: 1; min-width: 120px; accent-color: var(--accent); }
        .save-btn {
          background: var(--accent); color: white; border: none; border-radius: 6px;
          padding: 6px 16px; font-size: 12px; font-weight: 600; cursor: pointer;
          font-family: var(--font-body); transition: background 0.13s;
        }
        .save-btn:hover { background: #1d4ed8; }
        .sort-bar {
          display: flex; align-items: center; justify-content: space-between;
          font-size: 11px; color: var(--text-muted); padding: 0 2px;
        }
        .sort-btn {
          display: flex; align-items: center; gap: 4px;
          background: none; border: 1px solid var(--border); border-radius: 6px;
          padding: 4px 10px; font-size: 11px; cursor: pointer;
          color: var(--text-secondary); font-family: var(--font-body); transition: all 0.13s;
        }
        .sort-btn:hover { border-color: var(--accent); color: var(--accent); }
        .cards { display: flex; flex-direction: column; gap: 8px; }
        .alert-card {
          display: flex; align-items: center; gap: 14px;
          border: 1px solid; border-radius: 10px; padding: 14px 16px;
          animation: cardIn 0.2s ease both;
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .card-avatar {
          width: 40px; height: 40px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display); font-size: 15px; font-weight: 700; flex-shrink: 0;
        }
        .card-info { flex: 1; min-width: 0; }
        .card-name { font-size: 13px; font-weight: 600; color: var(--text-primary); font-family: var(--font-body); }
        .card-meta { font-size: 11px; color: var(--text-muted); margin: 2px 0; display: flex; align-items: center; gap: 6px; }
        .sh-badge { background: #fef9c3; color: #854d0e; font-size: 9px; font-weight: 700; padding: 1px 5px; border-radius: 8px; }
        .card-date { font-size: 12px; font-weight: 500; margin-top: 3px; }
        .card-right { display: flex; flex-direction: column; align-items: center; gap: 6px; flex-shrink: 0; }
        .days-circle {
          width: 52px; height: 52px; border-radius: 50%; border: 2px solid;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
        }
        .days-num { font-family: var(--font-display); font-size: 18px; line-height: 1; }
        .days-label { font-size: 8px; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.7; }
        .urgency-tag { font-size: 9px; font-weight: 700; padding: 2px 8px; border-radius: 10px; }
        .empty {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          padding: 48px; color: var(--text-muted); text-align: center;
          background: var(--card-bg); border: 1px solid var(--border); border-radius: 10px;
        }
        .empty p { font-size: 14px; color: var(--text-secondary); margin: 0; }
        .empty span { font-size: 11px; }
      `}</style>
    </div>
  );
}
