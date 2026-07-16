'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { 
  Building2, Users, FileWarning, ClipboardCheck, TrendingUp, AlertCircle 
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalOutlet: 0,
    totalKru: 0,
    tnaOpen: 0,
    complaintOpen: 0
  });
  const [bciData, setBciData] = useState<any[]>([]);
  const [tnaList, setTnaList] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // 1. Ambil Metrik Ringkasan
        const { count: outletCount } = await supabase.from('outlets').select('*', { count: 'exact', head: true });
        const { count: kruCount } = await supabase.from('kru').select('*', { count: 'exact', head: true });
        const { count: tnaCount } = await supabase.from('tna').select('*', { count: 'exact', head: true }).neq('status', 'Selesai');
        const { count: compCount } = await supabase.from('kartu_keluhan').select('*', { count: 'exact', head: true }).neq('status', 'Selesai');

        setStats({
          totalOutlet: outletCount || 0,
          totalKru: kruCount || 0,
          tnaOpen: tnaCount || 0,
          complaintOpen: compCount || 0
        });

        // 2. Ambil Data BCI per Outlet untuk Grafik SVG Native
        const { data: obsData } = await supabase.from('observasi_lapangan').select('*, outlets(nama_outlet)');
        const bciMap: Record<string, { total: number; sesuai: number }> = {};
        obsData?.forEach(o => {
          const outletName = o.outlets?.nama_outlet || 'Tanpa Nama';
          if (!bciMap[outletName]) bciMap[outletName] = { total: 0, sesuai: 0 };
          bciMap[outletName].total += 1;
          if (o.hasil === 'Sesuai Standar') bciMap[outletName].sesuai += 1;
        });

        const bciChart = Object.keys(bciMap).map(name => ({
          name,
          bci: Math.round((bciMap[name].sesuai / bciMap[name].total) * 100)
        }));
        setBciData(bciChart);

        // 3. Ambil TNA Prioritas Tinggi Terbuka
        const { data: tnaData } = await supabase
          .from('tna')
          .select('*, outlets(nama_outlet)')
          .eq('prioritas', 'Tinggi')
          .neq('status', 'Selesai')
          .limit(5);
        setTnaList(tnaData || []);

        // 4. Ambil Keluhan Terbuka
        const { data: compData } = await supabase
          .from('kartu_keluhan')
          .select('*, outlets(nama_outlet)')
          .neq('status', 'Selesai')
          .limit(5);
        setComplaints(compData || []);

      } catch (err) {
        console.error('Gagal memuat metrik dashboard', err);
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
    <div className="space-y-6">
      {/* Banner Selamat Datang */}
      <div className="bg-gradient-to-br from-brand-red-dark via-brand-red to-[#D9583F] p-6 md:p-8 rounded-2xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        <p className="text-[10px] uppercase tracking-widest text-white/75 font-bold mb-1.5">Hara-PD System Pro</p>
        <h1 className="text-xl md:text-2xl font-black">Selamat Datang, {user?.nama || 'Haikal'} 👋</h1>
        <p className="text-xs text-white/90 mt-2 max-w-lg leading-relaxed">
          Semua metrik dan laporan analisis kesenjangan kompetensi kru outlet tersinkronisasi secara real-time.
        </p>
      </div>

      {/* KPI Row (Sangat Responsif untuk HP) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Master Outlet', value: stats.totalOutlet, icon: Building2, color: 'text-brand-red' },
          { label: 'Master Kru', value: stats.totalKru, icon: Users, color: 'text-brand-yellow' },
          { label: 'Sesi TNA Terbuka', value: stats.tnaOpen, icon: FileWarning, color: 'text-amber-500' },
          { label: 'Keluhan Terbuka', value: stats.complaintOpen, icon: ClipboardCheck, color: 'text-emerald-500' }
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white dark:bg-dark-card p-4 rounded-xl border border-brand-border dark:border-dark-border shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-brand-muted dark:text-dark-muted mb-1">{kpi.label}</p>
              <h3 className="text-xl md:text-2xl font-black text-brand-ink dark:text-dark-ink">{kpi.value}</h3>
            </div>
            <div className={`p-2.5 rounded-lg bg-brand-bg dark:bg-dark-bg ${kpi.color}`}>
              <kpi.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Bar Chart BCI per Outlet Menggunakan SVG/HTML Native (Bebas Lag & Sangat Responsif di HP) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-brand-border dark:border-dark-border shadow-sm">
          <h2 className="text-sm font-extrabold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-red" />
            <span>Behavior Change Index (BCI) per Outlet</span>
          </h2>
          <div className="space-y-4">
            {bciData.length === 0 ? (
              <p className="text-xs text-brand-muted dark:text-dark-muted py-6 text-center">Belum ada data observasi masuk.</p>
            ) : (
              bciData.map((data, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>{data.name}</span>
                    <span className={data.bci >= 80 ? 'text-emerald-600' : data.bci >= 60 ? 'text-amber-500' : 'text-brand-red'}>
                      {data.bci}%
                    </span>
                  </div>
                  <div className="h-2.5 bg-brand-bg dark:bg-dark-bg rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        data.bci >= 80 ? 'bg-emerald-500' : data.bci >= 60 ? 'bg-amber-400' : 'bg-brand-red'
                      }`}
                      style={{ width: `${data.bci}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Panel Notifikasi TNA Prioritas Tinggi */}
        <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-brand-border dark:border-dark-border shadow-sm">
          <h2 className="text-sm font-extrabold mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span>TNA Prioritas Tinggi Terbuka</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-brand-border dark:border-dark-border pb-2 text-brand-muted text-left">
                  <th className="pb-2 font-bold">Outlet</th>
                  <th className="pb-2 font-bold">Divisi</th>
                  <th className="pb-2 font-bold">Uraian Kesenjangan</th>
                  <th className="pb-2 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border dark:divide-dark-border">
                {tnaList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-brand-muted">Semua target TNA terpenuhi.</td>
                  </tr>
                ) : (
                  tnaList.map((t, idx) => (
                    <tr key={idx} className="hover:bg-brand-bg/50 dark:hover:bg-dark-bg/35">
                      <td className="py-2.5 font-semibold">{t.outlets?.nama_outlet || '-'}</td>
                      <td className="py-2.5">{t.divisi}</td>
                      <td className="py-2.5 text-brand-muted truncate max-w-[150px]">{t.deskripsi_gap}</td>
                      <td className="py-2.5 text-center">
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500 rounded-full font-bold text-[10px]">
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Keluhan Belum Selesai */}
      <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-brand-border dark:border-dark-border shadow-sm">
        <h2 className="text-sm font-extrabold mb-4">Keluhan Pelanggan Terbuka (Belum Selesai)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-brand-border dark:border-dark-border pb-2 text-brand-muted text-left">
                <th className="pb-2 font-bold">Tanggal/Shift</th>
                <th className="pb-2 font-bold">Outlet</th>
                <th className="pb-2 font-bold">Tipe</th>
                <th className="pb-2 font-bold">Deskripsi Keluhan</th>
                <th className="pb-2 font-bold">Penanganan Diambil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border dark:divide-dark-border">
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-brand-muted">Tidak ada kartu keluhan terbuka.</td>
                </tr>
              ) : (
                complaints.map((c, idx) => (
                  <tr key={idx} className="hover:bg-brand-bg/50 dark:hover:bg-dark-bg/35">
                    <td className="py-3 font-semibold">{c.tanggal_shift}</td>
                    <td className="py-3">{c.outlets?.nama_outlet || '-'}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        c.tipe_keluhan.includes('A') 
                          ? 'bg-brand-red/10 text-brand-red' 
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-500'
                      }`}>
                        {c.tipe_keluhan.split(' ')[0]}
                      </span>
                    </td>
                    <td className="py-3 text-brand-muted max-w-xs truncate">{c.deskripsi_keluhan}</td>
                    <td className="py-3 text-brand-muted max-w-xs truncate">{c.tindakan_diambil || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
