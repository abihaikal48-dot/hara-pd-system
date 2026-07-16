'use client';

import React, { useState } from 'react';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <html lang="id">
      <body className="font-sans antialiased">
        <div className="flex h-screen overflow-hidden bg-brand-bg dark:bg-dark-bg text-brand-ink dark:text-dark-ink transition-colors duration-200">
          
          {/* Komponen Sidebar Responsif */}
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

          {/* Area Kanan (Topbar + Isi Halaman) */}
          <div className="flex-1 flex flex-col min-w-0">
            <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
            
            <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20">
              <div className="max-w-7xl mx-auto animate-fade-in">
                {children}
              </div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
