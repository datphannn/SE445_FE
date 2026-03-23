'use client';
import { useMemo, useState } from 'react';
import { PartyPopper, Download } from 'lucide-react';
import { useDashboard } from '@/lib/hooks/useDashboard';
import { departments } from '@/lib/data/mockData';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const CONFETTI_COLORS = ['#2563eb','#7c3aed','#ec4899','#f59e0b','#10b981','#ef4444'];

function getAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
  return age;
}

function daysUntilBirthday(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  const thisYear = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
  if (thisYear < today) return 0; // already past = today or this month
  return Math.ceil((thisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default function BirthdayAlert() {
  const { allEmployees } = useDashboard();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-indexed

  const birthdaysByMonth = useMemo(() => {
    return allEmployees
      .map(emp => {
        const birth = new Date(emp.birthDate);
        const dept = departments.find(d => d.id === emp.departmentId);
        const daysLeft = daysUntilBirthday(emp.birthDate);
        const isToday = birth.getMonth() === new Date().getMonth() && birth.getDate() === new Date().getDate();
        return { emp, birth, dept, daysLeft, isToday, month: birth.getMonth() };
      })
      .filter(e => e.month === selectedMonth)
      .sort((a, b) => a.birth.getDate() - b.birth.getDate());
  }, [allEmployees, selectedMonth]);

  const currentMonthIdx = new Date().getMonth();
  const todayBirthdays = birthdaysByMonth.filter(b => b.isToday);

  // CSV export
  const handleExport = () => {
    const rows = [
      ['ID', 'Name', 'Department', 'Birthday', 'Age', 'Shareholder'],
      ...birthdaysByMonth.map(({ emp, birth }) => [
        emp.id,
        `${emp.firstName} ${emp.lastName}`,
        departments.find(d => d.id === emp.departmentId)?.name ?? '',
        `${birth.getMonth() + 1}/${birth.getDate()}`,
        String(getAge(emp.birthDate)),
        emp.isShareholder ? 'Yes' : 'No',
      ]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `birthdays-${MONTH_NAMES[selectedMonth].toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="alert-panel">
      {/* Header */}
      <div className="panel-header">
        <div className="header-left">
          <div className="header-icon"><PartyPopper size={18} /></div>
          <div>
            <h2>Birthday Alerts</h2>
            <p>Employees with birthdays in <strong>{MONTH_NAMES[selectedMonth]}</strong></p>
          </div>
        </div>
        <div className="header-actions">
          {birthdaysByMonth.length > 0 && (
            <>
              <span className="count-badge">{birthdaysByMonth.length} birthday{birthdaysByMonth.length !== 1 ? 's' : ''}</span>
              <button className="export-btn" onClick={handleExport}>
                <Download size={12} /> Export CSV
              </button>
            </>
          )}
        </div>
      </div>

      {/* Month selector */}
      <div className="month-selector">
        {MONTH_NAMES.map((name, idx) => {
          const count = allEmployees.filter(e => new Date(e.birthDate).getMonth() === idx).length;
          const isCurrent = idx === currentMonthIdx;
          return (
            <button
              key={idx}
              className={`month-btn ${selectedMonth === idx ? 'active' : ''} ${isCurrent ? 'current' : ''}`}
              onClick={() => setSelectedMonth(idx)}
            >
              <span className="month-name">{name.slice(0, 3)}</span>
              {count > 0 && <span className="month-count">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Today banner */}
      {todayBirthdays.length > 0 && selectedMonth === currentMonthIdx && (
        <div className="today-banner">
          <div className="confetti-row">
            {CONFETTI_COLORS.map((c, i) => <span key={i} className="confetti" style={{ background: c, animationDelay: `${i * 0.15}s` }}>🎉</span>)}
          </div>
          <p>🎂 Happy Birthday today to: <strong>{todayBirthdays.map(b => `${b.emp.firstName} ${b.emp.lastName}`).join(', ')}</strong>!</p>
        </div>
      )}

      {/* Birthday cards */}
      {birthdaysByMonth.length > 0 ? (
        <div className="cards">
          {birthdaysByMonth.map(({ emp, birth, dept, daysLeft, isToday }, i) => {
            const age = getAge(emp.birthDate);
            const isPast = !isToday && daysLeft === 0;
            const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
            const initials = `${emp.firstName.charAt(0)}${emp.lastName.charAt(0)}`;

            return (
              <div key={emp.id} className={`birthday-card ${isToday ? 'today' : ''}`} style={{ animationDelay: `${i * 40}ms`, borderLeftColor: color }}>
                <div className="card-avatar" style={{ background: color + '20', color }}>{initials}</div>
                <div className="card-info">
                  <div className="card-name">
                    {emp.firstName} {emp.lastName}
                    {isToday && <span className="today-tag">🎂 Today!</span>}
                  </div>
                  <div className="card-meta">
                    {dept?.name.replace(' Department', '')} · {emp.isFullTime ? 'Full-Time' : 'Part-Time'}
                    {emp.isShareholder && <span className="sh-badge">★ SH</span>}
                  </div>
                  <div className="card-date">
                    {MONTH_NAMES[birth.getMonth()]} {birth.getDate()}
                    <span className="age-badge" style={{ background: color + '18', color }}>
                      Turning {age + 1}
                    </span>
                  </div>
                </div>
                <div className="card-right">
                  {isToday ? (
                    <div className="today-circle" style={{ borderColor: color, color }}>
                      <span className="today-emoji">🎉</span>
                    </div>
                  ) : isPast ? (
                    <span className="past-tag">Passed</span>
                  ) : (
                    <div className="days-circle" style={{ borderColor: color, color }}>
                      <span className="days-num">{daysLeft}</span>
                      <span className="days-label">days</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty">
          <PartyPopper size={32} />
          <p>No birthdays in {MONTH_NAMES[selectedMonth]}</p>
          <span>Select another month above</span>
        </div>
      )}

      <style jsx>{`
        .alert-panel { display: flex; flex-direction: column; gap: 12px; }
        .panel-header { display: flex; align-items: center; justify-content: space-between; background: var(--card-bg); border: 1px solid var(--border); border-radius: 10px; padding: 16px 18px; gap: 12px; flex-wrap: wrap; }
        .header-left { display: flex; align-items: center; gap: 12px; }
        .header-icon { width: 40px; height: 40px; border-radius: 10px; background: #dcfce7; color: #15803d; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        h2 { font-family: var(--font-display); font-size: 15px; color: var(--text-primary); margin: 0 0 2px; }
        p { font-size: 12px; color: var(--text-muted); margin: 0; }
        p strong { color: #15803d; }
        .header-actions { display: flex; align-items: center; gap: 8px; }
        .count-badge { background: #dcfce7; color: #15803d; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; }
        .export-btn { display: flex; align-items: center; gap: 5px; font-size: 12px; padding: 6px 12px; border-radius: 6px; border: 1px solid #bbf7d0; background: #f0fdf4; cursor: pointer; color: #15803d; font-family: var(--font-body); transition: all 0.13s; }
        .export-btn:hover { background: #dcfce7; }
        .month-selector { display: flex; gap: 4px; flex-wrap: wrap; background: var(--card-bg); border: 1px solid var(--border); border-radius: 10px; padding: 10px 12px; }
        .month-btn { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 6px 8px; border-radius: 7px; border: 1px solid transparent; background: none; cursor: pointer; transition: all 0.13s; min-width: 40px; }
        .month-btn:hover { background: var(--hover-bg); }
        .month-btn.current { border-color: #bbf7d0; }
        .month-btn.active { background: #15803d; border-color: #15803d; }
        .month-btn.active .month-name { color: white; }
        .month-btn.active .month-count { background: rgba(255,255,255,0.25); color: white; }
        .month-name { font-size: 11px; font-weight: 600; color: var(--text-secondary); }
        .month-count { font-size: 9px; font-weight: 700; background: #dcfce7; color: #15803d; padding: 1px 5px; border-radius: 8px; }
        .today-banner { background: linear-gradient(135deg, #fef9c3, #dcfce7); border: 1px solid #bbf7d0; border-radius: 10px; padding: 12px 16px; }
        .confetti-row { display: flex; gap: 4px; margin-bottom: 6px; }
        .confetti { font-size: 16px; animation: bounce 0.6s ease infinite alternate; }
        @keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-4px); } }
        .today-banner p { font-size: 13px; color: #15803d; margin: 0; }
        .cards { display: flex; flex-direction: column; gap: 8px; }
        .birthday-card { display: flex; align-items: center; gap: 12px; background: var(--card-bg); border: 1px solid var(--border); border-left: 3px solid; border-radius: 10px; padding: 12px 16px; animation: cardIn 0.2s ease both; transition: box-shadow 0.13s; }
        .birthday-card:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.07); }
        .birthday-card.today { background: #f0fdf4; border-color: #86efac; }
        @keyframes cardIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .card-avatar { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 14px; font-weight: 700; flex-shrink: 0; }
        .card-info { flex: 1; min-width: 0; }
        .card-name { font-size: 13px; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 6px; }
        .today-tag { font-size: 10px; font-weight: 700; background: #dcfce7; color: #15803d; padding: 2px 7px; border-radius: 10px; }
        .card-meta { font-size: 11px; color: var(--text-muted); margin: 2px 0; display: flex; align-items: center; gap: 6px; }
        .sh-badge { background: #fef9c3; color: #854d0e; font-size: 9px; font-weight: 700; padding: 1px 5px; border-radius: 8px; }
        .card-date { font-size: 12px; color: var(--text-secondary); display: flex; align-items: center; gap: 7px; margin-top: 2px; }
        .age-badge { font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 10px; }
        .card-right { flex-shrink: 0; }
        .days-circle { width: 48px; height: 48px; border-radius: 50%; border: 2px solid; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .today-circle { width: 48px; height: 48px; border-radius: 50%; border: 2px solid; display: flex; align-items: center; justify-content: center; }
        .today-emoji { font-size: 20px; }
        .days-num { font-family: var(--font-display); font-size: 16px; line-height: 1; }
        .days-label { font-size: 8px; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.7; }
        .past-tag { font-size: 10px; color: var(--text-muted); background: var(--code-bg); padding: 3px 8px; border-radius: 10px; }
        .empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 48px; color: var(--text-muted); text-align: center; background: var(--card-bg); border: 1px solid var(--border); border-radius: 10px; }
        .empty p { font-size: 14px; color: var(--text-secondary); margin: 0; }
        .empty span { font-size: 11px; }
      `}</style>
    </div>
  );
}
