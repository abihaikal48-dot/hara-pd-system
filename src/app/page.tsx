'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { KeyRound, Mail, AlertCircle, Loader2, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

// LOGO GEOMETRIS MINIMALIS ELEGAN: Sinergi Chicken Comb & Upward Path People Dev
const LogoPDPro = () => (
  <svg className="w-16 h-16 shadow-md drop-shadow-[0_4px_10px_rgba(244,180,0,0.25)]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="45" stroke="url(#goldGrad)" strokeWidth="1.5" strokeDasharray="4 4" />
    <path d="M25 75 L45 50 L58 62 L75 35" stroke="url(#goldGrad)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M75 35 H65 M75 35 V45" stroke="url(#goldGrad)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M52 35 C52 28 58 22 66 22 C74 22 80 28 80 35 C80 42 74 48 66 48 C58 48 52 42 52 35 Z" fill="url(#crimsonGrad)" />
    <path d="M60 22 C60 17 64 12 68 12 C72 12 76 17 76 22 Z" fill="#F4B400" />
    <circle cx="70" cy="32" r="2.5" fill="#FFF" />
    <path d="M30 65 L45 45 L40 70 Z" fill="#F4B400" opacity="0.8" />
    <defs>
      <linearGradient id="goldGrad" x1="15" y1="5" x2="85" y2="95" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFDD7A" />
        <stop offset="100%" stopColor="#F4B400" />
      </linearGradient>
      <linearGradient id="crimsonGrad" x1="52" y1="22" x2="80" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#C0392B" />
        <stop offset="100%" stopColor="#8E2A1F" />
      </linearGradient>
    </defs>
  </svg>
);

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
      
      {/* SISI KIRI: BRANDING & SOPHISTICATED COPY (Hanya Tampil di PC) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#4A1810] via-brand-red-dark to-brand-red relative items-center justify-center p-12 text-white overflow-hidden animate-gradient-shift">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(244,180,0,0.15),transparent_50%)]" />
        <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-brand-yellow/10 blur-3xl" />
        
        <div className="max-w-md space-y-6 z-10 relative">
          <div className="flex items-center gap-3">
            <LogoPDPro />
            <div>
              <h2 className="font-extrabold text-sm leading-none tracking-widest uppercase text-brand-yellow">Hara Chicken</h2>
              <p className="text-[10px] opacity-80 uppercase tracking-[2px] mt-1 font-semibold">People Development</p>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h1 className="text-3xl font-serif font-black leading-tight tracking-wide">
              Membina Kompetensi,<br />
              Memastikan Konsistensi,<br />
              Menjaga Cita Rasa.
            </h1>
            <p className="text-xs text-white/85 leading-relaxed">
              Selamat datang di portal penjaminan mutu operasional dan pengembangan kompetensi sumber daya manusia Hara Chicken. Kami berkomitmen untuk menyelaraskan keahlian kru dengan visi keunggulan pelayanan di setiap outlet.
            </p>
          </div>

          <div className="space-y-3.5 pt-6 border-t border-white/10 text-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-brand-yellow flex-shrink-0" />
              <span>Standarisasi Kepatuhan Kerja (SOP Kitchen &amp; Service)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-brand-yellow flex-shrink-0" />
              <span>Analisis Kompetensi Kru 360° &amp; Jalur Karir</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-brand-yellow flex-shrink-0" />
              <span>Perencanaan Pelatihan Terstruktur Berbasis TNA</span>
            </div>
          </div>
        </div>
      </div>

      {/* SISI KANAN: LOGIN CARD (DIPERBAIKI PENUH UNTUK MOBILE & PC) */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 min-h-screen lg:min-h-0">
        <div className="w-full max-w-sm space-y-8 animate-fade-slide-in">
          
          {/* Header Mobile Brand */}
          <div className="text-center lg:text-left space-y-2">
            <div className="flex justify-center lg:justify-start mb-4">
              <LogoPDPro />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-brand-ink dark:text-dark-ink">
              Portal Administrasi &amp; Mutu
            </h2>
            <p className="text-xs text-brand-muted dark:text-dark-muted font-medium leading-relaxed">
              Gunakan akun resmi yang terdaftar untuk mengelola standardisasi operasional, kuis kognitif, evaluasi praktik, serta pelaporan suksesi outlet.
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
            <span>Sistem Proteksi Enkripsi SSL Terintegrasi</span>
          </div>
        </div>
      </div>

    </div>
  );
}
