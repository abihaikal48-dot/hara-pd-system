'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, Printer, AlertCircle, CheckCircle2, FileText, ClipboardCheck, Activity, ShieldAlert, AlertOctagon } from 'lucide-react';

function CetakLaporanContent() {
  const searchParams = useSearchParams();
  const outletKode = searchParams.get('outlet') || '';
  const year = searchParams.get('year') || '2026';

  const [outlet, setOutlet] = useState<any>(null);
  const [obsCount, setObsCount] = useState(0);
  const [tnaCount, setTnaCount] = useState(0);
  const [compCount, setCompCount] = useState(0);
  const [bci, setBci] = useState(0);
  
  // List Relasional Riil untuk Menambah Kredibilitas Laporan [1]
  const [activeTnas, setActiveTnas] = useState<any[]>([]);
  const [activeComplaints, setActiveComplaints] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      if (!outletKode) return;
      try {
        // 1. Ambil data outlet
        const { data: ot } = await supabase.from('outlets').select('*').eq('kode_outlet', outletKode).single();
        setOutlet(ot);

        if (ot) {
          // 2. Ambil metrik kuantitatif
          const { data: obs } = await supabase.from('observasi_lapangan').select('*').eq('outlet_id', ot.id);
          const { count: tna } = await supabase.from('tna').select('*', { count: 'exact', head: true }).eq('outlet_id', ot.id).neq('status', 'Selesai');
          const { count: comp } = await supabase.from('kartu_keluhan').select('*', { count: 'exact', head: true }).eq('outlet_id', ot.id).neq('status', 'Selesai');

          setObsCount(obs?.length || 0);
          setTnaCount(tna || 0);
          setCompCount(comp || 0);

          const sesuai = (obs || []).filter(o => o.hasil === 'Sesuai Standar').length;
          setBci(obs?.length ? Math.round((sesuai / obs.length) * 100) : 0);

          // 3. Ambil data temuan TNA Prioritas Tinggi untuk Tabel Laporan [1]
          const { data: tnaData } = await supabase
            .from('tna')
            .select('*')
            .eq('outlet_id', ot.id)
            .eq('prioritas', 'Tinggi')
            .neq('status', 'Selesai');
          setActiveTnas(tnaData || []);

          // 4. Ambil data Keluhan Pelanggan Aktif untuk Tabel Laporan [1]
          const { data: compData } = await supabase
            .from('kartu_keluhan')
            .select('*')
            .eq('outlet_id', ot.id)
            .neq('status', 'Selesai');
          setActiveComplaints(compData || []);
        }
      } catch (err) {
        console.error('Gagal memuat kueri data cetak', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, [outletKode]);

  useEffect(() => {
    if (outlet) {
      // Picu dialog cetak native browser secara otomatis [1]
      const timer = setTimeout(() => { window.print(); }, 1200);
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
        Parameter kueri kode outlet tidak valid atau data kosong.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col items-center p-6 print:bg-white print:p-0">
      
      {/* Panduan Cetak Manual - Tersembunyi saat Cetak PDF */}
      <div className="mb-6 print:hidden">
        <button 
          onClick={() => window.print()}
          className="bg-brand-red hover:bg-brand-red-dark text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 text-xs shadow-md transition-all duration-150"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Dokumen Fisik / Simpan PDF</span>
        </button>
      </div>

      {/* DOKUMEN LAPORAN FISIK PORTRAIT A4 (SANGAT RAPI, TIDAK KEPOTONG KANAN-KIRI) [1] */}
      <div className="w-[800px] bg-white p-12 border border-brand-border shadow-2xl space-y-8 print:shadow-none print:border-none print:p-2 print:max-w-full print:mx-0">
        
        {/* KOP SURAT RESMI DIVISI PEOPLE DEVELOPMENT - HARA CHICKEN [1] */}
        <div className="flex items-center justify-between border-b-4 border-brand-red-dark pb-5">
          <div className="flex items-center gap-4">
            {/* Logo Geometris Minimalis Baru */}
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
              <p className="text-[9px] text-brand-muted mt-1 leading-none italic font-medium">"Membina Kompetensi, Memastikan Konsistensi, Menjaga Cita Rasa."</p>
            </div>
          </div>
          <div className="text-right text-[9px] text-brand-muted leading-relaxed font-semibold">
            <p>Yogyakarta, Indonesia</p>
            <p>Email: recruitment_training_spv@haraChicken.com</p>
          </div>
        </div>

        {/* IDENTITAS LAPORAN */}
        <div className="text-center space-y-1">
          <h2 className="text-xs font-black uppercase tracking-widest text-brand-ink">Laporan Audit Kompetensi &amp; Kepatuhan Standar</h2>
          <p className="text-[11px] text-brand-muted">Kode Unit Analisis: {outletKode} · Tahun Anggaran: {year}</p>
        </div>

        {/* PROFIL SASARAN EVALUASI */}
        <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-brand-bg text-xs border border-brand-border/40">
          <div>
            <span className="block text-[9px] text-brand-muted font-black uppercase tracking-wider mb-0.5">Outlet Evaluasi</span>
            <span className="font-black text-brand-red-dark text-sm">{outlet.nama_outlet}</span>
          </div>
          <div>
            <span className="block text-[9px] text-brand-muted font-black uppercase tracking-wider mb-0.5">Kepala / Kapten Outlet</span>
            <span className="font-extrabold text-brand-ink text-sm block mt-0.5">{outlet.kepala_outlet || '-'}</span>
          </div>
        </div>

        {/* METRIK KUANTITATIF (KPI) */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase text-brand-red-dark border-b border-brand-border pb-1 flex items-center gap-1.5">
            <Activity className="w-4 h-4" />
            <span>I. Indikator Kuantitatif Kepatuhan Kerja</span>
          </h3>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="p-3 border border-brand-border rounded-xl">
              <span className="block text-[9px] text-brand-muted font-bold uppercase mb-1">Index BCI</span>
              <span className="text-lg font-black text-brand-red">{bci}%</span>
            </div>
            <div className="p-3 border border-brand-border rounded-xl">
              <span className="block text-[9px] text-brand-muted font-bold uppercase mb-1">Total Observasi</span>
              <span className="text-lg font-black text-brand-ink">{obsCount} Sesi</span>
            </div>
            <div className="p-3 border border-brand-border rounded-xl">
              <span className="block text-[9px] text-brand-muted font-bold uppercase mb-1">TNA Terbuka</span>
              <span className="text-lg font-black text-brand-ink">{tnaCount} Kasus</span>
            </div>
            <div className="p-3 border border-brand-border rounded-xl">
              <span className="block text-[9px] text-brand-muted font-bold uppercase mb-1">Keluhan Aktif</span>
              <span className="text-lg font-black text-brand-ink">{compCount} Kasus</span>
            </div>
          </div>
        </div>

        {/* DETAIL TABEL TEMUAN TNA PRIORITAS TINGGI */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase text-brand-red-dark border-b border-brand-border pb-1 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" />
            <span>II. Kesenjangan Kompetensi Prioritas Tinggi (TNA)</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-brand-border pb-2 text-brand-muted uppercase font-bold">
                  <th className="pb-2 w-[150px]">Divisi</th>
                  <th className="pb-2">Deskripsi Gap Kepatuhan</th>
                  <th className="pb-2 text-right">Rencana Tindak Lanjut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40">
                {activeTnas.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-brand-muted italic">Tidak ada temuan kesenjangan kritis terdeteksi di outlet ini.</td>
                  </tr>
                ) : (
                  activeTnas.map((t, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 font-bold text-brand-red-dark">{t.divisi}</td>
                      <td className="py-2.5 pr-4 leading-relaxed">{t.deskripsi_gap}</td>
                      <td className="py-2.5 text-right font-medium leading-relaxed">{t.rencana_tindak_lanjut || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* DETAIL TABEL KARTU KELUHAN TERBUKA */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase text-brand-red-dark border-b border-brand-border pb-1 flex items-center gap-1.5">
            <AlertOctagon className="w-4 h-4" />
            <span>III. Log Penanganan Keluhan Pelanggan Aktif</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-brand-border pb-2 text-brand-muted uppercase font-bold">
                  <th className="pb-2 w-[150px]">Shift / Tanggal</th>
                  <th className="pb-2">Isi Keluhan</th>
                  <th className="pb-2 text-right">Tindakan Koreksi Langsung</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40">
                {activeComplaints.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-brand-muted italic">Seluruh keluhan pelanggan telah ditangani secara tuntas.</td>
                  </tr>
                ) : (
                  activeComplaints.map((c, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 font-bold text-brand-ink">{c.tanggal_shift}</td>
                      <td className="py-2.5 pr-4 leading-relaxed">{c.deskripsi_keluhan}</td>
                      <td className="py-2.5 text-right font-medium leading-relaxed">{c.tindakan_diambil || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ANALISIS DIAGNOSTIK NARRATIVE & REKOMENDASI FORMAL */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-black uppercase text-brand-red-dark border-b border-brand-border pb-1 flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            <span>IV. Analisis Diagnostik &amp; Rekomendasi Tindakan</span>
          </h3>
          <div className="text-[11px] text-brand-muted leading-relaxed space-y-2">
            <p>
              Berdasarkan hasil akumulasi kueri di lapangan, tingkat kepatuhan perilaku kerja kru outlet berada pada index <b>{bci}% BCI</b>. Untuk menjamin kelangsungan mutu standar rasa sajian ayam krispi dan pelayanan ramah, Kepala Outlet wajib meningkatkan frekuensi bimbingan mentoring GROW harian bagi kru yang memiliki performa evaluasi praktik di bawah rata-rata.
            </p>
            <p>
              <b>Rekomendasi Strategis:</b> Segera laksanakan re-training kalibrasi resep sambal bawang dan standar penepungan krispi (SOP-KIT-02) secara tatap muka langsung di outlet pada jam-jam sepi guna menekan angka keluhan pelanggan di masa mendatang.
            </p>
          </div>
        </div>

        {/* TANDA TANGAN RESMI HAIKAL ABI SATRIO */}
        <div className="pt-10 flex justify-end">
          <div className="text-right w-56 text-[11px]">
            <p className="text-brand-muted">Yogyakarta, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <div className="h-16 border-b border-brand-border flex items-end justify-center pb-2 italic text-brand-muted font-serif">
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
          @page { size: A4 portrait; margin: 15mm 20mm 15mm 20mm; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}

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
