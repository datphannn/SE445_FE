'use client';
import { useDashboard } from '@/lib/hooks/useDashboard';
import AnniversaryAlert from './AnniversaryAlert';
import VacationCapAlert from './VacationCapAlert';
import BenefitsChangeAlert from './BenefitsChangeAlert';
import BirthdayAlert from './BirthdayAlert';

export default function AlertPanel() {
  const { alertTab } = useDashboard();
  return (
    <div>
      {alertTab === 'anniversary'      && <AnniversaryAlert />}
      {alertTab === 'vacation-cap'     && <VacationCapAlert />}
      {alertTab === 'benefits-change'  && <BenefitsChangeAlert />}
      {alertTab === 'birthdays'        && <BirthdayAlert />}
    </div>
  );
}
