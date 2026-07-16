'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  BookOpen, Play, CheckCircle2, AlertCircle, Loader2, User, 
  MapPin, Award, Check, ClipboardList, HelpCircle
} from 'lucide-react';

interface Kru {
  id: string;
  nama_kru: string;
  divisi: string;
  outlet_id: string;
  outlets?: { nama_outlet: string };
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

export default function PublicExamPage() {
  const [kruList, setKruList] = useState<Kru[]>([]);
  const [topikList, setTopikList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Pendaftaran Ujian
  const [selectedKruId, setSelectedKruId] = useState('');
  const [associatedOutletName, setAssociatedOutletName] = useState('');
  const [associatedOutletId, setAssociatedOutletId] = useState('');
  const [selectedTopik, setSelectedTopik] = useState('');
  const [jumlahSoal, setJumlahSoal] = useState(5);

  // Status Jalannya Kuis
  const [quizStarted, setQuizStarted] = useState(false);
  const [soalList, setSoalList] = useState<Soal[]>([]);
  const [jawaban, setQuizJawaban] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // State Hasil Akhir
  const [result, setResult] = useState<{
    skor: number;
    kategori: string;
    jumlahBenar: number;
    total: number;
    namaKru: string;
    topik: string;
  } | null>(null);

  // Muat Data Kunci di Awal
  useEffect(() => {
    const fetchExamParams = async () => {
      setLoading(true);
      try {
        // Ambil daftar kru aktif beserta nama outlet penugasan mereka
        const { data: kr } = await supabase
          .from('kru')
          .select('*, outlets(nama_outlet)')
          .eq('status_aktif', true)
          .order('nama_kru');

        // Ambil daftar topik ujian yang aktif di Bank Soal
        const { data: topics } = await supabase
          .from('bank_soal')
          .select('topik')
          .eq('status_aktif', true);

        setKruList((kr || []) as unknown as Kru[]);
        const uniqueTopics = Array.from(new Set((topics || []).map(t => t.topik)));
        setTopikList(uniqueTopics);

        if (kr?.length) {
          setSelectedKruId(kr[0].id);
          setAssociatedOutletName(kr[0].outlets?.nama_outlet || 'Outlet Belum Diatur');
          setAssociatedOutletId(kr[0].outlet_id);
        }
        if (uniqueTopics.length) {
          setSelectedTopik(uniqueTopics[0]);
        }
      } catch (err) {
        console.error('Gagal menyiapkan data ujian', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExamParams();
  }, []);

  // Logika Failsafe Auto-Populate Detil Outlet saat Nama Kru Berubah
  const handleKruChange = (kruId: string) => {
    setSelectedKruId(kruId);
    const found = kruList.find(k => k.id === kruId);
    if (found) {
      setAssociatedOutletName(found.outlets?.nama_outlet || 'Outlet Belum Diatur');
      setAssociatedOutletId(found.outlet_id);
    }
  };

  // Mulai Kuis Acak SOP
  const handleStartQuiz = async () => {
    if (!selectedKruId || !selectedTopik) {
      alert('Mohon lengkapi pilihan Kru dan Topik ujian.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bank_soal')
        .select('*')
        .eq('topik', selectedTopik)
        .eq('status_aktif', true);

      if (error) throw error;

      if (!data || data.length === 0) {
        alert('Tidak ada soal aktif untuk topik kuis ini.');
        return;
      }

      // Acak urutan soal
      const shuffled = [...data].sort(() => 0.5 - Math.random());
      setSoalList((shuffled.slice(0, jumlahSoal) as unknown as Soal[]));
      setQuizJawaban({});
      setResult(null);
      setQuizStarted(true);
    } catch (err: any) {
      alert('Gagal memuat soal: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Kirim Hasil Jawaban Kuis
  const handleSubmitQuiz = async () => {
    const activeKru = kruList.find(k => k.id === selectedKruId);
    if (!activeKru) return;

    // Pastikan semua soal terjawab
    const answeredCount = Object.keys(quizJawaban).length;
    if (answeredCount < soalList.length) {
      alert('Mohon jawab seluruh pertanyaan sebelum menekan tombol kirim.');
      return;
    }

    setSubmitting(true);
    try {
      let scoreTotal = 0;
      let totalBobot = 0;
      let corrects = 0;
      const detail: any[] = [];

      soalList.forEach(s => {
        const uAns = (quizJawaban[s.id] || '').trim().toLowerCase();
        const cAns = s.kunci_jawaban.trim().toLowerCase();
        const wt = Number(s.bobot) || 20;

        totalBobot += wt;
        const correct = uAns === cAns;
        if (correct) {
          scoreTotal += wt;
          corrects++;
        }

        detail.push({
          soal_id: s.id,
          pertanyaan: s.pertanyaan,
          user_ans: uAns,
          correct_ans: cAns,
          is_correct: correct
        });
      });

      const finalSkor = totalBobot > 0 ? Math.round((scoreTotal / totalBobot) * 100) : 0;
      const cat = finalSkor >= 80 ? 'Sangat Baik' : finalSkor >= 60 ? 'Baik' : finalSkor >= 40 ? 'Cukup' : 'Perlu Diulang';

      // Simpan langsung ke tabel penilaian_teori Supabase
      const { error } = await supabase.from('penilaian_teori').insert({
        kru_id: selectedKruId,
        outlet_id: associatedOutletId,
        topik: selectedTopik,
        jumlah_soal: soalList.length,
        jumlah_benar: corrects,
        skor: finalSkor,
        kategori: cat,
        detail_jawaban: detail
      });

      if (error) throw error;

      setResult({
        skor: finalSkor,
        kategori: cat,
        jumlahBenar: corrects,
        total: soalList.length,
        namaKru: activeKru.nama_kru,
        topik: selectedTopik
      });
      setQuizStarted(false);
    } catch (err: any) {
      alert('Gagal menyimpan hasil ujian: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg dark:bg-dark-bg">
        <div className="w-8 h-8 border-4 border-brand-border border-t-brand-red rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4A1810] to-[#1B0F0C] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-dark-card rounded-2xl shadow-2xl border border-brand-border dark:border-dark-border overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-red-dark via-brand-yellow to-brand-red" />
        
        {/* ===== DISPLAY 1: FORM SELEKSI MASUK UJIAN ===== */}
        {!quizStarted && !result && (
          <div className="p-6 md:p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 bg-brand-red/10 rounded-2xl mb-2 text-brand-red">
                <ClipboardList className="w-6 h-6" />
              </div>
              <h1 className="text-lg font-black text-brand-ink dark:text-dark-ink">Ujian Mandiri Kompetensi Kru</h1>
              <p className="text-xs text-brand-muted dark:text-dark-muted max-w-sm mx-auto">
                Portal evaluasi mandiri kecakapan standar kerja SOP. Hasil kuis akan diarsip otomatis di profil Anda.
              </p>
            </div>

            <div className="space-y-4 bg-brand-bg dark:bg-dark-bg/40 p-4 rounded-xl border border-brand-border/40">
              {/* Dropdown Kru */}
              <div>
                <label className="block text-[10px] font-black text-brand-muted uppercase mb-1.5 tracking-wider flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-brand-red" />
                  <span>Pilih Nama Anda *</span>
                </label>
                <select 
                  value={selectedKruId} 
                  onChange={(e) => handleKruChange(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white dark:bg-dark-card border border-brand-border rounded-xl focus:outline-none"
                  required
                >
                  <option value="">-- Pilih Nama Anda --</option>
                  {kruList.map(k => (
                    <option key={k.id} value={k.id}>{k.nama_kru} ({k.divisi})</option>
                  ))}
                </select>
              </div>

              {/* Tampilan Outlet Pendeteksi Otomatis */}
              <div>
                <label className="block text-[10px] font-black text-brand-muted uppercase mb-1.5 tracking-wider flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-red" />
                  <span>Outlet Penugasan (Terdeteksi)</span>
                </label>
                <input 
                  type="text" 
                  value={associatedOutletName}
                  disabled
                  className="w-full p-2.5 text-xs bg-white/50 dark:bg-dark-card/50 border border-brand-border rounded-xl font-bold text-brand-red-dark cursor-not-allowed"
                />
              </div>

              {/* Pemilihan Topik & Jumlah Soal */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-brand-muted uppercase mb-1.5 tracking-wider">Topik Ujian *</label>
                  <select 
                    value={selectedTopik} 
                    onChange={(e) => setSelectedTopik(e.target.value)}
                    className="w-full p-2.5 text-xs bg-white dark:bg-dark-card border border-brand-border rounded-xl focus:outline-none"
                    required
                  >
                    {topikList.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-brand-muted uppercase mb-1.5 tracking-wider">Jumlah Soal *</label>
                  <input 
                    type="number" 
                    value={jumlahSoal} 
                    onChange={(e) => setJumlahSoal(Number(e.target.value))}
                    min={1} 
                    max={20}
                    className="w-full p-2.5 text-xs bg-white dark:bg-dark-card border border-brand-border rounded-xl focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={handleStartQuiz}
              className="w-full bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-xs shadow-md transition-all duration-150"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Mulai Ujian Sekarang</span>
            </button>
          </div>
        )}

        {/* ===== DISPLAY 2: SOAL UJIAN BERJALAN ===== */}
        {quizStarted && (
          <div className="p-6 md:p-8 space-y-5">
            <div className="pb-3 border-b border-brand-border flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-brand-red uppercase tracking-widest">{selectedTopik}</span>
                <h2 className="text-sm font-black text-brand-ink dark:text-dark-ink mt-0.5">SOP Ujian Berjalan</h2>
              </div>
              <span className="text-[10px] font-bold text-brand-muted">Tanpa Sesi Login</span>
            </div>

            {/* List Pertanyaan */}
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
              {soalList.map((s, idx) => (
                <div key={s.id} className="p-4 bg-brand-bg dark:bg-dark-bg/50 rounded-xl border border-brand-border space-y-3">
                  <p className="text-xs font-bold leading-relaxed">{idx + 1}. {s.pertanyaan}</p>
                  
                  {s.jenis_soal === 'Pilihan Ganda' && (
                    <div className="space-y-1.5">
                      {['a', 'b', 'c', 'd'].map(opt => {
                        const optText = s[`opsi_${opt}` as keyof Soal] as string;
                        if (!optText) return null;
                        return (
                          <label key={opt} className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${quizJawaban[s.id] === opt ? 'bg-brand-red/10 border-brand-red font-bold' : 'border-brand-border bg-white dark:bg-dark-card'}`}>
                            <input 
                              type="radio" 
                              name={`soal_${s.id}`}
                              value={opt}
                              checked={quizJawaban[s.id] === opt}
                              onChange={() => setQuizJawaban({...quizJawaban, [s.id]: opt})}
                              className="text-brand-red focus:ring-brand-red"
                            />
                            <span><b className="uppercase">{opt}.</b> {optText}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {s.jenis_soal === 'Benar/Salah' && (
                    <div className="flex gap-2">
                      {['Benar', 'Salah'].map(val => (
                        <button 
                          key={val}
                          type="button"
                          onClick={() => setQuizJawaban({...quizJawaban, [s.id]: val})}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${quizJawaban[s.id] === val ? 'bg-brand-red text-white border-brand-red' : 'bg-white border-brand-border dark:bg-dark-card dark:border-dark-border'}`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  )}

                  {s.jenis_soal === 'Essay' && (
                    <textarea 
                      value={quizJawaban[s.id] || ''}
                      onChange={(e) => setQuizJawaban({...quizJawaban, [s.id]: e.target.value})}
                      placeholder="Tulis jawaban singkat sesuai naskah SOP..."
                      className="w-full p-2.5 text-xs bg-white dark:bg-dark-card border border-brand-border rounded-xl"
                      rows={2}
                    />
                  )}
                </div>
              ))}
            </div>

            <button 
              onClick={handleSubmitQuiz}
              disabled={submitting}
              className="w-full bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-xs shadow-md"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Kirim & Selesaikan Ujian</span>
            </button>
          </div>
        )}

        {/* ===== DISPLAY 3: SCREEN HASIL KELULUSAN ===== */}
        {result && (
          <div className="p-6 md:p-8 text-center space-y-5">
            <div className="inline-flex p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-full">
              <CheckCircle2 className="w-12 h-12 animate-pop-in" />
            </div>
            
            <div className="space-y-1">
              <h2 className="text-base font-extrabold text-brand-ink dark:text-dark-ink">Hasil Evaluasi Terkirim!</h2>
              <p className="text-xs text-brand-muted dark:text-dark-muted">Data kuis Anda telah dicatat langsung di database mentor PD.</p>
            </div>

            <div className="p-4 bg-brand-bg dark:bg-dark-bg/40 border border-brand-border rounded-2xl max-w-xs mx-auto space-y-3 text-left">
              <div>
                <span className="block text-[9px] text-brand-muted font-bold uppercase tracking-wider">Nama Peserta</span>
                <span className="text-xs font-bold text-brand-ink dark:text-dark-ink">{result.namaKru}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 border-t border-brand-border/40 pt-2.5">
                <div>
                  <span className="block text-[9px] text-brand-muted font-bold uppercase tracking-wider">Skor Diperoleh</span>
                  <span className="text-base font-black text-brand-red">{result.skor}%</span>
                </div>
                <div>
                  <span className="block text-[9px] text-brand-muted font-bold uppercase tracking-wider">Kategori</span>
                  <span className="text-xs font-extrabold text-brand-ink dark:text-dark-ink">{result.kategori}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setResult(null)}
              className="w-full border border-brand-border hover:bg-brand-bg text-xs font-bold py-3 rounded-xl transition-all"
            >
              Kembali ke Menu Awal
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
