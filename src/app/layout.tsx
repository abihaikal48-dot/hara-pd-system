import React from 'react';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'Hara Chicken - People Development System Pro',
  description: 'Sistem People Development Multi-Outlet — Hara Chicken',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="font-sans antialiased bg-brand-bg text-brand-ink transition-colors duration-200">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
