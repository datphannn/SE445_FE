'use client';
import { DashboardProvider, useDashboard } from '@/lib/hooks/useDashboard';
import Sidebar from '@/components/layout/Sidebar';
import TopNav from '@/components/layout/TopNav';
import DashboardContent from '@/components/layout/DashboardContent';

function Layout() {
  const { sidebarOpen, setSidebarOpen } = useDashboard();
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />
      {/* Sidebar */}
      <Sidebar />
      {/* Main column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <TopNav />
        <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }}>
          <DashboardContent />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <DashboardProvider>
      <Layout />
    </DashboardProvider>
  );
}
