'use client';
import { useMemo } from 'react';
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { useDashboard } from '@/lib/hooks/useDashboard';
import { getAverageBenefit } from '@/lib/utils/employeeUtils';

export default function BenefitsChangeAlert() {
  const { allEmployees, departments } = useDashboard();

  const alerts = useMemo(() => {
    const results: {
      emp: typeof allEmployees[0];
      changedAt: string;
      fromPlan: string;
      toPlan: string;
      payrollDelta: number;
      dept: { name: string } | undefined;
    }[] = [];

    allEmployees.forEach(emp => {
      const changedBenefits = emp.benefits.filter(b => b.affectsPayroll && b.changedAt);
      changedBenefits.forEach(benefit => {
        // Calculate delta vs previous year avg
        const prevAvg = getAverageBenefit(emp, benefit.year - 1);
        const delta = benefit.amount - prevAvg;
        const dept = departments.find(d => d.id === emp.departmentId);
        // Find previous plan (year before)
        const prevBenefit = emp.benefits.find(b => b.year === benefit.year - 1);
        results.push({
          emp,
          changedAt: benefit.changedAt!,
          fromPlan: prevBenefit?.plan ?? 'N/A',
          toPlan: benefit.plan,
          payrollDelta: Math.round(delta),
          dept,
        });
      });
    });

    return results.sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime());
  }, [allEmployees]);

  const totalImpact = alerts.reduce((s, a) => s + a.payrollDelta, 0);
  const positive = alerts.filter(a => a.payrollDelta >= 0).length;
  const negative = alerts.filter(a => a.payrollDelta < 0).length;

  return (
    <div className="alert-panel">
      {/* Header */}
      <div className="panel-header">
        <div className="header-left">
          <div className="header-icon"><RefreshCw size={18} /></div>
          <div>
            <h2>Benefits Plan Change Alerts</h2>
            <p>Employees who changed their benefits plan affecting payroll</p>
          </div>
        </div>
        <div className="header-actions">
          <span className="pill blue">{alerts.length} change{alerts.length !== 1 ? 's' : ''}</span>
          <span className={`pill ${totalImpact >= 0 ? 'green' : 'red'}`}>
            {totalImpact >= 0 ? '+' : ''}${totalImpact}/mo net impact
          </span>
        </div>
      </div>

      {/* Summary bar */}
      {alerts.length > 0 && (
        <div className="summary-bar">
          <div className="summary-item">
            <TrendingUp size={13} className="icon-up" />
            <span><strong>{positive}</strong> benefit increase{positive !== 1 ? 's' : ''}</span>
          </div>
          <div className="divider" />
          <div className="summary-item">
            <TrendingDown size={13} className="icon-down" />
            <span><strong>{negative}</strong> benefit decrease{negative !== 1 ? 's' : ''}</span>
          </div>
          <div className="divider" />
          <div className="summary-item">
            <span>Net payroll impact: <strong className={totalImpact >= 0 ? 'up' : 'down'}>{totalImpact >= 0 ? '+' : ''}${totalImpact}/mo</strong></span>
          </div>
        </div>
      )}

      {/* Change cards */}
      {alerts.length > 0 ? (
        <div className="cards">
          {alerts.map(({ emp, changedAt, fromPlan, toPlan, payrollDelta, dept }, i) => {
            const isIncrease = payrollDelta >= 0;
            const initials = `${emp.firstName.charAt(0)}${emp.lastName.charAt(0)}`;
            const changeDate = new Date(changedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
            const planColor: Record<string, string> = { Basic: '#94a3b8', Standard: '#06b6d4', Premium: '#2563eb', Executive: '#d97706' };

            return (
              <div key={`${emp.id}-${changedAt}`} className="change-card" style={{ animationDelay: `${i * 40}ms` }}>
                <div className="card-left">
                  <div className="card-avatar">{initials}</div>
                </div>
                <div className="card-body">
                  <div className="card-row">
                    <div>
                      <span className="emp-name">{emp.firstName} {emp.lastName}</span>
                      <span className="emp-meta">
                        · {dept?.name.replace(' Department', '')}
                        {emp.isShareholder && <span className="sh-badge">★ SH</span>}
                      </span>
                    </div>
                    <div className="change-date">📅 {changeDate}</div>
                  </div>
                  <div className="plan-change">
                    <span className="plan-tag" style={{ background: planColor[fromPlan] + '20', color: planColor[fromPlan] || '#94a3b8', borderColor: planColor[fromPlan] + '40' }}>
                      {fromPlan}
                    </span>
                    <span className="arrow">→</span>
                    <span className="plan-tag new" style={{ background: planColor[toPlan] + '20', color: planColor[toPlan] || '#94a3b8', borderColor: planColor[toPlan] + '40' }}>
                      {toPlan}
                    </span>
                    <div className={`delta-badge ${isIncrease ? 'increase' : 'decrease'}`}>
                      {isIncrease ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                      {isIncrease ? '+' : ''}${payrollDelta}/mo
                    </div>
                  </div>
                  <div className="payroll-note">
                    Payroll affected — {isIncrease ? 'cost increased' : 'cost decreased'} by ${Math.abs(payrollDelta)}/month
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty">
          <RefreshCw size={32} />
          <p>No benefits plan changes affecting payroll</p>
        </div>
      )}

      <style jsx>{`
        .alert-panel { display: flex; flex-direction: column; gap: 12px; }
        .panel-header { display: flex; align-items: center; justify-content: space-between; background: var(--card-bg); border: 1px solid var(--border); border-radius: 10px; padding: 16px 18px; gap: 12px; flex-wrap: wrap; }
        .header-left { display: flex; align-items: center; gap: 12px; }
        .header-icon { width: 40px; height: 40px; border-radius: 10px; background: #f3e8ff; color: #7c3aed; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        h2 { font-family: var(--font-display); font-size: 15px; color: var(--text-primary); margin: 0 0 2px; }
        p { font-size: 12px; color: var(--text-muted); margin: 0; }
        .header-actions { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        .pill { font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 20px; }
        .pill.blue { background: #eff6ff; color: #1d4ed8; }
        .pill.green { background: #dcfce7; color: #15803d; }
        .pill.red { background: #fee2e2; color: #b91c1c; }
        .summary-bar { display: flex; align-items: center; gap: 16px; background: var(--card-bg); border: 1px solid var(--border); border-radius: 10px; padding: 12px 18px; flex-wrap: wrap; }
        .summary-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-secondary); }
        .icon-up { color: #16a34a; }
        .icon-down { color: var(--danger); }
        .divider { width: 1px; height: 16px; background: var(--border); }
        .up { color: #16a34a; }
        .down { color: var(--danger); }
        .cards { display: flex; flex-direction: column; gap: 8px; }
        .change-card { display: flex; gap: 12px; background: var(--card-bg); border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px; animation: cardIn 0.2s ease both; transition: box-shadow 0.13s; }
        .change-card:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.07); }
        @keyframes cardIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .card-avatar { width: 40px; height: 40px; border-radius: 10px; background: #f3e8ff; color: #7c3aed; display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 15px; font-weight: 700; flex-shrink: 0; }
        .card-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px; }
        .card-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; flex-wrap: wrap; }
        .emp-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
        .emp-meta { font-size: 11px; color: var(--text-muted); }
        .sh-badge { background: #fef9c3; color: #854d0e; font-size: 9px; font-weight: 700; padding: 1px 5px; border-radius: 8px; margin-left: 4px; }
        .change-date { font-size: 11px; color: var(--text-muted); white-space: nowrap; }
        .plan-change { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .plan-tag { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 6px; border: 1px solid; }
        .arrow { color: var(--text-muted); font-size: 14px; }
        .delta-badge { display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 6px; margin-left: 4px; }
        .delta-badge.increase { background: #dcfce7; color: #15803d; }
        .delta-badge.decrease { background: #fee2e2; color: #b91c1c; }
        .payroll-note { font-size: 11px; color: var(--text-muted); padding: 6px 10px; background: var(--hover-bg); border-radius: 6px; }
        .empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 48px; color: var(--text-muted); text-align: center; background: var(--card-bg); border: 1px solid var(--border); border-radius: 10px; }
        .empty p { font-size: 14px; color: var(--text-secondary); margin: 0; }
      `}</style>
    </div>
  );
}
