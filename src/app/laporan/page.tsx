'use client';

import React, { useState, useEffect } from 'react';
import { getEntities } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { FileText, Download, Loader2, Database, AlertCircle } from 'lucide-react';

interface Outlet {
  id: string;
  kode_outlet: string;
  nama_outlet: string;
}

export default function LaporanDanBackupPage() {
  const { user } = useAuth();
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [selectedOutlet, setSelectedOutlet] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('7'); // Default Juli
  const [selectedYear, setSelectedYear] = useState('2026');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchOutlets = async () => {
      try {
        const list = await getEntities('outlets');
        setOutlets(list as Outlet[]);
        if (list.length) setSelectedOutlet(list[0].kode_outlet);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOutlets();
  }, []);

  // Ekspor CSV Sederhana Sisi Klien untuk Lembar Utama
  const handleExportCSV = async (tableName: string) => {
    setExporting(true);
    try {
      const rows = await getEntities(tableName);
      if (!rows.length) {
        alert(`Tidak ada data untuk tabel ${tableName}.`);
        return;
      }

      const headers = Object.keys(rows[0]);
      const csvContent = [
        headers.join(','),
        ...rows.map(row => 
          headers.map(header => {
            let cell = row[header] === null || row[header] === undefined ? '' : String(row[header]);
            // Bersihkan koma dan petik dua
            if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
              cell = `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `HARA-EXPORT-${tableName.toUpperCase()}-${new Date().toISOString().substring(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      alert('Gagal mengekspor: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-extrabold flex items-center gap-2">
          <FileText className="w-5 h-5 text-brand-red" />
          <span>Laporan & Ekspor Backup</span>
        </h1>
        <p className="text-xs text-brand-muted">Konsol manajemen dokumen cetak laporan bulanan dan pencadangan data cloud.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panel 1: Cetak Laporan Bulanan (PDF/A4) */}
        <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-brand-border space-y-4">
          <h2 className="text-sm font-extrabold text-brand-ink dark:text-dark-ink">📄 Kompilasi Laporan Bulanan</h2>
          <p className="text-xs text-brand-muted leading-relaxed">Pilih parameter untuk mencetak rangkuman evaluasi, pencapaian BCI, dan status keluhan bulanan.</p>
          
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-brand-muted uppercase mb-1">Outlet Evaluasi</label>
              <select 
                value={selectedOutlet} 
                onChange={(e) => setSelectedOutlet(e.target.value)}
                className="w-full p-2.5 text-xs bg-brand-bg dark:bg-dark-bg border border-brand-border rounded-xl focus:outline-none"
              >
                {outlets.map(o => (
                  <option key={o.id} value={o.kode_outlet}>{o.nama_outlet}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-brand-muted uppercase mb-1">Bulan</label>
                <select 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full p-2.5 text-xs bg-brand-bg dark:bg-dark-bg border border-brand-border rounded-xl focus:outline-none"
                >
                  {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map((m, i) => (
                    <option key={i} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-brand-muted uppercase mb-1">Tahun</label>
                <input 
                  type="number" 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full p-2.5 text-xs bg-brand-bg dark:bg-dark-bg border border-brand-border rounded-xl focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button 
            onClick={() => alert('Fitur pratinjau kompilasi laporan akan memuat template khusus. Integrasi window.print() siap digunakan.')}
            className="w-full bg-brand-red hover:bg-brand-red-dark text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-1.5"
          >
            <span>Buka Laporan Siap Cetak (A4)</span>
          </button>
        </div>

        {/* Panel 2: Cadangan Data CSV Manual */}
        <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-brand-border space-y-4">
          <h2 className="text-sm font-extrabold text-brand-ink dark:text-dark-ink">💾 Cadangkan Tabel Database (CSV)</h2>
          <p className="text-xs text-brand-muted leading-relaxed">Unduh salinan cadangan tabel secara terpisah dari server cloud Supabase dalam format *.csv standard.</p>
          
          <div className="grid grid-cols-2 gap-2 pt-2">
            {[
              { label: 'Master Outlet', table: 'outlets' },
              { label: 'Master Kru', table: 'kru' },
              { label: 'TNA Log', table: 'tna' },
              { label: 'Observasi Lapangan', table: 'observasi_lapangan' },
              { label: 'Penilaian Teori', table: 'penilaian_teori' },
              { label: 'Penilaian Praktik', table: 'penilaian_praktik' },
              { label: 'Penilaian Lisan', table: 'penilaian_lisan' },
              { label: 'Log Audit Sistem', table: 'log_aktivitas' }
            ].map((t, idx) => (
              <button 
                key={idx}
                disabled={exporting}
                onClick={() => handleExportCSV(t.table)}
                className="p-3 bg-brand-bg dark:bg-dark-bg text-[11px] font-bold rounded-xl flex items-center justify-between border border-brand-border/40 hover:bg-brand-border/20 transition-all text-left"
              >
                <span>{t.label}</span>
                <Download className="w-3.5 h-3.5 text-brand-red flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Informasi Tambahan */}
      <div className="bg-brand-red/5 p-4 border border-brand-red/15 rounded-xl text-xs text-brand-red flex items-start gap-3">
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold">Pedoman Backup & Keamanan</h4>
          <p className="mt-1 leading-relaxed opacity-90">
            Seluruh data yang diekspor murni bersumber dari basis data live Supabase Anda. Lakukan pencadangan data secara berkala (misalnya setiap akhir minggu) untuk menjamin perlindungan kedaulatan data dan kepatuhan standar audit People Development.
          </p>
        </div>
      </div>
    </div>
  );
}
