'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getMasterData, addEntity } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { BookOpen, Play, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface Kru {
  id: string;
  nama_kru: string;
  outlet_id: string;
}
interface Soal {
  id: string;
  pertanyaan: string;
  jenis_soal: 'Pilihan Ganda' | 'Benar/Salah' | 'Essay';
  opsi_a?: string;
  opsi_b?: string;
  opsi_c?: string;
  opsi_d?: string;
  kunci_jawaban: string;
  bobot: number;
}

export default function PenilaianTeoriPage() {
  const { user } = useAuth();
  const [kruList, setKruList] = useState<Kru[]>([]);
  const [topikList, setTopikList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Parameter Form Mulai
  const [selectedKruId, setSelectedKruId] = useState('');
  const [selectedTopik, setSelectedTopik] = useState('');
  const [jumlahSoal, setJumlahSoal] = useState(5);

  // Status Quiz
  const [quizStarted, setQuizStarted] = useState(false);
  const [soalList, setSoalList] = useState<Soal[]>([]);
  const [jawaban, setJawaban] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Hasil Akhir
  const [result, setResult] = useState<{
    skor: number;
    kategori: string;
    jumlahBenar: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const md = await getMasterData();
        setKruList(md.kru as unknown as Kru[]);

        const { data: topics } = await supabase.from('bank_soal').select('topik').eq('status_aktif', true);
        const uniqueTopics = Array.from(new Set((topics || []).map(t => t.topik)));
        setTopikList(uniqueTopics);
        
        if (md.kru.length) setSelectedKruId(md.kru[0].id);
        if (uniqueTopics.length) setSelectedTopik(uniqueTopics[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleStartQuiz = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('bank_soal')
        .select('*')
        .eq('topik', selectedTopik)
        .eq('status_aktif', true);

      if (!data || data.length === 0) {
        alert('Tidak ada soal aktif untuk topik ini.');
        return;
      }

      // Acak soal
      const shuffled = [...data].sort(() => 0.5 - Math.random());
      setSoalList((shuffled.slice(0, jumlahSoal) as unknown as Soal[]));
      setJawaban({});
      setResult(null);
      setQuizStarted(true);
    } catch (err) {
      alert('Gagal memuat soal kuis.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuiz = async () => {
    const selectedKru = kruList.find(k => k.id === selectedKruId);
    if (!selectedKru) return;

    setSubmitting(true);
    try {
      let scoreTotal = 0;
      let totalBobot = 0;
      let corrects = 0;
      const detailJawaban: any[] = [];

      soalList.forEach(s => {
        const userAns = (jawaban[s.id] || '').trim().toLowerCase();
        const correctAns = s.kunci_jawaban.trim().toLowerCase();
        const keyWeight = Number(s.bobot) || 20;

        totalBobot += keyWeight;
        const isCorrect = userAns === correctAns;

        if (isCorrect) {
          scoreTotal += keyWeight;
          corrects++;
        }

        detailJawaban.push({
          soal_id: s.id,
          pertanyaan: s.pertanyaan,
          user_ans: userAns,
          correct_ans: correctAns,
          is_correct: isCorrect
        });
      });

      const finalSkor = totalBobot > 0 ? Math.round((scoreTotal / totalBobot) * 100) : 0;
      const finalKategori = finalSkor >= 80 ? 'Sangat Baik' : finalSkor >= 60 ? 'Baik' : finalSkor >= 40 ? 'Cukup' : 'Perlu Diulang';

      const res = await addEntity('penilaian_teori', {
        kru_id: selectedKru.id,
        outlet_id: selectedKru.outlet_id,
        topik: selectedTopik,
        jumlah_soal: soalList.length,
        jumlah_benar: corrects,
        skor: finalSkor,
        kategori: finalKategori,
        detail_jawaban: detailJawaban
      }, user?.email || 'system');

      setResult({
        skor: finalSkor,
        kategori: finalKategori,
        jumlahBenar: corrects,
        total: soalList.length
      });
      setQuizStarted(false);
    } catch (err: any) {
      alert('Gagal mengirim jawaban: ' + err.message);
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
          <BookOpen className="w-5 h-5 text-brand-red" />
          <span>Sistem Penilaian Teori</span>
        </h1>
        <p className="text-xs text-brand-muted">Evaluasi pengetahuan SOP dan pemahaman operasional kru.</p>
      </div>

      {!quizStarted && !result && (
        <div className="bg-white dark:bg-dark-card p-6 rounded-xl border border-brand-border dark:border-dark-border space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-brand-muted uppercase mb-1.5">Pilih Kru yang Diuji</label>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-brand-muted uppercase mb-1.5">Topik Soal</label>
              <select 
                value={selectedTopik} 
                onChange={(e) => setSelectedTopik(e.target.value)}
                className="w-full p-2.5 text-xs bg-brand-bg dark:bg-dark-bg border border-brand-border rounded-xl focus:outline-none"
              >
                {topikList.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-brand-muted uppercase mb-1.5">Jumlah Soal</label>
              <input 
                type="number" 
                value={jumlahSoal} 
                onChange={(e) => setJumlahSoal(Number(e.target.value))}
                min={1} 
                max={20}
                className="w-full p-2.5 text-xs bg-brand-bg dark:bg-dark-bg border border-brand-border rounded-xl focus:outline-none"
              />
            </div>
          </div>

          <button 
            onClick={handleStartQuiz}
            className="w-full bg-brand-red hover:bg-brand-red-dark text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Mulai Ujian Teori</span>
          </button>
        </div>
      )}

      {quizStarted && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-dark-card p-4 rounded-xl border border-brand-border">
            <span className="text-[10px] font-bold text-brand-red uppercase tracking-wider">{selectedTopik}</span>
            <h2 className="text-sm font-bold mt-1">Ujian Sedang Berlangsung</h2>
          </div>

          {soalList.map((s, idx) => (
            <div key={s.id} className="bg-white dark:bg-dark-card p-5 rounded-xl border border-brand-border space-y-3">
              <p className="text-xs font-bold leading-relaxed">{idx + 1}. {s.pertanyaan}</p>
              
              {s.jenis_soal === 'Pilihan Ganda' && (
                <div className="space-y-2">
                  {['a', 'b', 'c', 'd'].map(opt => {
                    const optionText = s[`opsi_${opt}` as keyof Soal] as string;
                    if (!optionText) return null;
                    return (
                      <label key={opt} className={`flex items-center gap-3 p-3 rounded-xl border border-brand-border hover:bg-brand-bg cursor-pointer text-xs transition-colors ${jawaban[s.id] === opt ? 'bg-brand-red/5 border-brand-red' : ''}`}>
                        <input 
                          type="radio" 
                          name={`soal_${s.id}`} 
                          value={opt}
                          checked={jawaban[s.id] === opt}
                          onChange={() => setJawaban({...jawaban, [s.id]: opt})}
                          className="text-brand-red focus:ring-brand-red"
                        />
                        <span><b className="uppercase">{opt}.</b> {optionText}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {s.jenis_soal === 'Benar/Salah' && (
                <div className="flex gap-3">
                  {['Benar', 'Salah'].map(val => (
                    <button 
                      key={val}
                      type="button"
                      onClick={() => setJawaban({...jawaban, [s.id]: val})}
                      className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all ${jawaban[s.id] === val ? 'bg-brand-red text-white border-brand-red shadow-md' : 'bg-brand-bg hover:bg-brand-border border-transparent'}`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              )}

              {s.jenis_soal === 'Essay' && (
                <textarea 
                  value={jawaban[s.id] || ''}
                  onChange={(e) => setJawaban({...jawaban, [s.id]: e.target.value})}
                  placeholder="Ketik jawaban tertulis singkat di sini..."
                  className="w-full p-3 text-xs bg-brand-bg dark:bg-dark-bg border border-brand-border rounded-xl"
                  rows={2}
                />
              )}
            </div>
          ))}

          <button 
            onClick={handleSubmitQuiz}
            disabled={submitting}
            className="w-full bg-brand-red hover:bg-brand-red-dark text-white text-xs font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Kirim & Selesaikan Kuis</span>
          </button>
        </div>
      )}

      {result && (
        <div className="bg-white dark:bg-dark-card p-6 rounded-xl border border-brand-border space-y-6 text-center">
          <div className="inline-flex p-4 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 rounded-full">
            <CheckCircle className="w-12 h-12" />
          </div>
          <div>
            <h2 className="text-lg font-black text-brand-ink">Ujian Teori Selesai!</h2>
            <p className="text-xs text-brand-muted mt-1">Data skor penilaian telah diarsip ke database riwayat kru.</p>
          </div>

          <div className="max-w-xs mx-auto p-4 rounded-2xl bg-brand-bg dark:bg-dark-bg border border-brand-border flex items-center justify-between">
            <div className="text-left">
              <span className="block text-[10px] font-bold text-brand-muted uppercase">Kategori Kompetensi</span>
              <span className="font-extrabold text-sm">{result.kategori}</span>
            </div>
            <div className="text-right">
              <span className="block text-[10px] font-bold text-brand-muted uppercase">Skor Teori</span>
              <span className="text-xl font-black text-brand-red">{result.skor}%</span>
            </div>
          </div>

          <button 
            onClick={() => setResult(null)}
            className="w-full border border-brand-border hover:bg-brand-bg text-xs font-bold py-2.5 rounded-xl"
          >
            Uji Kru Lain
          </button>
        </div>
      )}
    </div>
  );
}
