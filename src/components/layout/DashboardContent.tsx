'use client';
import { useDashboard } from '@/lib/hooks/useDashboard';
import EmployeeTable from '@/components/shared/EmployeeTable';
import SummaryPanel from '@/components/summary/SummaryPanel';
import AlertPanel from '@/components/alert/AlertPanel';

export default function DashboardContent() {
  const { activeView } = useDashboard();

  return (
    <main className="main">
      <div className="content anim-fade-up delay-2">
        {activeView === 'employees' && <EmployeeTable />}
        {activeView === 'summary'   && <SummaryPanel />}
        {activeView === 'alert'     && <AlertPanel />}
      </div>

      <style jsx>{`
        .main {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }
        .content {
          flex: 1;
          padding: 20px 24px;
          overflow-y: auto;
        }
        @media (max-width: 768px) {
          .content { padding: 14px 12px; }
        }
      `}</style>
    </main>
  );
}
