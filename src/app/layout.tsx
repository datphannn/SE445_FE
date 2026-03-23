import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/hooks/useAuth';

export const metadata: Metadata = {
  title: 'ACME HR Dashboard',
  description: 'HR Management Dashboard for ACME Company',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
