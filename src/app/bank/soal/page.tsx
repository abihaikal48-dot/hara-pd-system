'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { 
  HelpCircle, Save, Plus, Trash2, Loader2, ChevronLeft, Search, 
  Sparkles, CheckCircle2, AlertCircle, Info, Lock
} from 'lucide-react';

interface Soal {
  id: string;
  topik: string;
  divisi: string;
  jenis_soal: 'Pilihan Ganda' | 'Benar/Salah' | 'Essay';
  pertanyaan: string;
  opsi_a?: string;
  opsi_b?: string;
  opsi_c?: string;
  opsi_d?: string;
  kunci_jawaban: string;
  bobot: number;
  status_aktif: boolean;
}

export default function BankSoalEditorPage() {
  const { user, loading: authLoading } = useAuth();
  const [soalList, setSoalList] = useState<Soal[]>([]);
  const [topikList, setTopikList] = useState<string[]>([]);
  const [selectedTopik, setSelectedTopik] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Load Semua Topik yang Tersedia di Bank Soal [1]
  const fetchTopik = async () => {
    try {
      const { data, error } = await supabase
        .from('bank_soal')
        .select('topik')
        .eq('status_aktif', true);
      
      if (error) throw error;
      const uniqueTopics = Array.from(new Set((data || []).map(t => t.topik)));
      setTopikList(uniqueTopics);
      
      if (uniqueTopics.length && !selectedTopik) {
        setSelectedTopik(uniqueTopics[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Load Soal Berdasarkan Topik Terpilih [1]
  const fetchSoalByTopik = async () => {
    if (!selectedTopik) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bank_soal')
        .select('*')
        .eq('topik', selectedTopik)
        .eq('status_aktif', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setSoalList((data || []) as Soal[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopik();
  }, []);

  useEffect(() => {
    fetchSoalByTopik();
  }, [selectedTopik]);

  // Handler Update Soal Langsung di Kartu (Inline Update) [1]
  const handleFieldChange = (id: string, fieldName: keyof Soal, value: any) => {
    setSoalList(prev => prev.map(s => s.id === id ? { ...s, [fieldName]: value } : s));
  };

  const handleSaveSoal = async (soal: Soal) => {
    setSavingId(soal.id);
    try {
      const { error } = await supabase
        .from('bank_soal')
        .update({
          pertanyaan: soal.pertanyaan,
          opsi_a: soal.opsi_a,
          opsi_b: soal.opsi_b, // PERBAIKAN PENTING: Mengubah 'soar' menjadi 'soal' [1]
          opsi_c: soal.opsi_c,
          opsi_d: soal.opsi_d,
          kunci_jawaban: soal.kunci_jawaban,
          bobot: Number(soal.bobot) || 20,
          divisi: soal.divisi
        })
        .eq('id', soal.id);

      if (error) throw error;
      alert('Perubahan butir soal berhasil disimpan!');
    } catch (err: any) {
      alert('Gagal menyimpan: ' + err.message);
    } finally {
      setSavingId(null);
    }
  };

  // Tambah Soal Kosong Baru ke Dalam Topik Aktif [1]
  const handleAddNewSoal = async () => {
    if (!selectedTopik) {
      alert('Mohon pilih atau buat topik terlebih dahulu.');
      return;
    }
    const draf = {
      topik: selectedTopik,
      divisi: 'Kitchen',
      jenis_soal: 'Pilihan Ganda',
      pertanyaan: 'Ketik draf pertanyaan baru di sini...',
      opsi_a: 'Opsi A',
      opsi_b: 'Opsi B',
      opsi_c: 'Opsi C',
      opsi_d: 'Opsi D',
      kunci_jawaban: 'a',
      bobot: 20,
      status_aktif: true
    };

    try {
      const { error } = await supabase.from('bank_soal').insert(draf);
      if (error) throw error;
      fetchSoalByTopik();
    } catch (err: any) {
      alert('Gagal menambah draf: ' + err.message);
    }
  };

  const handleDeleteSoal = async (id: string) => {
    if (confirm('Yakin ingin menghapus butir soal ini secara permanen dari Supabase?')) {
      try {
        const { error } = await supabase.from('bank_soal').delete().eq('id', id);
        if (error) throw error;
        fetchSoalByTopik();
      } catch (err: any) {
        alert('Gagal menghapus: ' + err.message);
      }
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg dark:bg-dark-bg">
        <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
      </div>
    );
  }

  // Pengaman Sesi Kredensial [1]
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#4A1810] to-[#1B0F0C] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white dark:bg-dark-card rounded-2xl p-6 text-center space-y-4 border border-brand-border">
          <div className="inline-flex p-3 bg-brand-red/10 rounded-full text-brand-red">
            <Lock className="w-8 h-8 animate-bounce" />
          </div>
          <h2 className="text-base font-extrabold text-brand-ink">Akses Terbatas</h2>
          <p className="text-xs text-brand-muted leading-relaxed">Anda wajib masuk log menggunakan akun administrator/staff resmi untuk mengedit bank kuis teori.</p>
          <Link href="/" className="block w-full bg-brand-red text-white text-xs font-bold py-2.5 rounded-xl">Kembali ke Halaman Login</Link>
        </div>
      </div>
    );
  }

  const filteredSoal = soalList.filter(s => 
    s.pertanyaan.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-dark-bg p-4 md:p-8 space-y-6">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-slide-in">
        
        {/* Header Kembali & Aksi */}
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-xs font-bold text-brand-red hover:underline">
            <ChevronLeft className="w-4 h-4" />
            <span>Kembali ke Dasbor</span>
          </Link>
          <span className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Katalog Soal Kognitif</span>
        </div>

        {/* Pemilihan Topik & Judul */}
        <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-brand-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
          <div className="space-y-1">
            <h1 className="text-lg font-black flex items-center gap-2 text-brand-red-dark dark:text-brand-yellow">
              <HelpCircle className="w-5 h-5" />
              <span>Editor Soal Kustom</span>
            </h1>
            <p className="text-xs text-brand-muted">Ganti topik atau klik tambah untuk mengedit butir soal secara dinamis [1].</p>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <select 
              value={selectedTopik} 
              onChange={(e) => setSelectedTopik(e.target.value)}
              className="p-2.5 text-xs bg-brand-bg dark:bg-dark-bg border border-brand-border rounded-xl focus:outline-none w-full md:w-56"
            >
              {topikList.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            <button 
              onClick={handleAddNewSoal}
              className="bg-brand-red hover:bg-brand-red-dark text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-md flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Soal</span>
            </button>
          </div>
        </div>

        {/* Filter Pencarian Kata Kunci */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-brand-muted pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kata kunci di dalam pertanyaan..."
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white dark:bg-dark-card border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red"
          />
        </div>

        {/* Grid Kartu Editor Soal Visual */}
        {filteredSoal.length === 0 ? (
          <p className="text-xs text-brand-muted text-center py-10">Tidak ada butir soal dalam topik ini.</p>
        ) : (
          <div className="space-y-4">
            {filteredSoal.map((soal, idx) => (
              <div key={soal.id} className="bg-white dark:bg-dark-card p-5 rounded-2xl border border-brand-border shadow-md space-y-4 relative overflow-hidden animate-pop-in">
                
                {/* Header Kartu */}
                <div className="flex justify-between items-center border-b border-brand-border/40 pb-2">
                  <span className="text-[10px] font-black text-brand-red uppercase tracking-wider">Soal #{idx + 1} ({soal.jenis_soal})</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleSaveSoal(soal)}
                      disabled={savingId === soal.id}
                      className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                      title="Simpan Perubahan"
                    >
                      {savingId === soal.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    </button>
                    <button 
                      onClick={() => handleDeleteSoal(soal.id)}
                      className="p-1.5 rounded-lg bg-brand-red/10 text-brand-red hover:bg-brand-red/20 transition-colors"
                      title="Hapus Permanen"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Baris Pertanyaan */}
                <div>
                  <label className="block text-[9px] font-bold text-brand-muted uppercase mb-1">Pertanyaan Soal</label>
                  <textarea 
                    value={soal.pertanyaan}
                    onChange={(e) => handleFieldChange(soal.id, 'pertanyaan', e.target.value)}
                    className="w-full p-2.5 text-xs bg-brand-bg dark:bg-dark-bg border border-brand-border rounded-xl focus:outline-none"
                    rows={2}
                  />
                </div>

                {/* Baris Pilihan Opsi untuk Pilihan Ganda */}
                {soal.jenis_soal === 'Pilihan Ganda' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {['a', 'b', 'c', 'd'].map(opt => (
                      <div key={opt}>
                        <label className="block text-[9px] font-bold text-brand-muted uppercase mb-1">Opsi {opt.toUpperCase()}</label>
                        <input 
                          type="text"
                          // PERBAIKAN UTAMA: Type Casting Dinamis dengan 'as string' untuk Menolak Kesalahan Boolean [1]
                          value={(soal[`opsi_${opt}` as keyof Soal] as string) || ''}
                          onChange={(e) => handleFieldChange(soal.id, `opsi_${opt}` as keyof Soal, e.target.value)}
                          className="w-full p-2 text-xs bg-brand-bg dark:bg-dark-bg border border-brand-border rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Parameter Penilaian (Kunci Jawaban, Bobot, Divisi) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-brand-border/40 pt-3">
                  <div>
                    <label className="block text-[9px] font-bold text-brand-muted uppercase mb-1">Kunci Jawaban</label>
                    <input 
                      type="text"
                      value={soal.kunci_jawaban}
                      onChange={(e) => handleFieldChange(soal.id, 'kunci_jawaban', e.target.value)}
                      placeholder="Contoh: a / Benar / Salah"
                      className="w-full p-2 text-xs bg-brand-bg dark:bg-dark-bg border border-brand-border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-brand-muted uppercase mb-1">Bobot Nilai</label>
                    <input 
                      type="number"
                      value={soal.bobot}
                      onChange={(e) => handleFieldChange(soal.id, 'bobot', Number(e.target.value))}
                      className="w-full p-2 text-xs bg-brand-bg dark:bg-dark-bg border border-brand-border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-brand-muted uppercase mb-1">Klasifikasi Divisi</label>
                    <select 
                      value={soal.divisi}
                      onChange={(e) => handleFieldChange(soal.id, 'divisi', e.target.value)}
                      className="w-full p-2 text-xs bg-brand-bg dark:bg-dark-bg border border-brand-border rounded-lg"
                    >
                      <option>Kitchen</option>
                      <option>Helper</option>
                      <option>Geprek</option>
                      <option>Kasir</option>
                    </select>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
