'use client';
import { useDashboard } from '@/lib/hooks/useDashboard';
import EarningsPanel from './EarningsPanel';
import VacationPanel from './VacationPanel';
import BenefitsPanel from './BenefitsPanel';

export default function SummaryPanel() {
  const { summaryTab } = useDashboard();
  return (
    <div>
      {summaryTab === 'earnings' && <EarningsPanel />}
      {summaryTab === 'vacation' && <VacationPanel />}
      {summaryTab === 'benefits' && <BenefitsPanel />}
    </div>
  );
}
