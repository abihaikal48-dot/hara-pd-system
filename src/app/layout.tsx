'use client';

import React from 'react';
import './globals.css';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function MainAppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg dark:bg-dark-bg">
        <Loader2 className="w-8 h-8 border-4 border-brand-border border-t-brand-red rounded-full animate-spin" />
      </div>
    );
  }

  // SINKRONISASI KRUSIAL: Jika membuka rute ujian kru (/ujian), bypass login langsung [1]
  if (pathname && pathname.startsWith('/ujian')) {
    return <>{children}</>;
  }

  // Jika belum masuk log, arahkan ke login page (src/app/page.tsx)
  if (!user) {
    return <>{children}</>;
  }

  return <>{children}</>;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="font-sans antialiased">
        <AuthProvider>
          <MainAppShell>{children}</MainAppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
