'use client';

import React, { useState } from 'react';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import { AuthProvider, useAuth } from '@/context/AuthContext';

function MainAppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Jika sistem sedang memeriksa sesi login
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-brand-bg dark:bg-dark-bg">
        <div className="w-8 h-8 border-4 border-brand-border border-t-brand-red rounded-full animate-spin" />
      </div>
    );
  }

  // Jika belum masuk log, arahkan langsung ke halaman login murni (bebas layout sidebar)
  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-brand-bg dark:bg-dark-bg text-brand-ink dark:text-dark-ink transition-colors duration-200">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
