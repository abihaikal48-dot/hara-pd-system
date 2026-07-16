'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { getMasterData } from '@/lib/api';
import { 
  User, Award, MessageSquare, TrendingUp, HelpCircle, FileCheck, Star, 
  MapPin, Calendar, Loader2, FileText 
} from 'lucide-react';

export default function Profil360Page() {
  const [kruList, setKruList] = useState<any[]>([]);
  const [selectedKruId, setSelectedKruId] = useState('');
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  // Profil Data Terperinci
  const [kruData, setKruData] = useState<any>(null);
  const [history, setHistory] = useState({
    observasi: [] as any[],
    coaching: [] as any[],
    teori: [] as any[],
    praktik: [] as any[],
    lisan: [] as any[],
    gap: [] as any[],
    talent: [] as any[]
  });

  const [metrics, setMetrics] = useState({
    bci: null as number | null,
    avgTeori: null as number | null,
    avgPraktik: null as number | null,
    avgLisan: null as number | null
  });

  useEffect(() => {
    const init = async () => {
      try {
        const md = await getMasterData();
        setKruList(md.kru);
        if (md.kru.length) {
          setSelectedKruId(md.kru[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!selectedKruId) return;

    const fetchKruProfile = async () => {
      setDataLoading(true);
      try {
        // 1. Ambil Profil Kru & Outlet
        const { data: profile } = await supabase
          .from('kru')
          .select('*, outlets(nama_outlet)')
          .eq('id', selectedKruId)
          .single();
        setKruData(profile);

        // 2. Ambil Riwayat Transaksi
        const { data: obs } = await supabase.from('observasi_lapangan').select('*').eq('kru_id', selectedKruId).order('created_at', { ascending: false });
        const { data: coach } = await supabase.from('coaching_log').select('*').eq('kru_id', selectedKruId).order('tanggal', { ascending: false });
        const { data: gap } = await supabase.from('gap_analysis').select('*').eq('kru_id', selectedKruId);
        const { data: teo } = await supabase.from('penilaian_teori').select('*').eq('kru_id', selectedKruId).order('created_at', { ascending: false });
        const { data: pra } = await supabase.from('penilaian_praktik').select('*, bank_sop(judul_sop)').eq('kru_id', selectedKruId).order('created_at', { ascending: false });
        const { data: lis } = await supabase.from('penilaian_lisan').select('*, bank_sop(judul_sop)').eq('kru_id', selectedKruId).order('created_at', { ascending: false });
        const { data: tal } = await supabase.from('talent_tracker').select('*').eq('kandidat_id', selectedKruId);

        setHistory({
          observasi: obs || [],
          coaching: coach || [],
          gap: gap || [],
          teori: teo || [],
          praktik: pra || [],
          lisan: lis || [],
          talent: tal || []
        });

        // 3. Kalkulasi Matrik Ringkasan
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

      } catch (err) {
        console.error('Gagal mengambil detail riwayat kru', err);
      } finally {
        setDataLoading(false);
      }
    };

    fetchKruProfile();
  }, [selectedKruId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-brand-border border-t-brand-red rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pemilihan Kru */}
      <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-brand-border dark:border-dark-border shadow-sm">
        <label className="block text-[10px] font-black text-brand-muted uppercase mb-1.5 tracking-wider">Navigasi Profil Kru</label>
        <select 
          value={selectedKruId} 
          onChange={(e) => setSelectedKruId(e.target.value)}
          className="w-full p-2.5 text-xs bg-brand-bg dark:bg-dark-bg border border-brand-border dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red"
        >
          {kruList.map(k => (
            <option key={k.id} value={k.id}>{k.nama_kru} ({k.divisi})</option>
          ))}
        </select>
      </div>

      {dataLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
        </div>
      ) : kruData && (
        <div className="space-y-6">
          {/* Header Identitas & Cetak Sertifikat */}
          <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-brand-border dark:border-dark-border shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-brand-red text-white font-black text-sm flex items-center justify-center">
                {kruData.nama_kru.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-base font-extrabold text-brand-ink dark:text-dark-ink leading-tight">{kruData.nama_kru}</h2>
                <div className="flex flex-wrap gap-2 items-center mt-1 text-[11px] text-brand-muted">
                  <span className="font-bold text-brand-red-dark bg-brand-red/5 px-2 py-0.5 rounded-md">{kruData.divisi}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{kruData.outlets?.nama_outlet}</span>
                </div>
              </div>
            </div>
            
            <Link 
              href={`/profil/sertifikat/${kruData.id}`} 
              target="_blank"
              className="bg-brand-red hover:bg-brand-red-dark text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all self-stretch sm:self-auto"
            >
              <FileText className="w-4 h-4" />
              <span>Cetak Sertifikat Onboarding</span>
            </Link>
          </div>

          {/* Kartu Metrik Ringkasan (BCI, Teori, Praktik, Lisan) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'BCI Observasi', value: metrics.bci !== null ? `${metrics.bci}%` : '-', color: 'text-brand-red' },
              { label: 'Skor Ujian Teori', value: metrics.avgTeori !== null ? `${metrics.avgTeori}%` : '-', color: 'text-brand-yellow' },
              { label: 'Rerata Skor Praktik', value: metrics.avgPraktik !== null ? metrics.avgPraktik : '-', color: 'text-emerald-500' },
              { label: 'Pemahaman Lisan', value: metrics.avgLisan !== null ? `${metrics.avgLisan}%` : '-', color: 'text-blue-500' }
            ].map((m, idx) => (
              <div key={idx} className="bg-white dark:bg-dark-card p-4 rounded-xl border border-brand-border dark:border-dark-border shadow-sm text-center">
                <span className="block text-[9px] font-black text-brand-muted dark:text-dark-muted uppercase tracking-wider mb-1">{m.label}</span>
                <span className={`text-xl font-black ${m.color}`}>{m.value}</span>
              </div>
            ))}
          </div>

          {/* Kolom Riwayat Log Kinerja */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Observasi Terakhir */}
            <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-brand-border dark:border-dark-border shadow-sm">
              <h3 className="text-xs font-black text-brand-muted dark:text-dark-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Observasi Terakhir</span>
              </h3>
              <div className="space-y-3">
                {history.observasi.length === 0 ? (
                  <p className="text-xs text-brand-muted italic">Kru belum pernah diobservasi di lapangan.</p>
                ) : (
                  history.observasi.slice(0, 4).map((o, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs p-2.5 rounded-lg bg-brand-bg dark:bg-dark-bg/40">
                      <div>
                        <p className="font-bold">{o.tanggal_shift}</p>
                        <p className="text-[10px] text-brand-muted mt-0.5">{o.standar_sop || 'Observasi Umum'}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${o.hasil === 'Sesuai Standar' ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-red/10 text-brand-red'}`}>
                        {o.hasil}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Riwayat Coaching */}
            <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-brand-border dark:border-dark-border shadow-sm">
              <h3 className="text-xs font-black text-brand-muted dark:text-dark-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span>Riwayat Sesi Coaching</span>
              </h3>
              <div className="space-y-3">
                {history.coaching.length === 0 ? (
                  <p className="text-xs text-brand-muted italic">Kru belum pernah mengikuti sesi pembinaan/coaching.</p>
                ) : (
                  history.coaching.slice(0, 4).map((c, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-brand-bg dark:bg-dark-bg/40 text-xs">
                      <div className="flex justify-between font-bold mb-1">
                        <span>Goal: {c.goal}</span>
                        <span className="text-[10px] font-normal text-brand-muted">{new Date(c.tanggal).toLocaleDateString('id-ID')}</span>
                      </div>
                      <p className="text-[11px] text-brand-muted italic mt-1 leading-relaxed">"Will: {c.will_komitmen}"</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Asesmen Teori & Ujian Praktik */}
            <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-brand-border dark:border-dark-border shadow-sm">
              <h3 className="text-xs font-black text-brand-muted dark:text-dark-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                <FileCheck className="w-4 h-4" />
                <span>Riwayat Penilaian Kompetensi</span>
              </h3>
              <div className="space-y-3">
                {history.teori.slice(0, 2).map((t, idx) => (
                  <div key={`teo-${idx}`} className="flex justify-between items-center text-xs p-2.5 border-b border-brand-border">
                    <div>
                      <p className="font-bold">Ujian Teori: {t.topik}</p>
                      <p className="text-[10px] text-brand-muted mt-0.5">{new Date(t.created_at).toLocaleDateString('id-ID')}</p>
                    </div>
                    <span className="font-black text-brand-red">{t.skor}%</span>
                  </div>
                ))}
                {history.praktik.slice(0, 2).map((p, idx) => (
                  <div key={`pra-${idx}`} className="flex justify-between items-center text-xs p-2.5 border-b border-brand-border">
                    <div>
                      <p className="font-bold">Praktik SOP: {p.bank_sop?.judul_sop}</p>
                      <p className="text-[10px] text-brand-muted mt-0.5">Penilai: {p.penilai}</p>
                    </div>
                    <span className="font-black text-emerald-600">{p.skor_total}/3</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Gap Analysis & Talent Pipeline */}
            <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-brand-border dark:border-dark-border shadow-sm">
              <h3 className="text-xs font-black text-brand-muted dark:text-dark-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>Kesenjangan Kompetensi & Karir</span>
              </h3>
              <div className="space-y-3">
                {history.gap.map((g, idx) => (
                  <div key={`gap-${idx}`} className="flex justify-between text-xs p-1.5">
                    <span className="font-medium">{g.kompetensi_dinilai}</span>
                    <span className={`font-bold ${g.gap_score > 0 ? 'text-brand-red' : 'text-emerald-600'}`}>
                      {g.gap_score > 0 ? `Kurang ${g.gap_score}` : 'Sesuai Standar'}
                    </span>
                  </div>
                ))}
                {history.talent.map((t, idx) => (
                  <div key={`tal-${idx}`} className="p-3 bg-brand-red/5 border border-brand-red/10 rounded-xl mt-2 text-xs">
                    <p className="font-bold text-brand-red-dark">Kandidat Promosi: {t.target_posisi}</p>
                    <p className="text-[11px] text-brand-muted mt-1 leading-relaxed"><b>Status Terkini:</b> {t.progres_terkini}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
