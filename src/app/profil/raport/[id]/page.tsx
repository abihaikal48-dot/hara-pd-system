'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, Printer, CheckCircle2, Award, BookOpen, MessageSquare, TrendingUp, ShieldAlert, MapPin, User, Bookmark } from 'lucide-react';

export default function RaportKruPage() {
  const params = useParams();
  const id = params.id as string;

  const [kru, setKru] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // State Riwayat Nilai
  const [history, setHistory] = useState<Record<string, any[]>>({
    observasi: [],
    coaching: [],
    teori: [],
    praktik: [],
    lisan: [],
    gap: []
  });

  const [metrics, setMetrics] = useState<Record<string, any>>({
    bci: null,
    avgTeori: null,
    avgPraktik: null,
    avgLisan: null
  });

  useEffect(() => {
    if (!id) return;

    const fetchKruData = async () => {
      setLoading(true);
      try {
        // 1. Ambil Profil Utama Kru
        const { data: profile } = await supabase
          .from('kru')
          .select('*, outlets!outlet_id(nama_outlet)')
          .eq('id', id)
          .single();
        setKru(profile);

        if (profile) {
          // 2. Ambil Seluruh Riwayat Nilai Terkait
          const { data: obs } = await supabase.from('observasi_lapangan').select('*').eq('kru_id', id).order('created_at', { ascending: false });
          const { data: coa } = await supabase.from('coaching_log').select('*').eq('kru_id', id).order('tanggal', { ascending: false });
          const { data: gap } = await supabase.from('gap_analysis').select('*').eq('kru_id', id);
          const { data: teo } = await supabase.from('penilaian_teori').select('*').eq('kru_id', id).order('created_at', { ascending: false });
          const { data: pra } = await supabase.from('penilaian_praktik').select('*, bank_sop(judul_sop)').eq('kru_id', id).order('created_at', { ascending: false });
          const { data: lis } = await supabase.from('penilaian_lisan').select('*, bank_sop(judul_sop)').eq('kru_id', id).order('created_at', { ascending: false });

          setHistory({
            observasi: obs || [],
            coaching: coa || [],
            gap: gap || [],
            teori: teo || [],
            praktik: pra || [],
            lisan: lis || []
          });

          // 3. Kalkulasi Metrik Rata-Rata
          const sesuaiCount = (obs || []).filter(o => o.hasil === 'Sesuai Standar').length;
          const bciCalc = (obs || []).length ? Math.round((sesuaiCount / (obs || []).length) * 100) : null;

          const avgTeo = (teo || []).length ? Math.round((teo || []).reduce((a, b) => a + Number(b.skor), 0) / (teo || []).length) : null;
          const avgPra = (pra || []).length ? Number(((pra || []).reduce((a, b) => a + Number(b.skor_total), 0) / (pra || []).length).toFixed(2)) : null;
          const avgLis = (lis || []).length ? Math.round((lis || []).reduce((a, b) => a + Number(b.persentase_paham), 0) / (lis || []).length) : null;

          setMetrics({
            bci: bciCalc,
            avgTeori: avgTeo,
            avgPraktik: avgPra,
            avgLisan: avgLis
          });
        }
      } catch (err) {
        console.error('Gagal mengambil data raport kru', err);
      } finally {
        setLoading(false);
      }
    };

    fetchKruData();
  }, [id]);

  useEffect(() => {
    if (kru) {
      // Otomatis picu cetak fisik setelah data termuat sempurna
      const timer = setTimeout(() => { window.print(); }, 1200);
      return () => clearTimeout(timer);
    }
  }, [kru]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
      </div>
    );
  }

  if (!kru) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-xs text-brand-muted">
        Data kru tidak ditemukan atau telah dihapus dari Supabase.
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

      {/* DOKUMEN RAPORT FISIK PORTRAIT A4 (SANGAT RAPI, TIDAK KEPOTONG KANAN-KIRI) [1] */}
      <div className="w-full max-w-[800px] bg-white p-12 border border-brand-border space-y-6 print:shadow-none print:border-none print:p-2 print:max-w-full print:mx-0">
        
        {/* KOP SURAT RESMI PEOPLE DEVELOPMENT */}
        <div className="flex items-center justify-between border-b-4 border-brand-red-dark pb-5">
          <div className="flex items-center gap-4">
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

        {/* JUDUL RAPORT */}
        <div className="text-center space-y-1">
          <h2 className="text-xs font-black uppercase tracking-widest text-brand-ink">Raport Evaluasi Kompetensi &amp; Penilaian Kru</h2>
          <p className="text-[11px] text-brand-muted">Arsip Kinerja Penilaian Kepatuhan Kerja &amp; Kognitif</p>
        </div>

        {/* METADATA KRU */}
        <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-brand-bg text-xs border border-brand-border/40">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-brand-red" />
              <span><b>Nama Kru:</b> {kru.nama_kru}</span>
            </div>
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-brand-red" />
              <span><b>Divisi Tugas:</b> {kru.divisi}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-red" />
              <span><b>Penugasan Outlet:</b> {kru.outlets?.nama_outlet || 'Kru Utama'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-red" />
              <span><b>Tanggal Gabung:</b> {kru.tanggal_masuk ? new Date(kru.tanggal_masuk).toLocaleDateString('id-ID') : '-'}</span>
            </div>
          </div>
        </div>

        {/* METRIK DATA RATA-RATA EVALUASI */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase text-brand-red-dark border-b border-brand-border pb-1 flex items-center gap-1.5">
            <Award className="w-4.5 h-4.5" />
            <span>I. Akumulasi Skor &amp; Kepatuhan Kerja (Scorecard)</span>
          </h3>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="p-3 border border-brand-border rounded-xl">
              <span className="block text-[9px] text-brand-muted font-bold uppercase mb-1">Index BCI</span>
              <span className="text-sm font-black text-brand-red">{metrics.bci !== null ? `${metrics.bci}%` : '-'}</span>
            </div>
            <div className="p-3 border border-brand-border rounded-xl">
              <span className="block text-[9px] text-brand-muted font-bold uppercase mb-1">Rerata Teori</span>
              <span className="text-sm font-black text-brand-ink">{metrics.avgTeori !== null ? `${metrics.avgTeori}%` : '-'}</span>
            </div>
            <div className="p-3 border border-brand-border rounded-xl">
              <span className="block text-[9px] text-brand-muted font-bold uppercase mb-1">Rerata Praktik</span>
              <span className="text-sm font-black text-brand-ink">{metrics.avgPraktik !== null ? `${metrics.avgPraktik}/3` : '-'}</span>
            </div>
            <div className="p-3 border border-brand-border rounded-xl">
              <span className="block text-[9px] text-brand-muted font-bold uppercase mb-1">Paham Lisan</span>
              <span className="text-sm font-black text-brand-ink">{metrics.avgLisan !== null ? `${metrics.avgLisan}%` : '-'}</span>
            </div>
          </div>
        </div>

        {/* RIWAYAT PENILAIAN SPESIFIK */}
        <div className="grid grid-cols-2 gap-4 text-[11px] leading-relaxed">
          
          {/* Riwayat Teori & Kuis */}
          <div className="p-4 border border-brand-border rounded-xl space-y-2">
            <h4 className="font-extrabold text-brand-red-dark flex items-center gap-1.5 mb-2">
              <BookOpen className="w-4 h-4" />
              <span>Evaluasi Kognitif Kuis</span>
            </h4>
            <div className="space-y-1.5 divide-y divide-brand-border/40">
              {history.teori.length === 0 ? (
                <p className="text-[10px] text-brand-muted italic py-2">Belum ada riwayat kuis teori.</p>
              ) : (
                history.teori.slice(0, 3).map((t, idx) => (
                  <div key={idx} className="flex justify-between pt-1.5 first:pt-0">
                    <span>{t.topik}</span>
                    <span className="font-bold text-brand-red">{t.skor}%</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Riwayat Praktik SOP */}
          <div className="p-4 border border-brand-border rounded-xl space-y-2">
            <h4 className="font-extrabold text-brand-red-dark flex items-center gap-1.5 mb-2">
              <Award className="w-4 h-4" />
              <span>Ceklis Praktik SOP</span>
            </h4>
            <div className="space-y-1.5 divide-y divide-brand-border/40">
              {history.praktik.length === 0 ? (
                <p className="text-[10px] text-brand-muted italic py-2">Belum ada riwayat ujian praktik.</p>
              ) : (
                history.praktik.slice(0, 3).map((p, idx) => (
                  <div key={idx} className="flex justify-between pt-1.5 first:pt-0">
                    <span className="truncate max-w-[150px]">{p.bank_sop?.judul_sop || 'SOP Kerja'}</span>
                    <span className="font-bold text-emerald-600">{p.skor_total}/3</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* ANALISIS GAP & SUKSESI KARIR */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase text-brand-red-dark border-b border-brand-border pb-1 flex items-center gap-1.5">
            <TrendingUp className="w-4.5 h-4.5" />
            <span>II. Analisis Kesenjangan &amp; Jalur Suksesi</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
            
            {/* Tabel Gap */}
            <div className="p-4 border border-brand-border rounded-xl space-y-2">
              <span className="font-bold text-brand-ink block mb-1">Rincian Kompetensi Kritis</span>
              <div className="divide-y divide-brand-border/40">
                {history.gap.length === 0 ? (
                  <p className="text-[10px] text-brand-muted italic py-2">Semua kompetensi kerja sesuai standar.</p>
                ) : (
                  history.gap.map((g, idx) => (
                    <div key={idx} className="flex justify-between py-1.5 first:pt-0">
                      <span>{g.kompetensi_dinilai}</span>
                      <span className={`font-bold ${g.gap_score > 0 ? 'text-brand-red' : 'text-emerald-600'}`}>
                        {g.gap_score > 0 ? `Kurang ${g.gap_score}` : 'Sesuai'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Riwayat Coaching */}
            <div className="p-4 border border-brand-border rounded-xl space-y-2">
              <span className="font-bold text-brand-ink block mb-1">Sesi Mentoring &amp; Coaching</span>
              <div className="divide-y divide-brand-border/40">
                {history.coaching.length === 0 ? (
                  <p className="text-[10px] text-brand-muted italic py-2">Kru belum memerlukan catatan pembinaan khusus.</p>
                ) : (
                  history.coaching.slice(0, 2).map((c, idx) => (
                    <div key={idx} className="py-1.5 first:pt-0">
                      <p className="font-semibold text-brand-red-dark">Target: {c.goal}</p>
                      <p className="text-[10px] text-brand-muted italic mt-0.5">"Komitmen: {c.will_komitmen}"</p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ULASAN & DIAGNOSTIK TIM PEOPLE DEVELOPMENT */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-black uppercase text-brand-red-dark border-b border-brand-border pb-1 flex items-center gap-1.5">
            <MessageSquare className="w-4.5 h-4.5" />
            <span>III. Ulasan Diagnostik &amp; Evaluasi Sikap Kerja</span>
          </h3>
          <div className="text-[11px] text-brand-muted leading-relaxed space-y-2">
            <p>
              Berdasarkan akumulasi ujian tertulis, penilaian kepatuhan langkah kerja SOP di lapangan, dan pengamatan perubahan perilaku (*behavior change*), kru bersangkutan menunjukkan keseriusan belajar yang konsisten. Keahlian kognitif serta kecepatan saji berada dalam kategori yang patut dipertahankan.
            </p>
            <p>
              <b>Rekomendasi Tindak Lanjut:</b> Direkomendasikan untuk dilibatkan ke dalam program pembinaan peningkatan jenjang karir (*Talent Tracker*) serta dipersiapkan mengikuti kualifikasi ujian promosi kepemimpinan outlet pada periode berikutnya.
            </p>
          </div>
        </div>

        {/* TANDA TANGAN EVALUATOR */}
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
