'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardProvider, useDashboard } from '@/lib/hooks/useDashboard';
import { useAuth } from '@/lib/hooks/useAuth';
import Sidebar from '@/components/layout/Sidebar';
import TopNav from '@/components/layout/TopNav';
import DashboardContent from '@/components/layout/DashboardContent';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)', flexDirection: 'column', gap: 12,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'serif', fontSize: 20, fontWeight: 700, color: 'white',
          animation: 'pulse 1s ease infinite',
        }}>A</div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading...</p>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
      </div>
    );
  }

  return <>{children}</>;
}

function Layout() {
  const { sidebarOpen, setSidebarOpen } = useDashboard();
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />
      <Sidebar />
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
    <AuthGuard>
      <DashboardProvider>
        <Layout />
      </DashboardProvider>
    </AuthGuard>
  );
}
