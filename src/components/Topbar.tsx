'use client';

import React, { useState, useEffect } from 'react';
import { Menu, Sun, Moon, Bell, Search } from 'lucide-react';

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark';
    setDarkMode(isDark);
    if (isDark) document.documentElement.classList.add('dark');
  }, []);

  const toggleDarkMode = () => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  return (
    <header className="bg-white dark:bg-dark-card border-b border-brand-border dark:border-dark-border px-4 py-3 flex items-center justify-between sticky top-0 z-30 transition-colors duration-200">
      <div className="flex items-center gap-3">
        {/* Tombol Hamburger - Muncul Hanya di Mobile (HP) */}
        <button 
          onClick={onMenuClick} 
          className="lg:hidden p-2 rounded-lg text-brand-ink dark:text-dark-ink hover:bg-brand-bg dark:hover:bg-dark-bg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-sm font-bold text-brand-ink dark:text-dark-ink">Dashboard Evaluasi</h2>
          <p className="text-[10px] text-brand-muted dark:text-dark-muted hidden xs:block">HARA-PD System Pro v2</p>
        </div>
      </div>

      {/* Filter Global & Fitur Aksi */}
      <div className="flex items-center gap-2">
        <select className="text-xs bg-brand-bg dark:bg-dark-bg border border-brand-border dark:border-dark-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-red max-w-[120px]">
          <option value="">Semua Outlet</option>
        </select>

        {/* Notifikasi */}
        <button className="p-2 rounded-lg text-brand-ink dark:text-dark-ink hover:bg-brand-bg dark:hover:bg-dark-bg relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-brand-red rounded-full ring-2 ring-white dark:ring-dark-card" />
        </button>

        {/* Mode Gelap */}
        <button 
          onClick={toggleDarkMode}
          className="p-2 rounded-lg text-brand-ink dark:text-dark-ink hover:bg-brand-bg dark:hover:bg-dark-bg transition-colors"
        >
          {darkMode ? <Sun className="w-4 h-4 text-brand-yellow" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
