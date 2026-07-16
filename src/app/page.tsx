'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { KeyRound, Mail, AlertCircle, Loader2 } from 'lucide-react';

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
          ? 'Email atau password salah.' 
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
    <div className="min-h-screen bg-gradient-to-br from-[#4A1810] to-[#1B0F0C] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-dark-card rounded-2xl shadow-2xl overflow-hidden border border-brand-border dark:border-dark-border relative">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-red-dark via-brand-yellow to-brand-red" />
        
        <div className="p-8">
          {/* Logo & Identitas */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFDD7A] to-brand-yellow flex items-center justify-center font-black text-2xl text-brand-red-dark shadow-xl mb-3">
              H
            </div>
            <h1 className="text-xl font-extrabold text-brand-ink dark:text-dark-ink">Hara Chicken</h1>
            <p className="text-xs text-brand-muted dark:text-dark-muted mt-1 uppercase tracking-widest font-semibold">People Development</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Input Email */}
            <div>
              <label className="block text-xs font-bold text-brand-muted dark:text-dark-muted mb-1.5 uppercase tracking-wider">Email Kerja</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-brand-muted pointer-events-none">
                  <Mail className="w-4 h-4" />
                </span>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@harachicken.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-brand-bg dark:bg-dark-bg border border-brand-border dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Input Password */}
            <div>
              <label className="block text-xs font-bold text-brand-muted dark:text-dark-muted mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-brand-muted pointer-events-none">
                  <KeyRound className="w-4 h-4" />
                </span>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-brand-bg dark:bg-dark-bg border border-brand-border dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Penanganan Kesalahan */}
            {errorMsg && (
              <div className="flex items-center gap-2 bg-brand-red/10 border border-brand-red/20 text-brand-red px-4 py-2.5 rounded-xl text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Tombol Masuk */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-150 flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <span>Masuk Aplikasi</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
