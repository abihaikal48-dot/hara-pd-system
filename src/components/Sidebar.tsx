'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Database, ShieldAlert, CalendarRange, Eye, MessageSquare, 
  TrendingUp, AlertOctagon, Star, FileSpreadsheet, HelpCircle, FileCheck, 
  Users, Settings, LogOut, ChevronDown, Award, DollarSign, Target, ClipboardList,
  BookOpen, RefreshCw, Bookmark, Sliders, Menu, X, Users2, Shield, Flame
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [isPdSubOpen, setIsPdSubOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const navClass = (path: string) => `
    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150
    ${isActive(path) 
      ? 'bg-white text-brand-red-dark font-semibold shadow-md dark:bg-dark-card dark:text-brand-yellow' 
      : 'text-white/80 hover:bg-white/10 hover:text-white hover:translate-x-1'
    }
  `;

  return (
    <>
      {/* Backdrop Kaca Gelap - Aktif hanya di Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Laci Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-[270px] bg-gradient-to-br from-brand-red-dark via-brand-red to-[#D9583F] 
        text-white p-5 flex flex-col z-50 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header Brand */}
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFDD7A] to-brand-yellow flex items-center justify-center font-black text-lg text-brand-red-dark shadow-lg">
              H
            </div>
            <div>
              <h1 className="font-extrabold text-sm leading-none tracking-wide">Hara Chicken</h1>
              <p className="text-[9px] opacity-80 uppercase tracking-[2px] mt-1 font-semibold">People Dev</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 rounded-lg hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Navigasi Sesuai Skema Database (Scrollable jika layar HP pendek) */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Kelompok Utama */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-2 px-1">Utama</p>
            <Link href="/dashboard" className={navClass('/dashboard')} onClick={onClose}>
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          </div>

          {/* Kelompok Data Master */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-2 px-1">Master</p>
            <div className="space-y-1">
              <Link href="/master/outlets" className={navClass('/master/outlets')} onClick={onClose}>
                <Database className="w-4 h-4" />
                <span>Master Outlet</span>
              </Link>
              <Link href="/master/kru" className={navClass('/master/kru')} onClick={onClose}>
                <Users2 className="w-4 h-4" />
                <span>Master Kru</span>
              </Link>
            </div>
          </div>

          {/* Kelompok Siklus Training */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-2 px-1">Siklus Training</p>
            <div className="space-y-1">
              <Link href="/tna" className={navClass('/tna')} onClick={onClose}>
                <ShieldAlert className="w-4 h-4" />
                <span>TNA</span>
              </Link>
              <Link href="/rencana-training" className={navClass('/rencana-training')} onClick={onClose}>
                <CalendarRange className="w-4 h-4" />
                <span>Rencana Training</span>
              </Link>
              <Link href="/observasi" className={navClass('/observasi')} onClick={onClose}>
                <Eye className="w-4 h-4" />
                <span>Observasi Lapangan</span>
              </Link>
              <Link href="/coaching" className={navClass('/coaching')} onClick={onClose}>
                <MessageSquare className="w-4 h-4" />
                <span>Coaching Log</span>
              </Link>
              <Link href="/gap-analysis" className={navClass('/gap-analysis')} onClick={onClose}>
                <TrendingUp className="w-4 h-4" />
                <span>Gap Analysis</span>
              </Link>
              <Link href="/keluhan" className={navClass('/keluhan')} onClick={onClose}>
                <AlertOctagon className="w-4 h-4" />
                <span>Kartu Keluhan</span>
              </Link>
              <Link href="/talent-tracker" className={navClass('/talent-tracker')} onClick={onClose}>
                <Star className="w-4 h-4" />
                <span>Talent Tracker</span>
              </Link>
            </div>
          </div>

          {/* Submenu Lanjutan (Siklus PD Profesional - Collapsible) */}
          <div>
            <button 
              onClick={() => setIsPdSubOpen(!isPdSubOpen)}
              className="w-full flex items-center justify-between text-white/50 text-[10px] uppercase tracking-wider font-bold mb-2 px-1 hover:text-white"
            >
              <span>PD Lanjutan (Pro)</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isPdSubOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <div className={`space-y-1 pl-2 border-l border-white/10 mt-1 transition-all duration-200 ${isPdSubOpen ? 'block' : 'hidden'}`}>
              <Link href="/pd/idp" className={navClass('/pd/idp')} onClick={onClose}>
                <Target className="w-3.5 h-3.5" />
                <span className="text-xs">🎯 IDP Karyawan</span>
              </Link>
              <Link href="/pd/evaluasi-reaksi" className={navClass('/pd/evaluasi-reaksi')} onClick={onClose}>
                <ClipboardList className="w-3.5 h-3.5" />
                <span className="text-xs">📋 Evaluasi L1</span>
              </Link>
              <Link href="/pd/pre-post" className={navClass('/pd/pre-post')} onClick={onClose}>
                <FileCheck className="w-3.5 h-3.5" />
                <span className="text-xs">📊 Pre/Post Test</span>
              </Link>
              <Link href="/pd/onboarding" className={navClass('/pd/onboarding')} onClick={onClose}>
                <Sliders className="w-3.5 h-3.5" />
                <span className="text-xs">🚀 Onboarding</span>
              </Link>
              <Link href="/pd/budget" className={navClass('/pd/budget')} onClick={onClose}>
                <DollarSign className="w-3.5 h-3.5" />
                <span className="text-xs">💰 Budget Training</span>
              </Link>
              <Link href="/pd/pip" className={navClass('/pd/pip')} onClick={onClose}>
                <Shield className="w-3.5 h-3.5" />
                <span className="text-xs">⚖️ PIP Kinerja</span>
              </Link>
              <Link href="/pd/kamus" className={navClass('/pd/kamus')} onClick={onClose}>
                <BookOpen className="w-3.5 h-3.5" />
                <span className="text-xs">📖 Kamus Kompetensi</span>
              </Link>
              <Link href="/pd/audit" className={navClass('/pd/audit')} onClick={onClose}>
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span className="text-xs">🔍 Audit Operasional</span>
              </Link>
              <Link href="/pd/recognition" className={navClass('/pd/recognition')} onClick={onClose}>
                <Flame className="w-3.5 h-3.5" />
                <span className="text-xs">⭐ Reward & Kudos</span>
              </Link>
              <Link href="/pd/sertifikasi" className={navClass('/pd/sertifikasi')} onClick={onClose}>
                <Award className="w-3.5 h-3.5" />
                <span className="text-xs">🎖️ Sertifikasi Kru</span>
              </Link>
            </div>
          </div>

          {/* Bank Asesmen */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-2 px-1">Bank &amp; Asesmen</p>
            <div className="space-y-1">
              <Link href="/bank/sop" className={navClass('/bank/sop')} onClick={onClose}>
                <Bookmark className="w-4 h-4" />
                <span>Bank SOP</span>
              </Link>
              <Link href="/bank/soal" className={navClass('/bank/soal')} onClick={onClose}>
                <HelpCircle className="w-4 h-4" />
                <span>Bank Soal</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Profil Singkat & Tombol Keluar */}
        <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-yellow text-brand-red-dark font-bold text-xs flex items-center justify-center">
              HK
            </div>
            <div>
              <p className="text-xs font-bold leading-none">Haikal</p>
              <p className="text-[10px] opacity-60">PD Admin</p>
            </div>
          </div>
          <button className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white" title="Keluar">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
}
