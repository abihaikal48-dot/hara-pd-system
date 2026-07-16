'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { KeyRound, Mail, AlertCircle, Loader2, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        setErrorMsg(error.message === 'Invalid login credentials' 
          ? 'Kredensial salah. Silakan periksa kembali email & password Anda.' 
          : error.message
        );
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setErrorMsg('Gagal terhubung ke server autentikasi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-dark-bg flex flex-col lg:flex-row transition-colors duration-200">
      
      {/* SISI KIRI: BRANDING & SOPHISTICATED COPY (HIDDEN ON MOBILE) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#4A1810] via-brand-red-dark to-brand-red relative items-center justify-center p-12 text-white overflow-hidden animate-gradient-shift">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(244,180,0,0.15),transparent_50%)]" />
        <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-brand-yellow/10 blur-3xl" />
        
        <div className="max-w-md space-y-6 z-10 relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFDD7A] to-brand-yellow flex items-center justify-center font-black text-xl text-brand-red-dark shadow-xl">
              H
            </div>
            <div>
              <h2 className="font-extrabold text-sm leading-none tracking-widest uppercase text-brand-yellow">Hara Chicken</h2>
              <p className="text-[10px] opacity-80 uppercase tracking-[2px] mt-1 font-semibold">People Development</p>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h1 className="text-3xl font-serif font-black leading-tight tracking-wide">
              Membina Kompetensi,<br />
              Membangun Konsistensi,<br />
              Mencapai Kemajuan.
            </h1>
            <p className="text-xs text-white/80 leading-relaxed">
              Platform terintegrasi untuk penjaminan mutu standar kerja operasional, evaluasi berkala kecakapan kru, perencanaan pelatihan, serta suksesi kepemimpinan outlet secara real-time.
            </p>
          </div>

          <div className="space-y-3 pt-6 border-t border-white/10 text-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-brand-yellow flex-shrink-0" />
              <span>Standarisasi Kepatuhan Kerja (SOP)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-brand-yellow flex-shrink-0" />
              <span>Analisis Kompetensi Kru 360°</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-brand-yellow flex-shrink-0" />
              <span>Data Riwayat Tersinkronisasi Otomatis</span>
            </div>
          </div>
        </div>
      </div>

      {/* SISI KANAN: SOPHISTICATED LOGIN CARD */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm space-y-8 animate-fade-slide-in">
          
          {/* Header Mobile Brand */}
          <div className="text-center lg:text-left space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFDD7A] to-brand-yellow flex items-center justify-center font-black text-2xl text-brand-red-dark shadow-xl mx-auto lg:mx-0 mb-4">
              H
            </div>
            <h2 className="text-2xl font-black tracking-tight text-brand-ink dark:text-dark-ink">
              Masuk Log Sistem PD
            </h2>
            <p className="text-xs text-brand-muted dark:text-dark-muted font-medium leading-relaxed">
              Silakan masukkan email kerja resmi Anda untuk mengakses dasbor penjaminan mutu People Development.
            </p>
          </div>

          {/* Form Kartu */}
          <form onSubmit={handleLogin} className="space-y-5 bg-white dark:bg-dark-card p-6 rounded-2xl border border-brand-border dark:border-dark-border shadow-md">
            <div>
              <label className="block text-[10px] font-black tracking-wider text-brand-muted dark:text-dark-muted mb-1.5 uppercase">Alamat Email Resmi</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-brand-muted pointer-events-none">
                  <Mail className="w-4 h-4" />
                </span>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@harachicken.com"
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-brand-bg dark:bg-dark-bg border border-brand-border dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black tracking-wider text-brand-muted dark:text-dark-muted mb-1.5 uppercase">Kata Sandi Akun</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-brand-muted pointer-events-none">
                  <KeyRound className="w-4 h-4" />
                </span>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-brand-bg dark:bg-dark-bg border border-brand-border dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {errorMsg && (
              <div className="flex items-start gap-2 bg-brand-red/10 border border-brand-red/15 text-brand-red px-4 py-2.5 rounded-xl text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-150 flex items-center justify-center gap-2 text-xs"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi Kredensial...</span>
                </>
              ) : (
                <>
                  <span>Masuk Aplikasi</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Lisensi */}
          <div className="flex items-center justify-center gap-2 text-[10px] text-brand-muted dark:text-dark-muted">
            <ShieldCheck className="w-4 h-4 text-brand-yellow" />
            <span>Sistem Proteksi Enkripsi SSL Terenkripsi</span>
          </div>
        </div>
      </div>

    </div>
  );
}
