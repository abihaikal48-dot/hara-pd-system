'use client';

import React, { useState, useEffect } from 'react';
import { getMasterData, addEntity } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { MessageSquare, Loader2, Info } from 'lucide-react';

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

export default function PenilaianLisanPage() {
  const { user } = useAuth();
  const [kruList, setKruList] = useState<Kru[]>([]);
  const [sopList, setSopList] = useState<SOP[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedKruId, setSelectedKruId] = useState('');
  const [selectedSopId, setSelectedSopId] = useState('');
  const [penilai, setPenilai] = useState('');
  const [catatan, setCatatan] = useState('');

  // Langkah Kerja & Status Paham
  const [steps, setSteps] = useState<string[]>([]);
  const [comprehension, setComprehension] = useState<Record<number, boolean>>({});
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
          setComprehension({});
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
      setComprehension({});
    }
  };

  const toggleUnderstand = (idx: number, state: boolean) => {
    setComprehension({ ...comprehension, [idx]: state });
  };

  const handleSaveAssessment = async () => {
    const selectedKru = kruList.find(k => k.id === selectedKruId);
    const selectedSop = sopList.find(s => s.id === selectedSopId);
    if (!selectedKru || !selectedSop) return;

    // Pastikan seluruh butir langkah dicek
    const evaluatedCount = Object.keys(comprehension).length;
    if (evaluatedCount < steps.length) {
      alert('Mohon evaluasi tingkat pemahaman kru pada seluruh langkah SOP.');
      return;
    }

    setSubmitting(true);
    try {
      const totalUnderstood = Object.values(comprehension).filter(val => val === true).length;
      const percent = steps.length ? Math.round((totalUnderstood / steps.length) * 100) : 0;

      const detailChecklist = steps.map((s, idx) => ({
        langkah: s,
        paham: comprehension[idx]
      }));

      await addEntity('penilaian_lisan', {
        kru_id: selectedKru.id,
        outlet_id: selectedKru.outlet_id,
        sop_id: selectedSop.id,
        persentase_paham: percent,
        detail_checklist: detailChecklist,
        catatan,
        penilai
      }, user?.email || 'system');

      alert('Penilaian Teori Lisan berhasil dicatat!');
      setCatatan('');
      setComprehension({});
    } catch (err: any) {
      alert('Gagal mencatat data: ' + err.message);
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
          <MessageSquare className="w-5 h-5 text-brand-red" />
          <span>Ujian Pemahaman Lisan</span>
        </h1>
        <p className="text-xs text-brand-muted">Asesmen wawancara langsung tingkat penguasaan konsep langkah kerja operasional.</p>
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
            <label className="block text-[10px] font-bold text-brand-muted uppercase mb-1.5">SOP Acuan Wawancara</label>
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

      {/* Checklist Pemahaman */}
      {steps.length > 0 && (
        <div className="space-y-3">
          <div className="bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-500 p-4 border border-amber-200 dark:border-amber-900 rounded-xl text-xs flex items-start gap-2.5">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>Ajukan pertanyaan terkait langkah kerja berikut, lalu tandai tingkat pemahaman kru.</p>
          </div>

          <div className="space-y-2">
            {steps.map((step, idx) => (
              <div key={idx} className="bg-white dark:bg-dark-card p-4 rounded-xl border border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs text-brand-ink leading-relaxed font-medium">
                  {idx + 1}. {step}
                </span>
                
                <div className="flex gap-1.5 self-end sm:self-auto">
                  <button 
                    type="button" 
                    onClick={() => toggleUnderstand(idx, true)}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-bold border transition-all ${comprehension[idx] === true ? 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-500' : 'bg-brand-bg border-transparent'}`}
                  >
                    Paham
                  </button>
                  <button 
                    type="button" 
                    onClick={() => toggleUnderstand(idx, false)}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-bold border transition-all ${comprehension[idx] === false ? 'bg-brand-red/10 text-brand-red border-brand-red/20' : 'bg-brand-bg border-transparent'}`}
                  >
                    Belum Paham
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Form Akhir */}
          <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-brand-border space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-brand-muted uppercase mb-1.5">Ulasan Mentor</label>
              <textarea 
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Rencana bimbingan mandiri atau poin yang perlu penajaman..."
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
              <span>Simpan Lembar Penilaian Lisan</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
