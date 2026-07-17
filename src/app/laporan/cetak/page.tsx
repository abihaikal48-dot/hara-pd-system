'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, Printer, CheckSquare, AlertTriangle, FileText, Info } from 'lucide-react';

function CetakLaporanContent() {
  const searchParams = useSearchParams();
  const outletKode = searchParams.get('outlet') || '';
  const interval = searchParams.get('period') || 'bulanan'; // harian, mingguan, bulanan, tahunan
  const year = searchParams.get('year') || '2026';

  const [outlet, setOutlet] = useState<any>(null);
  const [obsCount, setObsCount] = useState(0);
  const [tnaCount, setTnaCount] = useState(0);
  const [compCount, setCompCount] = useState(0);
  const [bci, setBci] = useState(0);
  
  // Data Detail untuk Tabel Laporan Fisik Profesional
  const [activeTnas, setActiveTnas] = useState<any[]>([]);
  const [activeComplaints, setActiveComplaints] = useState<any[]>([]);
  const [activeAudits, setActiveAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      if (!outletKode) return;
      try {
        // Ambil data outlet
        const { data: ot } = await supabase.from('outlets').select('*').eq('kode_outlet', outletKode).single();
        setOutlet(ot);

        if (ot) {
          // Atur tanggal penyaringan berdasarkan interval kueri [1]
          const now = new Date();
          const filterDate = new Date();
          
          if (interval.toLowerCase().includes('hari')) {
            filterDate.setDate(now.getDate() - 1);
          } else if (interval.toLowerCase().includes('minggu')) {
            filterDate.setDate(now.getDate() - 7);
          } else if (interval.toLowerCase().includes('bulan')) {
            filterDate.setMonth(now.getMonth() - 1);
          } else if (interval.toLowerCase().includes('tahun')) {
            filterDate.setFullYear(now.getFullYear() - 1);
          } else {
            filterDate.setMonth(now.getMonth() - 1); // Default Bulanan
          }

          const isoDateString = filterDate.toISOString();

          // Ambil statistik periode bersangkutan dari Supabase
          const { data: obs } = await supabase
            .from('observasi_lapangan')
            .select('*')
            .eq('outlet_id', ot.id)
            .gte('created_at', isoDateString);

          const { data: tna, count: tnaCountVal } = await supabase
            .from('tna')
            .select('*')
            .eq('outlet_id', ot.id)
            .neq('status', 'Selesai')
            .gte('created_at', isoDateString);

          const { data: comp, count: compCountVal } = await supabase
            .from('kartu_keluhan')
            .select('*')
            .eq('outlet_id', ot.id)
            .neq('status', 'Selesai')
            .gte('created_at', isoDateString);

          const { data: aud } = await supabase
            .from('pd_audit_standar')
            .select('*')
            .eq('outlet_id', ot.id)
            .gte('tanggal_audit', isoDateString.substring(0, 10))
            .order('tanggal_audit', { ascending: false });

          setObsCount(obs?.length || 0);
          setTnaCount(tnaCountVal || 0);
          setCompCount(compCountVal || 0);
          setActiveTnas(tna || []);
          setActiveComplaints(comp || []);
          setActiveAudits(aud || []);

          const sesuai = (obs || []).filter(o => o.hasil === 'Sesuai Standar').length;
          setBci(obs?.length ? Math.round((sesuai / obs.length) * 100) : 0);
        }
      } catch (err) {
        console.error('Gagal memproses ekspor PDF', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, [outletKode, interval]);

  useEffect(() => {
    if (outlet) {
      // Picu dialog cetak murni setelah halaman ter-render sempurna
      const timer = setTimeout(() => { window.print(); }, 1500);
      return () => clearTimeout(timer);
    }
  }, [outlet]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
      </div>
    );
  }

  if (!outlet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-xs text-brand-muted">
        Parameter kueri pencarian outlet tidak valid atau belum terdaftar.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col items-center p-6 print:bg-white print:p-0">
      
      {/* Panduan Cetak Manual - Tersembunyi saat dicetak */}
      <div className="mb-6 print:hidden flex gap-3">
        <button 
          onClick={() => window.print()}
          className="bg-brand-red hover:bg-brand-red-dark text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 text-xs shadow-md"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Dokumen Fisik / Simpan PDF</span>
        </button>
      </div>

      {/* DOKUMEN LAPORAN FISIK RESMI KOP SURAT A4 PORTRAIT (210mm x 297mm) */}
      <div className="w-[820px] bg-white p-12 border border-brand-border shadow-2xl space-y-6 print:shadow-none print:border-none print:p-4">
        
        {/* KOP SURAT RESMI DIVISION OF PEOPLE DEVELOPMENT - HARA CHICKEN [1] */}
        <div className="flex items-center justify-between border-b-4 border-brand-red-dark pb-5">
          <div className="flex items-center gap-4">
            {/* Logo Geometris Minimalis */}
            <svg className="w-14 h-14" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="45" stroke="#F4B400" strokeWidth="2" strokeDasharray="4 4" />
              <path d="M25 75 L45 50 L58 62 L75 35" stroke="#F4B400" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M75 35 H65 M75 35 V45" stroke="#F4B400" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M52 35 C52 28 58 22 66 22 C74 22 80 28 80 35 C80 42 74 48 66 48 C58 48 52 42 52 35 Z" fill="#C0392B" />
              <circle cx="70" cy="32" r="2.5" fill="#FFF" />
            </svg>
            <div className="text-left">
              <h1 className="text-xl font-black font-serif text-brand-red-dark leading-none tracking-wide">HARA CHICKEN</h1>
              <p className="text-[10px] text-brand-yellow font-extrabold uppercase tracking-[3px] mt-1">People Development Division</p>
              <p className="text-[9px] text-brand-muted mt-1 leading-none italic">"Membina Kompetensi, Memastikan Konsistensi, Menjaga Cita Rasa."</p>
            </div>
          </div>
          <div className="text-right text-[9px] text-brand-muted leading-relaxed font-semibold">
            <p>CV. ULTIMA RASA INDONESIA</p>
            <p>SOP No: SOP/HC/09 - Standard Quality</p>
            <p>Yogyakarta, Indonesia</p>
          </div>
        </div>

        {/* JUDUL LAPORAN */}
        <div className="text-center space-y-1">
          <h2 className="text-sm font-black uppercase tracking-wider text-brand-ink">Laporan Evaluasi &amp; Kepatuhan Mutu Outlet</h2>
          <p className="text-xs text-brand-muted capitalize">Interval Laporan: {interval} ({year})</p>
        </div>

        {/* PROFIL OUTLET */}
        <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-brand-bg text-xs border border-brand-border">
          <div>
            <span className="block text-[9px] text-brand-muted font-black uppercase tracking-wider">Nama Outlet</span>
            <span className="font-extrabold text-brand-red-dark text-sm">{outlet.nama_outlet} ({outlet.kode_outlet})</span>
          </div>
          <div>
            <span className="block text-[9px] text-brand-muted font-black uppercase tracking-wider">Kepala Outlet</span>
            <span className="font-bold text-brand-ink text-sm">{outlet.kepala_outlet || '-'}</span>
          </div>
        </div>

        {/* METRIK DATA AKTUAL (DIREPRESENTASIKAN DENGAN BOX ELEGAN UNTUK DI-PRINT) [1] */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase text-brand-red-dark border-b border-brand-border pb-1">I. Ringkasan Ketercapaian Indikator Kinerja</h3>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="p-3 border border-brand-border rounded-xl">
              <span className="block text-[8px] text-brand-muted font-bold uppercase tracking-wider mb-1">Index Perilaku BCI</span>
              <span className="text-xl font-black text-brand-red">{bci}%</span>
            </div>
            <div className="p-3 border border-brand-border rounded-xl">
              <span className="block text-[8px] text-brand-muted font-bold uppercase tracking-wider mb-1">Total Observasi</span>
              <span className="text-lg font-black text-brand-ink">{obsCount} Sesi</span>
            </div>
            <div className="p-3 border border-brand-border rounded-xl">
              <span className="block text-[8px] text-brand-muted font-bold uppercase tracking-wider mb-1">Kesenjangan TNA</span>
              <span className="text-lg font-black text-brand-ink">{tnaCount} Kasus</span>
            </div>
            <div className="p-3 border border-brand-border rounded-xl">
              <span className="block text-[8px] text-brand-muted font-bold uppercase tracking-wider mb-1">Komplain Terbuka</span>
              <span className="text-lg font-black text-brand-ink">{compCount} Kasus</span>
            </div>
          </div>
        </div>

        {/* TABEL DATA DETAIL: TEMUAN TNA DAN KOMPLAIN PELANGGAN */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase text-brand-red-dark border-b border-brand-border pb-1">II. Temuan Kesenjangan Kompetensi Aktif (TNA)</h3>
          {activeTnas.length === 0 ? (
            <p className="text-xs text-brand-muted italic">Tidak ada temuan kesenjangan kompetensi aktif pada periode ini.</p>
          ) : (
            <table className="w-full text-[11px] text-left border border-brand-border">
              <thead>
                <tr className="bg-brand-bg text-brand-red-dark border-b border-brand-border">
                  <th className="p-2 font-bold w-1/4">Divisi</th>
                  <th className="p-2 font-bold w-1/2">Deskripsi Gap</th>
                  <th className="p-2 font-bold text-center">Prioritas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40">
                {activeTnas.map((t, idx) => (
                  <tr key={idx}>
                    <td className="p-2 font-bold">{t.divisi}</td>
                    <td className="p-2 text-brand-muted leading-relaxed">{t.deskripsi_gap}</td>
                    <td className="p-2 text-center font-bold text-brand-red">{t.prioritas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* TABEL DATA DETAIL: DAFTAR KOMPLAIN PELANGGAN */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase text-brand-red-dark border-b border-brand-border pb-1">III. Log Keluhan Pelanggan Aktif</h3>
          {activeComplaints.length === 0 ? (
            <p className="text-xs text-brand-muted italic">Semua komplain pelanggan telah ditangani secara tuntas.</p>
          ) : (
            <table className="w-full text-[11px] text-left border border-brand-border">
              <thead>
                <tr className="bg-brand-bg text-brand-red-dark border-b border-brand-border">
                  <th className="p-2 font-bold w-1/4">Shift</th>
                  <th className="p-2 font-bold w-1/2">Keterangan Komplain</th>
                  <th className="p-2 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40">
                {activeComplaints.map((c, idx) => (
                  <tr key={idx}>
                    <td className="p-2 font-bold">{c.tanggal_shift}</td>
                    <td className="p-2 text-brand-muted leading-relaxed">{c.deskripsi_keluhan}</td>
                    <td className="p-2 text-center font-bold text-brand-red">{c.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* TABEL DATA DETAIL: HASIL AUDIT STANDAR OPERASIONAL */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase text-brand-red-dark border-b border-brand-border pb-1">IV. Hasil Kepatuhan Audit Kualitas</h3>
          {activeAudits.length === 0 ? (
            <p className="text-xs text-brand-muted italic">Belum ada aktivitas audit operasional terlaksana pada periode ini.</p>
          ) : (
            <table className="w-full text-[11px] text-left border border-brand-border">
              <thead>
                <tr className="bg-brand-bg text-brand-red-dark border-b border-brand-border">
                  <th className="p-2 font-bold">Tanggal Audit</th>
                  <th className="p-2 font-bold">Auditor</th>
                  <th className="p-2 font-bold">Skor Kebersihan</th>
                  <th className="p-2 font-bold">Skor Kecepatan</th>
                  <th className="p-2 font-bold text-center">Rata-Rata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40">
                {activeAudits.map((a, idx) => (
                  <tr key={idx}>
                    <td className="p-2 font-bold">{new Date(a.tanggal_audit).toLocaleDateString('id-ID')}</td>
                    <td className="p-2">{a.auditor_lapangan}</td>
                    <td className="p-2 text-center">{a.skor_kebersihan}/5</td>
                    <td className="p-2 text-center">{a.skor_kecepatan}/5</td>
                    <td className="p-2 text-center font-bold text-brand-red">{a.rata_rata_skor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* TANDA TANGAN RESMI HAIKAL ABI SATRIO - PEOPLE DEVELOPMENT [1] */}
        <div className="pt-10 flex justify-end">
          <div className="text-right w-56 text-xs">
            <p className="text-brand-muted">Yogyakarta, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <div className="h-16 border-b border-brand-border flex items-end justify-center pb-2 italic text-brand-muted">
              Haikal Abi Satrio
            </div>
            <p className="font-extrabold text-brand-ink mt-1">Haikal Abi Satrio</p>
            <p className="text-[10px] text-brand-muted uppercase">People Development</p>
          </div>
        </div>

      </div>

      <style jsx global>{`
        @media print {
          body { background-color: white !important; }
          @page { size: A4 portrait; margin: 15mm; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}

// WRAPPER UTAMA SUSPENSE WRAPPER [1]
export default function CetakLaporanPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
      </div>
    }>
      <CetakLaporanContent />
    </Suspense>
  );
}
