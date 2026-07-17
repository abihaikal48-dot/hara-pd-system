'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, Printer } from 'lucide-react';

export default function CetakLaporanPage() {
  const searchParams = useSearchParams();
  const outletKode = searchParams.get('outlet') || '';
  const year = searchParams.get('year') || '2026';

  const [outlet, setOutlet] = useState<any>(null);
  const [obsCount, setObsCount] = useState(0);
  const [tnaCount, setTnaCount] = useState(0);
  const [compCount, setCompCount] = useState(0);
  const [bci, setBci] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      if (!outletKode) return;
      try {
        // Ambil data outlet
        const { data: ot } = await supabase.from('outlets').select('*').eq('kode_outlet', outletKode).single();
        setOutlet(ot);

        if (ot) {
          // Ambil statistik periode bersangkutan
          const { data: obs } = await supabase.from('observasi_lapangan').select('*').eq('outlet_id', ot.id);
          const { count: tna } = await supabase.from('tna').select('*', { count: 'exact', head: true }).eq('outlet_id', ot.id).neq('status', 'Selesai');
          const { count: comp } = await supabase.from('kartu_keluhan').select('*', { count: 'exact', head: true }).eq('outlet_id', ot.id).neq('status', 'Selesai');

          setObsCount(obs?.length || 0);
          setTnaCount(tna || 0);
          setCompCount(comp || 0);

          const sesuai = (obs || []).filter(o => o.hasil === 'Sesuai Standar').length;
          setBci(obs?.length ? Math.round((sesuai / obs.length) * 100) : 0);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, [outletKode]);

  useEffect(() => {
    if (outlet) {
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
        Parameter kueri outlet tidak valid atau belum terdaftar.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col items-center p-6 print:bg-white print:p-0">
      
      {/* Panduan Cetak Manual */}
      <div className="mb-6 print:hidden">
        <button 
          onClick={() => window.print()}
          className="bg-brand-red hover:bg-brand-red-dark text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 text-xs shadow-md"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Dokumen Fisik / Simpan PDF</span>
        </button>
      </div>

      {/* DOKUMEN LAPORAN FISIK RESMI KOP SURAT A4 PORTRAIT (210mm x 297mm) [1] */}
      <div className="w-[800px] bg-white p-12 border border-brand-border shadow-2xl space-y-8 print:shadow-none print:border-none print:p-4">
        
        {/* KOP SURAT RESMI PEOPLE DEVELOPMENT HARA CHICKEN [1] */}
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
          <div className="text-right text-[9px] text-brand-muted leading-relaxed font-medium">
            <p>Yogyakarta, Indonesia</p>
            <p>Email: recruitment_training_spv@haraChicken.com</p>
          </div>
        </div>

        {/* JUDUL LAPORAN */}
        <div className="text-center">
          <h2 className="text-sm font-black uppercase tracking-wider text-brand-ink">Laporan Kepatuhan Standar &amp; Pembinaan SDM</h2>
          <p className="text-xs text-brand-muted mt-1">Periode Evaluasi Tahun Anggaran: {year}</p>
        </div>

        {/* PROFIL OUTLET */}
        <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-brand-bg text-xs">
          <div>
            <span className="block text-[9px] text-brand-muted font-bold uppercase tracking-wider">Nama Outlet</span>
            <span className="font-extrabold text-brand-red-dark text-sm">{outlet.nama_outlet}</span>
          </div>
          <div>
            <span className="block text-[9px] text-brand-muted font-bold uppercase tracking-wider">Kepala Outlet</span>
            <span className="font-bold text-brand-ink">{outlet.kepala_outlet || '-'}</span>
          </div>
        </div>

        {/* METRIK DATA AKTUAL */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase text-brand-red-dark border-b border-brand-border pb-1">I. Ringkasan Kinerja Perilaku &amp; Kasus</h3>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="p-3 border border-brand-border rounded-xl">
              <span className="block text-[9px] text-brand-muted font-bold uppercase">Nilai BCI</span>
              <span className="text-lg font-black text-brand-red">{bci}%</span>
            </div>
            <div className="p-3 border border-brand-border rounded-xl">
              <span className="block text-[9px] text-brand-muted font-bold uppercase">Sesi Observasi</span>
              <span className="text-lg font-black text-brand-ink">{obsCount} Sesi</span>
            </div>
            <div className="p-3 border border-brand-border rounded-xl">
              <span className="block text-[9px] text-brand-muted font-bold uppercase">TNA Aktif</span>
              <span className="text-lg font-black text-brand-ink">{tnaCount} Kasus</span>
            </div>
            <div className="p-3 border border-brand-border rounded-xl">
              <span className="block text-[9px] text-brand-muted font-bold uppercase">Keluhan Terbuka</span>
              <span className="text-lg font-black text-brand-ink">{compCount} Kasus</span>
            </div>
          </div>
        </div>

        {/* NARASI EVALUASI OPERASIONAL */}
        <div className="space-y-2 text-xs leading-relaxed text-brand-muted">
          <h3 className="text-xs font-black uppercase text-brand-red-dark border-b border-brand-border pb-1">II. Catatan Evaluasi Naratif</h3>
          <p>
            Berdasarkan audit lapangan berkala yang dilaksanakan, indeks perubahan perilaku (Behavior Change Index) berada pada angka rata-rata <b>{bci}%</b>. Kondisi ini mencerminkan tingkat kepatuhan kerja tim yang berada dalam kategori yang memerlukan tinjauan berkelanjutan di bawah pengawasan Kepala Outlet.
          </p>
          {compCount > 0 ? (
            <p>
              Terdapat <b>{compCount} keluhan pelanggan aktif</b> yang belum terselesaikan sepenuhnya. Divisi People Development merekomendasikan adanya sesi bimbingan praktik mandiri tambahan khusus bagi kru pelayanan kasir dan tim penyiapan menu krispi guna memitigasi risiko penurunan kualitas saji di outlet.
            </p>
          ) : (
            <p>
              Pencapaian luar biasa dicatat oleh seluruh kru, di mana keluhan pelanggan berhasil ditekan hingga angka nol pada penutupan periodisasi ini. Konsistensi kepatuhan kerja ini wajib dipertahankan.
            </p>
          )}
        </div>

        {/* TANDA TANGAN RESMI HA_IKAL ABI SATRIO [1] */}
        <div className="pt-12 flex justify-end">
          <div className="text-right w-56 text-xs">
            <p className="text-brand-muted">Yogyakarta, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <div className="h-16 border-b border-brand-border flex items-end justify-center pb-2 italic text-brand-muted">
              Haikal Abi Satrio
            </div>
            <p className="font-extrabold text-brand-ink mt-1">Haikal Abi Satrio</p>
            <p className="text-[10px] text-brand-muted uppercase">People Development Manager</p>
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
