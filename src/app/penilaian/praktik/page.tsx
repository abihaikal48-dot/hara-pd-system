'use client';

import React, { useState, useEffect } from 'react';
import { getMasterData, addEntity } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Award, Loader2, Check } from 'lucide-react';

interface Kru {
  id: string;
  nama_kru: string;
  outlet_id: string;
}
interface SOP {
  id: string;
  kode_sop: string;
  judul_sop: string;
  langkah_langkah: string;
}

export default function PenilaianPraktikPage() {
  const { user } = useAuth();
  const [kruList, setKruList] = useState<Kru[]>([]);
  const [sopList, setSopList] = useState<SOP[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedKruId, setSelectedKruId] = useState('');
  const [selectedSopId, setSelectedSopId] = useState('');
  const [penilai, setPenilai] = useState('');
  const [catatan, setCatatan] = useState('');

  // Langkah Kerja & Skor Checklist
  const [steps, setSteps] = useState<string[]>([]);
  const [stepScores, setStepScores] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const md = await getMasterData();
        setKruList(md.kru as unknown as Kru[]);
        setSopList(md.bankSop as unknown as SOP[]);
        setPenilai(user?.nama || 'Haikal');

        if (md.kru.length) setSelectedKruId(md.kru[0].id);
        if (md.bankSop.length) {
          setSelectedSopId(md.bankSop[0].id);
          const parts = (md.bankSop[0].langkah_langkah || '').split('\n').map((s: string) => s.trim()).filter(Boolean);
          setSteps(parts);
          setStepScores({});
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [user]);

  const handleSopChange = (sopId: string) => {
    setSelectedSopId(sopId);
    const sop = sopList.find(s => s.id === sopId);
    if (sop) {
      const parts = (sop.langkah_langkah || '').split('\n').map((s: string) => s.trim()).filter(Boolean);
      setSteps(parts);
      setStepScores({});
    }
  };

  const setScoreForStep = (idx: number, score: number) => {
    setStepScores({ ...stepScores, [idx]: score });
  };

  const handleSaveAssessment = async () => {
    const selectedKru = kruList.find(k => k.id === selectedKruId);
    const selectedSop = sopList.find(s => s.id === selectedSopId);
    if (!selectedKru || !selectedSop) return;

    // Verifikasi semua langkah telah dinilai
    const missing = steps.some((_, idx) => !stepScores[idx]);
    if (missing) {
      alert('Mohon nilai semua langkah kerja terlebih dahulu secara objektif.');
      return;
    }

    setSubmitting(true);
    try {
      const totalPoints = Object.values(stepScores).reduce((a, b) => a + b, 0);
      const averageSkor = steps.length ? Number((totalPoints / steps.length).toFixed(2)) : 0;

      // Bentuk berkas detail untuk JSONB Supabase
      const detailCeklis = steps.map((s, idx) => ({
        langkah: s,
        skor: stepScores[idx]
      }));

      await addEntity('penilaian_praktik', {
        kru_id: selectedKru.id,
        outlet_id: selectedKru.outlet_id,
        sop_id: selectedSop.id,
        skor_total: averageSkor,
        detail_skor_langkah: detailCeklis,
        catatan,
        penilai
      }, user?.email || 'system');

      alert('Penilaian kompetensi praktik berhasil disimpan!');
      setCatatan('');
      setStepScores({});
    } catch (err: any) {
      alert('Gagal menyimpan penilaian: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-brand-border border-t-brand-red rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-extrabold flex items-center gap-2">
          <Award className="w-5 h-5 text-brand-red" />
          <span>Asesmen Kompetensi Praktik</span>
        </h1>
        <p className="text-xs text-brand-muted">Penilaian kepatuhan nyata butir-butir standar langkah operasional di lapangan.</p>
      </div>

      <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-brand-border space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-brand-muted uppercase mb-1.5">Kru yang Dinilai</label>
            <select 
              value={selectedKruId} 
              onChange={(e) => setSelectedKruId(e.target.value)}
              className="w-full p-2.5 text-xs bg-brand-bg dark:bg-dark-bg border border-brand-border rounded-xl focus:outline-none"
            >
              {kruList.map(k => (
                <option key={k.id} value={k.id}>{k.nama_kru}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-brand-muted uppercase mb-1.5">SOP Acuan Kompetensi</label>
            <select 
              value={selectedSopId} 
              onChange={(e) => handleSopChange(e.target.value)}
              className="w-full p-2.5 text-xs bg-brand-bg dark:bg-dark-bg border border-brand-border rounded-xl focus:outline-none"
            >
              {sopList.map(s => (
                <option key={s.id} value={s.id}>{s.judul_sop}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-brand-muted uppercase mb-1.5">Penilai / Mentor</label>
          <input 
            type="text" 
            value={penilai}
            onChange={(e) => setPenilai(e.target.value)}
            className="w-full p-2.5 text-xs bg-brand-bg dark:bg-dark-bg border border-brand-border rounded-xl focus:outline-none"
          />
        </div>
      </div>

      {/* Butir Ceklis SOP Praktik Dinamik */}
      {steps.length > 0 && (
        <div className="space-y-3">
          <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 p-4 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs flex items-start gap-2.5">
            <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>Berikan nilai kepatuhan langkah demi langkah kerja di bawah berdasarkan observasi riil saat shift berjalan.</p>
          </div>

          <div className="space-y-2">
            {steps.map((step, idx) => (
              <div key={idx} className="bg-white dark:bg-dark-card p-4 rounded-xl border border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs text-brand-ink leading-relaxed font-medium">
                  {idx + 1}. {step}
                </span>
                
                {/* 3 Tingkat Penilaian */}
                <div className="flex gap-1.5 self-end sm:self-auto">
                  {[
                    { val: 1, label: 'Belum' },
                    { val: 2, label: 'Cukup' },
                    { val: 3, label: 'Kompeten' }
                  ].map(opt => (
                    <button 
                      key={opt.val}
                      type="button"
                      onClick={() => setScoreForStep(idx, opt.val)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${stepScores[idx] === opt.val ? 'bg-brand-red text-white border-brand-red' : 'bg-brand-bg hover:bg-brand-border border-transparent'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Form Akhir */}
          <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-brand-border space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-brand-muted uppercase mb-1.5">Catatan Evaluasi Lapangan</label>
              <textarea 
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Rekomendasi tindakan pencegahan atau perbaikan..."
                className="w-full p-3 text-xs bg-brand-bg dark:bg-dark-bg border border-brand-border rounded-xl"
                rows={2}
              />
            </div>
            
            <button 
              onClick={handleSaveAssessment}
              disabled={submitting}
              className="w-full bg-brand-red hover:bg-brand-red-dark text-white text-xs font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-1.5"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Simpan Lembar Penilaian Praktik</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
