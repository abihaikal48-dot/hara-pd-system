'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { 
  Building2, Users, FileWarning, ClipboardCheck, TrendingUp, AlertCircle, ChevronRight 
} from 'lucide-react';

const AVATAR_COLORS = ['#C0392B', '#F4B400', '#8E2A1F', '#E67E22', '#2E86AB', '#6C3483', '#16A085'];

function initialsOf(name: string) {
  if (!name) return '?';
  return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function avatarColorOf(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalOutlet: 0,
    totalKru: 0,
    tnaOpen: 0,
    complaintOpen: 0
  });
  const [bciData, setBciData] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [tnaList, setTnaList] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Status Ucapan berdasarkan Jam
  const [greeting, setGreeting] = useState('Selamat Datang');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 11) setGreeting('Selamat Pagi');
    else if (hour < 15) setGreeting('Selamat Siang');
    else if (hour < 18) setGreeting('Selamat Sore');
    else setGreeting('Selamat Malam');

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // 1. Ambil Statistik Ringkasan
        const { count: outletCount } = await supabase.from('outlets').select('*', { count: 'exact', head: true }).eq('status_aktif', true);
        const { count: kruCount } = await supabase.from('kru').select('*', { count: 'exact', head: true }).eq('status_aktif', true);
        const { count: tnaCount } = await supabase.from('tna').select('*', { count: 'exact', head: true }).neq('status', 'Selesai');
        const { count: compCount } = await supabase.from('kartu_keluhan').select('*', { count: 'exact', head: true }).neq('status', 'Selesai');

        setStats({
          totalOutlet: outletCount || 0,
          totalKru: kruCount || 0,
          tnaOpen: tnaCount || 0,
          complaintOpen: compCount || 0
        });

        // 2. Ambil Riwayat Observasi untuk BCI & Leaderboard
        const { data: obsData } = await supabase.from('observasi_lapangan').select('*, outlets(nama_outlet), kru(nama_kru, divisi)');
        
        const bciMap: Record<string, { total: number; sesuai: number }> = {};
        const leaderboardMap: Record<string, { nama: string; divisi: string; total: number; sesuai: number }> = {};

        obsData?.forEach(o => {
          // Hitung BCI per Outlet
          const outletName = o.outlets?.nama_outlet || 'Tanpa Nama';
          if (!bciMap[outletName]) bciMap[outletName] = { total: 0, sesuai: 0 };
          bciMap[outletName].total += 1;
          if (o.hasil === 'Sesuai Standar') bciMap[outletName].sesuai += 1;

          // Hitung BCI per Kru untuk Leaderboard
          const kruName = o.kru?.nama_kru;
          if (kruName) {
            if (!leaderboardMap[kruName]) {
              leaderboardMap[kruName] = { nama: kruName, divisi: o.kru?.divisi || '-', total: 0, sesuai: 0 };
            }
            leaderboardMap[kruName].total += 1;
            if (o.hasil === 'Sesuai Standar') leaderboardMap[kruName].sesuai += 1;
          }
        });

        // Mapping Chart BCI
        const bciChart = Object.keys(bciMap).map(name => ({
          name,
          bci: Math.round((bciMap[name].sesuai / bciMap[name].total) * 100)
        }));
        setBciData(bciChart);

        // Mapping Leaderboard (Urutkan dari BCI Tertinggi)
        const ldList = Object.values(leaderboardMap).map(l => ({
          ...l,
          bci: Math.round((l.sesuai / l.total) * 100)
        })).sort((a, b) => b.bci - a.bci).slice(0, 5);
        setLeaderboard(ldList);

        // 3. TNA Prioritas Tinggi
        const { data: tnaData } = await supabase
          .from('tna')
          .select('*, outlets(nama_outlet)')
          .eq('prioritas', 'Tinggi')
          .neq('status', 'Selesai')
          .limit(5);
        setTnaList(tnaData || []);

        // 4. Keluhan Terbuka
        const { data: compData } = await supabase
          .from('kartu_keluhan')
          .select('*, outlets(nama_outlet)')
          .neq('status', 'Selesai')
          .limit(5);
        setComplaints(compData || []);

      } catch (err) {
        console.error('Gagal memuat data dashboard', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-brand-border border-t-brand-red rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-slide-in">
      {/* ===== HERO BANNER GRADASI (SAMA PERSIS SEPERTI CODES ASLI) ===== */}
      <div className="relative overflow-hidden bg-gradient-to-r from-brand-red-dark via-brand-red to-[#D9583F] p-6 md:p-8 rounded-2xl text-white shadow-xl flex flex-col md:flex-row justify-between items-center animate-gradient-shift">
        <div className="space-y-2 z-10 text-center md:text-left max-w-lg">
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-yellow">HARA-PD SYSTEM PRO</p>
          <h1 className="text-xl md:text-2xl font-black">{greeting}, {user?.nama || 'Haikal'} 👋</h1>
          <p className="text-xs text-white/90 leading-relaxed">
            Sistem evaluasi pengembangan terstruktur. Pantau seluruh progresi pelatihan mandiri, audit lapangan, dan kesenjangan kompetensi tim.
          </p>
        </div>

        {/* Kru Ilustrasi Melayang (Vector SVG Klasik dari Index.html) */}
        <div className="w-full md:w-auto mt-6 md:mt-0 flex justify-center z-10">
          <svg className="w-52 h-28 overflow-visible" viewBox="0 0 300 120">
            {/* Kru 1 - Helper */}
            <g className="animate-float-slow">
              <circle cx="50" cy="50" r="16" fill="#F7D9B8" />
              <path d="M50 36 a16 16 0 0 1 16 14 h-32 a16 16 0 0 1 16 -14 z" fill="#3A241B" />
              <rect x="33" y="65" width="34" height="55" rx="14" fill="#8E2A1F" />
              <path d="M36 69 h28 l-4 40 h-20 z" fill="#F4B400" />
            </g>
            {/* Kru 2 - Kitchen */}
            <g className="animate-float-med">
              <circle cx="150" cy="45" r="18" fill="#FFE8B0" />
              <rect x="134" y="22" width="32" height="12" rx="6" fill="#fff" />
              <rect x="137" y="15" width="26" height="10" rx="5" fill="#fff" />
              <rect x="127" y="61" width="46" height="70" rx="16" fill="#ffffff" />
              <path d="M131 66 h38 l-5 50 h-28 z" fill="#C0392B" />
            </g>
            {/* Kru 3 - Kasir */}
            <g className="animate-float-fast">
              <circle cx="250" cy="52" r="15" fill="#F7D9B8" />
              <path d="M250 37 a15 15 0 0 1 15 13 h-30 a15 15 0 0 1 15 -13 z" fill="#241512" />
              <rect x="230" y="66" width="40" height="60" rx="15" fill="#8E2A1F" />
              <rect x="230" y="66" width="40" height="15" rx="7" fill="#ffffff" opacity="0.9" />
            </g>
          </svg>
        </div>
      </div>

      {/* Info Warning Banner */}
      <div className="bg-brand-red/5 p-4 border-l-4 border-brand-red dark:border-brand-yellow rounded-r-xl text-xs text-brand-red-dark dark:text-brand-yellow leading-relaxed flex items-start gap-2.5 shadow-sm">
        <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
        <p><b>Dashboard Evaluasi:</b> Data grafik serta status kelulusan di bawah ini disinkronisasikan secara native langsung dari cloud Supabase Anda.</p>
      </div>

      {/* ===== CARD KPI ROW (DELAYED POP-IN ANIMATIONS) ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Master Outlet', value: stats.totalOutlet, sub: 'Status aktif', color: 'text-brand-red', delay: 'animate-pop-in' },
          { label: 'Kru Aktif', value: stats.totalKru, sub: 'Terpelihara', color: 'text-brand-yellow', delay: 'animate-pop-in [animation-delay:100ms]' },
          { label: 'Sesi TNA Terbuka', value: stats.tnaOpen, sub: 'Butuh evaluasi', color: 'text-amber-500', delay: 'animate-pop-in [animation-delay:200ms]' },
          { label: 'Keluhan Terbuka', value: stats.complaintOpen, sub: 'Perlu respon segera', color: 'text-emerald-500', delay: 'animate-pop-in [animation-delay:300ms]' }
        ].map((kpi, idx) => (
          <div key={idx} className={`bg-white dark:bg-dark-card p-4 rounded-xl border border-brand-border dark:border-dark-border shadow-sm flex items-center justify-between transition-transform duration-150 hover:-translate-y-1 ${kpi.delay}`}>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-brand-muted dark:text-dark-muted mb-1">{kpi.label}</p>
              <h3 className="text-xl md:text-2xl font-black text-brand-ink dark:text-dark-ink">{kpi.value}</h3>
              <p className="text-[9px] text-brand-muted mt-1">{kpi.sub}</p>
            </div>
            <div className={`p-2.5 rounded-lg bg-brand-bg dark:bg-dark-bg ${kpi.color}`}>
              {idx === 0 && <Building2 className="w-5 h-5" />}
              {idx === 1 && <Users className="w-5 h-5" />}
              {idx === 2 && <FileWarning className="w-5 h-5" />}
              {idx === 3 && <ClipboardCheck className="w-5 h-5" />}
            </div>
          </div>
        ))}
      </div>

      {/* ===== GRAFIK GRADASI NATIVE (SANGAT RESPONSIF DI PONSEL) ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Grafis BCI per Outlet */}
        <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-brand-border dark:border-dark-border shadow-sm">
          <h2 className="text-xs font-black text-brand-muted uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-brand-red" />
            <span>Behavior Change Index (BCI) per Outlet</span>
          </h2>
          <div className="space-y-4">
            {bciData.length === 0 ? (
              <p className="text-xs text-brand-muted py-10 text-center">Belum ada data observasi masuk.</p>
            ) : (
              bciData.map((data, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span>{data.name}</span>
                    <span className={data.bci >= 80 ? 'text-emerald-500' : data.bci >= 60 ? 'text-amber-500' : 'text-brand-red'}>
                      {data.bci}%
                    </span>
                  </div>
                  <div className="h-3 bg-brand-bg dark:bg-dark-bg rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        data.bci >= 80 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : data.bci >= 60 ? 'bg-gradient-to-r from-amber-300 to-amber-500' : 'bg-gradient-to-r from-brand-red to-brand-red-dark'
                      }`}
                      style={{ width: `${data.bci}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Klasemen Leaderboard Kru Terpilih */}
        <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-brand-border dark:border-dark-border shadow-sm">
          <h2 className="text-xs font-black text-brand-muted uppercase tracking-wider mb-4">🏆 Leaderboard Kru (BCI Tertinggi)</h2>
          <div className="space-y-3">
            {leaderboard.length === 0 ? (
              <p className="text-xs text-brand-muted py-10 text-center">Belum ada aktivitas penilaian.</p>
            ) : (
              leaderboard.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-brand-bg/50 dark:hover:bg-dark-bg/20 transition-all">
                  <div className="w-5 text-center font-black text-brand-muted">{idx + 1}</div>
                  <div 
                    className="w-9 h-9 rounded-full font-bold text-white text-xs flex items-center justify-center shadow-md"
                    style={{ backgroundColor: avatarColorOf(item.nama) }}
                  >
                    {initialsOf(item.nama)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate text-brand-ink dark:text-dark-ink">{item.nama}</p>
                    <p className="text-[10px] text-brand-muted">{item.divisi}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    item.bci >= 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {item.bci}%
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* ===== BOTTOM BARISAN TABEL LAPORAN (TNA & KELUHAN) ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* TNA Terbuka */}
        <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-brand-border dark:border-dark-border shadow-sm">
          <h2 className="text-xs font-black text-brand-muted uppercase tracking-wider mb-3">🔴 TNA Prioritas Tinggi Belum Selesai</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-brand-border dark:border-dark-border pb-2 text-brand-muted">
                  <th className="pb-2 font-bold">Outlet</th>
                  <th className="pb-2 font-bold">Divisi</th>
                  <th className="pb-2 font-bold">Deskripsi Gap</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border dark:divide-dark-border">
                {tnaList.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-brand-muted">Tidak ada temuan prioritas tinggi.</td>
                  </tr>
                ) : (
                  tnaList.map((t, idx) => (
                    <tr key={idx} className="hover:bg-brand-bg/50 dark:hover:bg-dark-bg/25">
                      <td className="py-2.5 font-bold">{t.outlets?.nama_outlet || '-'}</td>
                      <td className="py-2.5 font-semibold text-brand-red">{t.divisi}</td>
                      <td className="py-2.5 text-brand-muted truncate max-w-[150px]">{t.deskripsi_gap}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Keluhan Terbuka */}
        <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-brand-border dark:border-dark-border shadow-sm">
          <h2 className="text-xs font-black text-brand-muted uppercase tracking-wider mb-3">🛎️ Keluhan Pelanggan Belum Selesai</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-brand-border dark:border-dark-border pb-2 text-brand-muted">
                  <th className="pb-2 font-bold">Outlet</th>
                  <th className="pb-2 font-bold">Tipe</th>
                  <th className="pb-2 font-bold">Keterangan Komplain</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border dark:divide-dark-border">
                {complaints.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-brand-muted">Semua keluhan pelanggan telah diatasi.</td>
                  </tr>
                ) : (
                  complaints.map((c, idx) => (
                    <tr key={idx} className="hover:bg-brand-bg/50 dark:hover:bg-dark-bg/25">
                      <td className="py-2.5 font-bold">{c.outlets?.nama_outlet || '-'}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          c.tipe_keluhan.includes('A') ? 'bg-brand-red/10 text-brand-red' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {c.tipe_keluhan.split(' ')[0]}
                        </span>
                      </td>
                      <td className="py-2.5 text-brand-muted truncate max-w-[150px]">{c.deskripsi_keluhan}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
