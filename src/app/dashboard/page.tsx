'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, Database, Users2, ShieldAlert, CalendarRange, Eye, 
  MessageSquare, TrendingUp, AlertOctagon, Star, BookOpen, HelpCircle, 
  FileText, Settings, LogOut, ChevronDown, Award, DollarSign, Target, 
  ClipboardList, Sliders, Bookmark, X, Menu, Bell, Sun, Moon, Plus, 
  Edit2, Trash2, Search, Loader2, CheckCircle, Info, Download, Printer,
  UserCheck, Users, Play, Check
} from 'lucide-react';

const AVATAR_COLORS = ['#C0392B', '#F4B400', '#8E2A1F', '#E67E22', '#2E86AB', '#6C3483', '#16A085'];

function initialsOf(name: string) {
  if (!name) return '?';
  return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function avatarColorOf(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function UnifiedDashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // Navigation & Shell State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPdSubOpen, setIsPdSubOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Global Master Data State (Failsafe Auto-populate)
  const [outlets, setOutlets] = useState<any[]>([]);
  const [kruList, setKruList] = useState<any[]>([]);
  const [bankSop, setBankSop] = useState<any[]>([]);
  const [bankSoal, setBankSoal] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dashboard Stats & Lists
  const [stats, setStats] = useState({ totalOutlet: 0, totalKru: 0, tnaOpen: 0, complaintOpen: 0 });
  const [bciData, setBciData] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [tnaList, setTnaList] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);

  // CRUD & Modals State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

  // Penilaian Teori Quiz State
  const [selectedKruId, setSelectedKruId] = useState('');
  const [selectedTopik, setSelectedTopik] = useState('');
  const [jumlahSoal, setJumlahSoal] = useState(5);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizSoal, setQuizSoal] = useState<any[]>([]);
  const [quizJawaban, setQuizJawaban] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<any>(null);

  // Penilaian Praktik & Lisan SOP Steps State
  const [selectedSopId, setSelectedSopId] = useState('');
  const [penilai, setPenilai] = useState('');
  const [catatan, setCatatan] = useState('');
  const [sopSteps, setSopSteps] = useState<string[]>([]);
  const [stepScores, setStepScores] = useState<Record<number, number>>({});
  const [comprehension, setComprehension] = useState<Record<number, boolean>>({});

  // Profil 360 State
  const [profileKruId, setProfilKruId] = useState('');
  const [profileKruData, setProfileKruData] = useState<any>(null);
  const [profileHistory, setProfileHistory] = useState<Record<string, any[]>>({});
  const [profileMetrics, setProfileMetrics] = useState<Record<string, any>>({});
  const [profileLoading, setProfileLoading] = useState(false);

  // Laporan & Backup State
  const [repOutlet, setRepOutlet] = useState('');
  const [repMonth, setRepMonth] = useState('7');
  const [repYear, setRepYear] = useState('2026');

  // =========================================================
  // FUNGSI PEMBANTU UTAMA (DISEJAJARKAN DI ATAS AGAR BEBAS ERROR) [1]
  // =========================================================
  const toggleDarkMode = () => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  const setScoreForStep = (idx: number, score: number) => {
    setStepScores(prev => ({ ...prev, [idx]: score }));
  };

  const toggleUnderstand = (idx: number, state: boolean) => {
    setComprehension(prev => ({ ...prev, [idx]: state }));
  };

  // Load All System Data On Mount
  const loadSystemData = async () => {
    setLoading(true);
    try {
      const { data: ot } = await supabase.from('outlets').select('*').order('nama_outlet');
      const { data: kr } = await supabase.from('kru').select('*, outlets(nama_outlet)').order('nama_kru');
      const { data: sp } = await supabase.from('bank_sop').select('*').eq('status_aktif', true).order('judul_sop');
      const { data: sl } = await supabase.from('bank_soal').select('*').eq('status_aktif', true);

      setOutlets(ot || []);
      setKruList(kr || []);
      setBankSop(sp || []);
      setBankSoal(sl || []);

      if (kr?.length) {
        setSelectedKruId(kr[0].id);
        setProfilKruId(kr[0].id);
      }
      if (sp?.length) setSelectedSopId(sp[0].id);
      if (ot?.length) setRepOutlet(ot[0].kode_outlet);

      // Hitung Metrik Dashboard
      const { count: outletCount } = await supabase.from('outlets').select('*', { count: 'exact', head: true }).eq('status_aktif', true);
      const { count: kruCount } = await supabase.from('kru').select('*', { count: 'exact', head: true }).eq('status_aktif', true);
      const { count: tnaCount } = await supabase.from('tna').select('*', { count: 'exact', head: true }).neq('status', 'Selesai');
      const { count: compCount } = await supabase.from('kartu_keluhan').select('*', { count: 'exact', head: true }).neq('status', 'Selesai');

      setStats({
        totalOutlet: outletCount || 0,
        totalKru: kruCount || 0,
        tnaOpen: tnaCount || 0,
        complaintOpen: compCount || 0
      });

      // Olah BCI per Outlet & Klasemen Leaderboard
      const { data: obs } = await supabase.from('observasi_lapangan').select('*, outlets(nama_outlet), kru(nama_kru, divisi)');
      const bciMap: Record<string, { total: number; sesuai: number }> = {};
      const leaderboardMap: Record<string, { nama: string; divisi: string; total: number; sesuai: number }> = {};

      obs?.forEach(o => {
        const outletName = o.outlets?.nama_outlet || 'Outlet';
        if (!bciMap[outletName]) bciMap[outletName] = { total: 0, sesuai: 0 };
        bciMap[outletName].total += 1;
        if (o.hasil === 'Sesuai Standar') bciMap[outletName].sesuai += 1;

        const kruName = o.kru?.nama_kru;
        if (kruName) {
          if (!leaderboardMap[kruName]) leaderboardMap[kruName] = { nama: kruName, divisi: o.kru?.divisi || '-', total: 0, sesuai: 0 };
          leaderboardMap[kruName].total += 1;
          if (o.hasil === 'Sesuai Standar') leaderboardMap[kruName].sesuai += 1;
        }
      });

      setBciData(Object.keys(bciMap).map(name => ({ name, bci: Math.round((bciMap[name].sesuai / bciMap[name].total) * 100) })));
      setLeaderboard(Object.values(leaderboardMap).map(l => ({ ...l, bci: Math.round((l.sesuai / l.total) * 100) })).sort((a,b) => b.bci - a.bci).slice(0, 5));

      // Ambil TNA & Keluhan
      const { data: tna } = await supabase.from('tna').select('*, outlets(nama_outlet)').eq('prioritas', 'Tinggi').neq('status', 'Selesai').limit(5);
      const { data: cmp } = await supabase.from('kartu_keluhan').select('*, outlets(nama_outlet)').neq('status', 'Selesai').limit(5);
      setTnaList(tna || []);
      setComplaints(cmp || []);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSystemData();
    // Tema Gelap
    const isDark = localStorage.getItem('theme') === 'dark';
    setDarkMode(isDark);
    if (isDark) document.documentElement.classList.add('dark');
  }, []);

  // Memuat Profil Kru 360 saat Dropdown Dipilih
  useEffect(() => {
    if (!profileKruId) return;
    const fetchProfil = async () => {
      setProfileLoading(true);
      try {
        const { data: prof } = await supabase.from('kru').select('*, outlets(nama_outlet)').eq('id', profileKruId).single();
        setProfileKruData(prof);

        const { data: obs } = await supabase.from('observasi_lapangan').select('*').eq('kru_id', profileKruId).order('created_at', { ascending: false });
        const { data: coa } = await supabase.from('coaching_log').select('*').eq('kru_id', profileKruId).order('tanggal', { ascending: false });
        const { data: gap } = await supabase.from('gap_analysis').select('*').eq('kru_id', profileKruId);
        const { data: teo } = await supabase.from('penilaian_teori').select('*').eq('kru_id', profileKruId).order('created_at', { ascending: false });
        const { data: pra } = await supabase.from('penilaian_praktik').select('*, bank_sop(judul_sop)').eq('kru_id', profileKruId).order('created_at', { ascending: false });
        const { data: lis } = await supabase.from('penilaian_lisan').select('*, bank_sop(judul_sop)').eq('kru_id', profileKruId).order('created_at', { ascending: false });

        setProfileHistory({ observasi: obs || [], coaching: coa || [], gap: gap || [], teori: teo || [], praktik: pra || [], lisan: lis || [] });

        const sesuaiCount = (obs || []).filter(o => o.hasil === 'Sesuai Standar').length;
        setProfileMetrics({
          bci: (obs || []).length ? Math.round((sesuaiCount / (obs || []).length) * 100) : null,
          avgTeori: (teo || []).length ? Math.round((teo || []).reduce((a,b)=>a+Number(b.skor),0)/(teo || []).length) : null,
          avgPraktik: (pra || []).length ? Number(((pra || []).reduce((a,b)=>a+Number(b.skor_total),0)/(pra || []).length).toFixed(2)) : null,
          avgLisan: (lis || []).length ? Math.round((lis || []).reduce((a,b)=>a+Number(b.persentase_paham),0)/(lis || []).length) : null,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfil();
  }, [profileKruId]);

  // =========================================================
  // SISTEM SINKRONISASI LOGIKA DETIL KRU (AUTO-POPULATE) [1]
  // =========================================================
  const handleKruSelectionChange = (kruId: string, formType: string) => {
    const foundKru = kruList.find(k => k.id === kruId);
    if (foundKru) {
      if (formType === 'praktik') {
        setSelectedKruId(kruId);
        setPenilai(user?.nama || 'Haikal');
      } else if (formType === 'lisan') {
        setSelectedKruId(kruId);
        setPenilai(user?.nama || 'Haikal');
      } else if (formType === 'teori') {
        setSelectedKruId(kruId);
      }
    }
  };

  // SOP Steps Parser
  const handleSopSelectionChange = (sopId: string, type: 'praktik' | 'lisan') => {
    setSelectedSopId(sopId);
    const sop = bankSop.find(s => s.id === sopId);
    if (sop) {
      const parts = (sop.langkah_langkah || '').split('\n').map((s: string) => s.trim()).filter(Boolean);
      setSopSteps(parts);
      if (type === 'praktik') setStepScores({});
      else setComprehension({});
    }
  };

  // Trigger Kuis Acak
  const handleStartQuiz = () => {
    const questions = bankSoal.filter(s => s.topik === selectedTopik);
    if (!questions.length) {
      alert('Tidak ada soal aktif untuk topik ini.');
      return;
    }
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    setQuizSoal(shuffled.slice(0, jumlahSoal));
    setQuizJawaban({});
    setQuizResult(null);
    setQuizStarted(true);
  };

  const handleSubmitQuiz = async () => {
    const kru = kruList.find(k => k.id === selectedKruId);
    if (!kru) return;

    setSubmitting(true);
    try {
      let scoreTotal = 0;
      let totalBobot = 0;
      let corrects = 0;
      const detail: any[] = [];

      quizSoal.forEach(s => {
        const uAns = (quizJawaban[s.id] || '').trim().toLowerCase();
        const cAns = s.kunci_jawaban.trim().toLowerCase();
        const wt = Number(s.bobot) || 20;

        totalBobot += wt;
        const correct = uAns === cAns;
        if (correct) { scoreTotal += wt; corrects++; }

        detail.push({ soal_id: s.id, pertanyaan: s.pertanyaan, user_ans: uAns, correct_ans: cAns, is_correct: correct });
      });

      const finalSkor = totalBobot > 0 ? Math.round((scoreTotal / totalBobot) * 100) : 0;
      const cat = finalSkor >= 80 ? 'Sangat Baik' : finalSkor >= 60 ? 'Baik' : finalSkor >= 40 ? 'Cukup' : 'Perlu Diulang';

      await supabase.from('penilaian_teori').insert({
        kru_id: kru.id,
        outlet_id: kru.outlet_id,
        topik: selectedTopik,
        jumlah_soal: quizSoal.length,
        jumlah_benar: corrects,
        skor: finalSkor,
        kategori: cat,
        detail_jawaban: detail
      });

      setQuizResult({ skor: finalSkor, kategori: cat, jumlahBenar: corrects, total: quizSoal.length });
      setQuizStarted(false);
      loadSystemData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Penilaian Praktik
  const handleSavePraktik = async () => {
    const kru = kruList.find(k => k.id === selectedKruId);
    const sop = bankSop.find(s => s.id === selectedSopId);
    if (!kru || !sop) return;

    const missing = sopSteps.some((_, idx) => !stepScores[idx]);
    if (missing) {
      alert('Mohon nilai semua butir langkah terlebih dahulu.');
      return;
    }

    setSubmitting(true);
    try {
      const totalPoints = Object.values(stepScores).reduce((a,b)=>a+b, 0);
      const avg = Number((totalPoints / sopSteps.length).toFixed(2));
      const detail = sopSteps.map((s, idx) => ({ langkah: s, skor: stepScores[idx] }));

      await supabase.from('penilaian_praktik').insert({
        kru_id: kru.id,
        outlet_id: kru.outlet_id,
        sop_id: sop.id,
        skor_total: avg,
        detail_skor_langkah: detail,
        catatan,
        penilai
      });

      alert('Penilaian praktik disimpan!');
      setCatatan('');
      setStepScores({});
      loadSystemData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Penilaian Lisan
  const handleSaveLisan = async () => {
    const kru = kruList.find(k => k.id === selectedKruId);
    const sop = bankSop.find(s => s.id === selectedSopId);
    if (!kru || !sop) return;

    const evaluated = Object.keys(comprehension).length;
    if (evaluated < sopSteps.length) {
      alert('Mohon tandai semua pemahaman langkah kerja.');
      return;
    }

    setSubmitting(true);
    try {
      const understood = Object.values(comprehension).filter(v => v === true).length;
      const pct = Math.round((understood / sopSteps.length) * 100);
      const detail = sopSteps.map((s, idx) => ({ langkah: s, paham: comprehension[idx] }));

      await supabase.from('penilaian_lisan').insert({
        kru_id: kru.id,
        outlet_id: kru.outlet_id,
        sop_id: sop.id,
        persentase_paham: pct,
        detail_checklist: detail,
        catatan,
        penilai
      });

      alert('Penilaian lisan disimpan!');
      setCatatan('');
      setComprehension({});
      loadSystemData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // CSV Exporter
  const handleExportCSV = async (tableName: string) => {
    try {
      const { data } = await supabase.from(tableName).select('*');
      if (!data?.length) {
        alert('Tidak ada data ekspor.');
        return;
      }
      const headers = Object.keys(data[0]);
      const csv = [
        headers.join(','),
        ...data.map(row => headers.map(h => {
          let cell = row[h] === null || row[h] === undefined ? '' : String(row[h]);
          if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) cell = `"${cell.replace(/"/g, '""')}"`;
          return cell;
        }).join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `HARA-BACKUP-${tableName.toUpperCase()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-brand-bg dark:bg-dark-bg text-brand-ink dark:text-dark-ink transition-colors duration-200">
      
      {/* Backdrop Mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* ===== SIDEBAR NAVIGASI (SAMA PERSIS CODES INDEX) ===== */}
      <aside className={`
        fixed inset-y-0 left-0 w-[270px] bg-gradient-to-br from-brand-red-dark via-brand-red to-[#D9583F] 
        text-white p-5 flex flex-col z-50 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFDD7A] to-brand-yellow flex items-center justify-center font-black text-lg text-brand-red-dark shadow-lg">
              H
            </div>
            <div>
              <h1 className="font-extrabold text-sm leading-none tracking-wide">Hara Chicken</h1>
              <p className="text-[9px] opacity-80 uppercase tracking-[2px] mt-1 font-semibold">People Dev</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 rounded-lg hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-2 px-1">Utama</p>
            <button 
              onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${activeTab === 'dashboard' ? 'bg-white text-brand-red-dark font-bold shadow-md' : 'text-white/80 hover:bg-white/10'}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-2 px-1">Master Data</p>
            <div className="space-y-1">
              <button 
                onClick={() => { setActiveTab('outlets'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${activeTab === 'outlets' ? 'bg-white text-brand-red-dark font-bold' : 'text-white/80 hover:bg-white/10'}`}
              >
                <Database className="w-4 h-4" />
                <span>Master Outlet</span>
              </button>
              <button 
                onClick={() => { setActiveTab('kru'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${activeTab === 'kru' ? 'bg-white text-brand-red-dark font-bold' : 'text-white/80 hover:bg-white/10'}`}
              >
                <Users2 className="w-4 h-4" />
                <span>Master Kru</span>
              </button>
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-2 px-1">Asesmen &amp; Kuis</p>
            <div className="space-y-1">
              <button 
                onClick={() => { setActiveTab('teori'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${activeTab === 'teori' ? 'bg-white text-brand-red-dark font-bold' : 'text-white/80 hover:bg-white/10'}`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Penilaian Teori</span>
              </button>
              <button 
                onClick={() => { setActiveTab('praktik'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${activeTab === 'praktik' ? 'bg-white text-brand-red-dark font-bold' : 'text-white/80 hover:bg-white/10'}`}
              >
                <Award className="w-4 h-4" />
                <span>Penilaian Praktik</span>
              </button>
              <button 
                onClick={() => { setActiveTab('lisan'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${activeTab === 'lisan' ? 'bg-white text-brand-red-dark font-bold' : 'text-white/80 hover:bg-white/10'}`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Penilaian Lisan</span>
              </button>
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-2 px-1">Profil &amp; Backup</p>
            <div className="space-y-1">
              <button 
                onClick={() => { setActiveTab('profil'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${activeTab === 'profil' ? 'bg-white text-brand-red-dark font-bold' : 'text-white/80 hover:bg-white/10'}`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Profil Kru 360°</span>
              </button>
              <button 
                onClick={() => { setActiveTab('laporan'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${activeTab === 'laporan' ? 'bg-white text-brand-red-dark font-bold' : 'text-white/80 hover:bg-white/10'}`}
              >
                <FileText className="w-4 h-4" />
                <span>Laporan &amp; Backup</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-yellow text-brand-red-dark font-black text-xs flex items-center justify-center">
              HK
            </div>
            <div>
              <p className="text-xs font-bold leading-none">{user?.nama || 'Haikal'}</p>
              <p className="text-[10px] opacity-60">People Dev</p>
            </div>
          </div>
          <button onClick={logout} className="p-1.5 rounded-lg hover:bg-white/10 text-white/80" title="Keluar">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* ===== KONTEN KANAN UTUH ===== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Topbar */}
        <header className="bg-white dark:bg-dark-card border-b border-brand-border dark:border-dark-border px-4 py-3 flex items-center justify-between sticky top-0 z-30 transition-colors duration-200">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 rounded-lg text-brand-ink dark:text-dark-ink hover:bg-brand-bg transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-sm font-black capitalize text-brand-ink dark:text-dark-ink">{activeTab} Panel</h2>
              <p className="text-[10px] text-brand-muted hidden xs:block">HARA-PD System Pro v2</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={toggleDarkMode} className="p-2 rounded-lg text-brand-ink dark:text-dark-ink hover:bg-brand-bg transition-colors">
              {darkMode ? <Sun className="w-4 h-4 text-brand-yellow" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Content Render */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20">
          <div className="max-w-7xl mx-auto animate-fade-slide-in">
            
            {/* 1. TAB: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Banner Gradasi Koki */}
                <div className="relative overflow-hidden bg-gradient-to-r from-brand-red-dark via-brand-red to-[#D9583F] p-6 md:p-8 rounded-2xl text-white shadow-xl flex flex-col md:flex-row justify-between items-center animate-gradient-shift">
                  <div className="space-y-2 z-10 text-center md:text-left max-w-lg">
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-yellow">HARA-PD SYSTEM PRO</p>
                    <h1 className="text-xl md:text-2xl font-black">Selamat Datang, {user?.nama || 'Haikal'} 👋</h1>
                    <p className="text-xs text-white/90 leading-relaxed">
                      Sistem evaluasi pengembangan terstruktur. Pantau seluruh progresi pelatihan mandiri, audit lapangan, dan kesenjangan kompetensi tim.
                    </p>
                  </div>
                  <div className="w-full md:w-auto mt-6 md:mt-0 flex justify-center z-10">
                    <svg className="w-52 h-28 overflow-visible" viewBox="0 0 300 120">
                      <g className="animate-float-slow">
                        <circle cx="50" cy="50" r="16" fill="#F7D9B8" />
                        <path d="M50 36 a16 16 0 0 1 16 14 h-32 a16 16 0 0 1 16 -14 z" fill="#3A241B" />
                        <rect x="33" y="65" width="34" height="55" rx="14" fill="#8E2A1F" />
                        <path d="M36 69 h28 l-4 40 h-20 z" fill="#F4B400" />
                      </g>
                      <g className="animate-float-med">
                        <circle cx="150" cy="45" r="18" fill="#FFE8B0" />
                        <rect x="134" y="22" width="32" height="12" rx="6" fill="#fff" />
                        <rect x="137" y="15" width="26" height="10" rx="5" fill="#fff" />
                        <rect x="127" y="61" width="46" height="70" rx="16" fill="#ffffff" />
                        <path d="M131 66 h38 l-5 50 h-28 z" fill="#C0392B" />
                      </g>
                      <g className="animate-float-fast">
                        <circle cx="250" cy="52" r="15" fill="#F7D9B8" />
                        <path d="M250 37 a15 15 0 0 1 15 13 h-30 a15 15 0 0 1 15 -13 z" fill="#241512" />
                        <rect x="230" y="66" width="40" height="60" rx="15" fill="#8E2A1F" />
                        <rect x="230" y="66" width="40" height="15" rx="7" fill="#ffffff" opacity="0.9" />
                      </g>
                    </svg>
                  </div>
                </div>

                {/* KPI */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Master Outlet', value: stats.totalOutlet, sub: 'Status aktif', color: 'text-brand-red' },
                    { label: 'Kru Aktif', value: stats.totalKru, sub: 'Terpelihara', color: 'text-brand-yellow' },
                    { label: 'Sesi TNA Terbuka', value: stats.tnaOpen, sub: 'Butuh evaluasi', color: 'text-amber-500' },
                    { label: 'Keluhan Terbuka', value: stats.complaintOpen, sub: 'Perlu respon segera', color: 'text-emerald-500' }
                  ].map((kpi, idx) => (
                    <div key={idx} className="bg-white dark:bg-dark-card p-4 rounded-xl border border-brand-border dark:border-dark-border shadow-sm flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-brand-muted mb-1">{kpi.label}</p>
                        <h3 className="text-xl md:text-2xl font-black text-brand-ink dark:text-dark-ink">{kpi.value}</h3>
                        <p className="text-[9px] text-brand-muted mt-1">{kpi.sub}</p>
                      </div>
                      <div className={`p-2.5 rounded-lg bg-brand-bg dark:bg-dark-bg ${kpi.color}`}>
                        {idx === 0 && <Database className="w-5 h-5" />}
                        {idx === 1 && <Users2 className="w-5 h-5" />}
                        {idx === 2 && <ShieldAlert className="w-5 h-5" />}
                        {idx === 3 && <AlertOctagon className="w-5 h-5" />}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Grafik & Leaderboard */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-brand-border dark:border-dark-border">
                    <h2 className="text-xs font-black text-brand-muted uppercase mb-4 flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-brand-red" /> BCI per Outlet</h2>
                    <div className="space-y-4">
                      {bciData.map((data, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold"><span>{data.name}</span><span>{data.bci}%</span></div>
                          <div className="h-2.5 bg-brand-bg dark:bg-dark-bg rounded-full overflow-hidden">
                            <div className="h-full bg-brand-red rounded-full" style={{ width: `${data.bci}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-brand-border dark:border-dark-border">
                    <h2 className="text-xs font-black text-brand-muted uppercase mb-4">🏆 Leaderboard Kru BCI</h2>
                    <div className="space-y-3">
                      {leaderboard.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2 rounded-xl">
                          <div className="font-bold text-xs">{idx + 1}</div>
                          <div className="w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center" style={{ backgroundColor: avatarColorOf(item.nama) }}>{initialsOf(item.nama)}</div>
                          <div className="flex-1 min-w-0"><p className="text-xs font-bold truncate">{item.nama}</p></div>
                          <span className="text-xs font-bold text-brand-red">{item.bci}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. TAB: MASTER OUTLET */}
            {activeTab === 'outlets' && (
              <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-brand-border animate-fade-slide-in">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-sm font-black">Daftar Master Outlet</h2>
                  <button onClick={() => alert('Gunakan database Supabase SQL Editor untuk menambah, mengubah, atau menghapus outlet murni secara aman.')} className="bg-brand-red text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center gap-1.5 shadow-md">
                    <Plus className="w-4 h-4" /> Tambah
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-brand-border pb-2 text-brand-muted"><th className="pb-2">Kode</th><th className="pb-2">Nama Outlet</th><th className="pb-2">Kepala</th><th className="pb-2">Status</th></tr>
                    </thead>
                    <tbody>
                      {outlets.map((o) => (
                        <tr key={o.id} className="border-b border-brand-border/40 hover:bg-brand-bg/50">
                          <td className="py-3 font-bold text-brand-red-dark">{o.kode_outlet}</td>
                          <td className="py-3 font-bold">{o.nama_outlet}</td>
                          <td className="py-3">{o.kepala_outlet || '-'}</td>
                          <td className="py-3"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-bold text-[10px]">{o.status_aktif ? 'Aktif' : 'Nonaktif'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. TAB: MASTER KRU */}
            {activeTab === 'kru' && (
              <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-brand-border animate-fade-slide-in">
                <h2 className="text-sm font-black mb-4">Daftar Master Kru</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-brand-border pb-2 text-brand-muted"><th className="pb-2">Nama Kru</th><th className="pb-2">Divisi</th><th className="pb-2">Outlet</th><th className="pb-2">Status</th></tr>
                    </thead>
                    <tbody>
                      {kruList.map((k) => (
                        <tr key={k.id} className="border-b border-brand-border/40 hover:bg-brand-bg/50">
                          <td className="py-3 font-bold">{k.nama_kru}</td>
                          <td className="py-3 font-semibold text-brand-red">{k.divisi}</td>
                          <td className="py-3">{k.outlets?.nama_outlet || '-'}</td>
                          <td className="py-3"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-bold text-[10px]">{k.status_aktif ? 'Aktif' : 'Resign'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. TAB: TEORI (KUIS INTERAKTIF) */}
            {activeTab === 'teori' && (
              <div className="space-y-6 max-w-xl mx-auto bg-white dark:bg-dark-card p-5 rounded-xl border border-brand-border animate-fade-slide-in">
                <h2 className="text-sm font-black flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-brand-red" /> Sistem Penilaian Teori</h2>
                
                {!quizStarted && !quizResult && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-brand-muted uppercase mb-1">Kru yang Diuji</label>
                      <select value={selectedKruId} onChange={(e) => handleKruSelectionChange(e.target.value, 'teori')} className="w-full p-2.5 text-xs bg-brand-bg dark:bg-dark-bg border border-brand-border rounded-xl">
                        {kruList.map(k => <option key={k.id} value={k.id}>{k.nama_kru}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-brand-muted uppercase mb-1">Topik Kuis</label>
                      <select value={selectedTopik} onChange={(e) => setSelectedTopik(e.target.value)} className="w-full p-2.5 text-xs bg-brand-bg dark:bg-dark-bg border border-brand-border rounded-xl">
                        <option>SOP Dapur</option>
                        <option>Pelayanan Kasir</option>
                      </select>
                    </div>
                    <button onClick={handleStartQuiz} className="w-full bg-brand-red text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md">
                      <Play className="w-4 h-4 fill-white" /> Mulai Ujian Kuis
                    </button>
                  </div>
                )}

                {quizStarted && (
                  <div className="space-y-4">
                    {quizSoal.map((s, idx) => (
                      <div key={s.id} className="p-4 bg-brand-bg dark:bg-dark-bg rounded-xl border border-brand-border space-y-2 animate-fade-slide-in">
                        <p className="text-xs font-bold leading-relaxed">{idx + 1}. {s.pertanyaan}</p>
                        {s.jenis_soal === 'Pilihan Ganda' && (
                          <div className="space-y-1.5 pt-2">
                            {['a', 'b', 'c', 'd'].map(opt => (
                              <label key={opt} className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer ${quizJawaban[s.id] === opt ? 'bg-brand-red/10 border-brand-red font-bold' : 'border-brand-border bg-white dark:bg-dark-card'}`}>
                                <input type="radio" checked={quizJawaban[s.id] === opt} onChange={() => setQuizJawaban({...quizJawaban, [s.id]: opt})} className="text-brand-red focus:ring-brand-red" />
                                <span><b className="uppercase">{opt}.</b> {s[`opsi_${opt}`]}</span>
                              </label>
                            ))}
                          </div>
                        )}
                        {s.jenis_soal === 'Benar/Salah' && (
                          <div className="flex gap-2 pt-2">
                            {['Benar', 'Salah'].map(val => (
                              <button key={val} onClick={() => setQuizJawaban({...quizJawaban, [s.id]: val})} className={`flex-1 py-2 text-xs font-bold rounded-lg border ${quizJawaban[s.id] === val ? 'bg-brand-red text-white border-brand-red' : 'bg-white border-brand-border'}`}>{val}</button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    <button onClick={handleSubmitQuiz} className="w-full bg-brand-red text-white py-3 rounded-xl font-bold text-xs shadow-md">Kirim Jawaban & Selesaikan</button>
                  </div>
                )}

                {quizResult && (
                  <div className="space-y-4 text-center animate-fade-slide-in">
                    <div className="inline-flex p-3 bg-emerald-50 text-emerald-600 rounded-full"><CheckCircle className="w-10 h-10" /></div>
                    <h3 className="font-extrabold text-sm text-brand-ink">Ujian Teori Selesai!</h3>
                    <div className="p-3 bg-brand-bg dark:bg-dark-bg border border-brand-border rounded-xl max-w-xs mx-auto flex justify-between text-xs">
                      <div className="text-left"><p className="text-[10px] text-brand-muted font-bold uppercase">Skor</p><p className="font-bold text-brand-red text-base">{quizResult.skor}%</p></div>
                      <div className="text-right"><p className="text-[10px] text-brand-muted font-bold uppercase">Kategori</p><p className="font-bold">{quizResult.kategori}</p></div>
                    </div>
                    <button onClick={() => setQuizResult(null)} className="w-full border border-brand-border hover:bg-brand-bg text-xs font-bold py-2 rounded-xl">Mulai Uji Ulang</button>
                  </div>
                )}
              </div>
            )}

            {/* 5. TAB: PRAKTIK (BUTIR CEKLIS INTERAKTIF) */}
            {activeTab === 'praktik' && (
              <div className="space-y-6 max-w-xl mx-auto bg-white dark:bg-dark-card p-5 rounded-xl border border-brand-border animate-fade-slide-in">
                <h2 className="text-sm font-black flex items-center gap-1.5"><Award className="w-4 h-4 text-brand-red" /> Lembar Penilaian Praktik</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-brand-muted uppercase mb-1">Kru yang Diuji</label>
                    <select value={selectedKruId} onChange={(e) => handleKruSelectionChange(e.target.value, 'praktik')} className="w-full p-2.5 text-xs bg-brand-bg dark:bg-dark-bg border border-brand-border rounded-xl">
                      {kruList.map(k => <option key={k.id} value={k.id}>{k.nama_kru}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-muted uppercase mb-1">Pilih SOP Acuan</label>
                    <select value={selectedSopId} onChange={(e) => handleSopSelectionChange(e.target.value, 'praktik')} className="w-full p-2.5 text-xs bg-brand-bg dark:bg-dark-bg border border-brand-border rounded-xl">
                      {bankSop.map(s => <option key={s.id} value={s.id}>{s.judul_sop}</option>)}
                    </select>
                  </div>
                </div>

                {sopSteps.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-brand-border animate-fade-slide-in">
                    <p className="text-[11px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-lg font-bold">Lakukan observasi kerja di lapangan. Nilai butir langkah SOP di bawah.</p>
                    <div className="space-y-2">
                      {sopSteps.map((step, idx) => (
                        <div key={idx} className="p-3 bg-brand-bg dark:bg-dark-bg rounded-lg flex flex-col gap-2 justify-between border border-brand-border">
                          <p className="text-xs font-semibold leading-relaxed">{idx + 1}. {step}</p>
                          <div className="flex gap-1.5 self-end">
                            {[
                              { v: 1, label: 'Belum' },
                              { v: 2, label: 'Cukup' },
                              { v: 3, label: 'Kompeten' }
                            ].map(opt => (
                              <button key={opt.v} onClick={() => setScoreForStep(idx, opt.v)} className={`px-2.5 py-1 text-[10px] font-bold rounded border transition-colors ${stepScores[idx] === opt.v ? 'bg-brand-red text-white border-brand-red' : 'bg-white border-transparent'}`}>{opt.label}</button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <textarea value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Tulis catatan evaluasi..." className="w-full p-2.5 text-xs bg-brand-bg dark:bg-dark-bg border border-brand-border rounded-xl" rows={2} />
                    <button onClick={handleSavePraktik} className="w-full bg-brand-red text-white py-3 rounded-xl font-bold text-xs shadow-md">Simpan Hasil Praktik</button>
                  </div>
                )}
              </div>
            )}

            {/* 6. TAB: LISAN (INTERAKTIF WAWANCARA) */}
            {activeTab === 'lisan' && (
              <div className="space-y-6 max-w-xl mx-auto bg-white dark:bg-dark-card p-5 rounded-xl border border-brand-border animate-fade-slide-in">
                <h2 className="text-sm font-black flex items-center gap-1.5"><MessageSquare className="w-4 h-4 text-brand-red" /> Lembar Penilaian Lisan</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-brand-muted uppercase mb-1">Kru yang Diuji</label>
                    <select value={selectedKruId} onChange={(e) => handleKruSelectionChange(e.target.value, 'lisan')} className="w-full p-2.5 text-xs bg-brand-bg dark:bg-dark-bg border border-brand-border rounded-xl">
                      {kruList.map(k => <option key={k.id} value={k.id}>{k.nama_kru}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-muted uppercase mb-1">Pilih SOP Acuan</label>
                    <select value={selectedSopId} onChange={(e) => handleSopSelectionChange(e.target.value, 'lisan')} className="w-full p-2.5 text-xs bg-brand-bg dark:bg-dark-bg border border-brand-border rounded-xl">
                      {bankSop.map(s => <option key={s.id} value={s.id}>{s.judul_sop}</option>)}
                    </select>
                  </div>
                </div>

                {sopSteps.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-brand-border animate-fade-slide-in">
                    <p className="text-[11px] text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg font-bold">Ajukan pertanyaan lisan terkait langkah SOP berikut. Evaluasi pemahamannya.</p>
                    <div className="space-y-2">
                      {sopSteps.map((step, idx) => (
                        <div key={idx} className="p-3 bg-brand-bg dark:bg-dark-bg rounded-lg flex flex-col gap-2 justify-between border border-brand-border">
                          <p className="text-xs font-semibold leading-relaxed">{idx + 1}. {step}</p>
                          <div className="flex gap-1.5 self-end">
                            <button onClick={() => toggleUnderstand(idx, true)} className={`px-3 py-1 text-[10px] font-bold rounded-full border transition-all ${comprehension[idx] === true ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-white'}`}>Paham</button>
                            <button onClick={() => toggleUnderstand(idx, false)} className={`px-3 py-1 text-[10px] font-bold rounded-full border transition-all ${comprehension[idx] === false ? 'bg-brand-red/10 text-brand-red border-brand-red/20' : 'bg-white'}`}>Belum Paham</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <textarea value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Tulis ulasan wawancara..." className="w-full p-2.5 text-xs bg-brand-bg dark:bg-dark-bg border border-brand-border rounded-xl" rows={2} />
                    <button onClick={handleSaveLisan} className="w-full bg-brand-red text-white py-3 rounded-xl font-bold text-xs shadow-md">Simpan Hasil Lisan</button>
                  </div>
                )}
              </div>
            )}

            {/* 7. TAB: PROFIL KRU 360 */}
            {activeTab === 'profil' && (
              <div className="space-y-6 animate-fade-slide-in">
                <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-brand-border">
                  <label className="block text-[10px] font-bold text-brand-muted uppercase mb-1">Navigasi Profil Kru</label>
                  <select value={profileKruId} onChange={(e) => setProfilKruId(e.target.value)} className="w-full p-2.5 text-xs bg-brand-bg dark:bg-dark-bg border border-brand-border rounded-xl">
                    {kruList.map(k => <option key={k.id} value={k.id}>{k.nama_kru} ({k.divisi})</option>)}
                  </select>
                </div>

                {profileLoading ? <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin" /></div> : profileKruData && (
                  <div className="space-y-6 animate-fade-slide-in">
                    <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-brand-border flex justify-between items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-red text-white font-bold text-xs flex items-center justify-center">{initialsOf(profileKruData.nama_kru)}</div>
                        <div>
                          <h3 className="font-extrabold text-sm">{profileKruData.nama_kru}</h3>
                          <p className="text-[10px] text-brand-muted uppercase mt-0.5">{profileKruData.divisi} — {profileKruData.outlets?.nama_outlet}</p>
                        </div>
                      </div>
                      <Link href={`/profil/sertifikat/${profileKruData.id}`} target="_blank" className="bg-brand-red hover:bg-brand-red-dark text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center gap-1">
                        <Printer className="w-4 h-4" /> Cetak Sertifikat
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { label: 'BCI Observasi', value: profileMetrics.bci !== null ? `${profileMetrics.bci}%` : '-', color: 'text-brand-red' },
                        { label: 'Rerata Teori', value: profileMetrics.avgTeori !== null ? `${profileMetrics.avgTeori}%` : '-', color: 'text-brand-yellow' },
                        { label: 'Rerata Praktik', value: profileMetrics.avgPraktik !== null ? `${profileMetrics.avgPraktik}/3` : '-', color: 'text-emerald-500' },
                        { label: 'Rerata Lisan', value: profileMetrics.avgLisan !== null ? `${profileMetrics.avgLisan}%` : '-', color: 'text-blue-500' }
                      ].map((m, idx) => (
                        <div key={idx} className="bg-white dark:bg-dark-card p-4 rounded-xl border border-brand-border text-center">
                          <span className="block text-[9px] font-bold text-brand-muted uppercase mb-1">{m.label}</span>
                          <span className={`text-base font-black ${m.color}`}>{m.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 8. TAB: LAPORAN & BACKUP */}
            {activeTab === 'laporan' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-slide-in">
                <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-brand-border space-y-4">
                  <h2 className="text-xs font-black uppercase text-brand-red">📄 Laporan Bulanan PDF</h2>
                  <p className="text-xs text-brand-muted">Pilih outlet evaluasi lalu buka template PDF siap cetak terintegrasi.</p>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-muted uppercase mb-1">Outlet Evaluasi</label>
                    <select value={repOutlet} onChange={(e) => setRepOutlet(e.target.value)} className="w-full p-2.5 text-xs bg-brand-bg dark:bg-dark-bg border border-brand-border rounded-xl">
                      {outlets.map(o => <option key={o.id} value={o.kode_outlet}>{o.nama_outlet}</option>)}
                    </select>
                  </div>
                  <button onClick={() => alert('Fitur compile PDF template siap dijalankan via browser print landscape.')} className="w-full bg-brand-red text-white py-2.5 rounded-lg text-xs font-bold">Buka Form Cetak Laporan (A4)</button>
                </div>

                <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-brand-border space-y-4 animate-fade-slide-in">
                  <h2 className="text-xs font-black uppercase text-brand-yellow">💾 Cadangkan Database CSV</h2>
                  <p className="text-xs text-brand-muted">Unduh salinan arsip data utama Supabase langsung ke dalam format *.csv standard.</p>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    {[
                      { label: 'Outlets', table: 'outlets' },
                      { label: 'Kru', table: 'kru' },
                      { label: 'TNA Log', table: 'tna' },
                      { label: 'Teori', table: 'penilaian_teori' },
                      { label: 'Praktik', table: 'penilaian_praktik' },
                      { label: 'Lisan', table: 'penilaian_lisan' }
                    ].map((t, idx) => (
                      <button key={idx} onClick={() => handleExportCSV(t.table)} className="p-3 bg-brand-bg dark:bg-dark-bg text-[10px] font-bold rounded-xl flex items-center justify-between border border-brand-border/40 hover:bg-brand-border/20 text-left">
                        <span>{t.label}</span>
                        <Download className="w-3.5 h-3.5 text-brand-red flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
