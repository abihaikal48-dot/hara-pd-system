'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, Printer } from 'lucide-react';

export default function SertifikatCetakPage() {
  const params = useParams();
  const id = params.id as string;
  const [kru, setKru] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKru = async () => {
      try {
        const { data, error } = await supabase
          .from('kru')
          .select('*, outlets(nama_outlet)')
          .eq('id', id)
          .single();
        if (data) setKru(data);
      } catch (err) {
        console.error('Gagal memuat sertifikat', err);
      } finally {
        setLoading(false);
      }
    };
    fetchKru();
  }, [id]);

  useEffect(() => {
    if (kru) {
      // Tunggu render selesai baru picu cetak otomatis
      const timer = setTimeout(() => {
        window.print();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [kru]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
      </div>
    );
  }

  if (!kru) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg text-brand-muted text-xs">
        Data kru tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center p-4 print:bg-white print:p-0">
      
      {/* Tombol Panduan Cetak Manual */}
      <div className="mb-6 print:hidden flex gap-3">
        <button 
          onClick={() => window.print()} 
          className="bg-brand-red hover:bg-brand-red-dark text-white font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 text-xs shadow-md transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak / Simpan PDF</span>
        </button>
      </div>

      {/* Bingkai Sertifikat Landscape Klasik A4 (297mm x 210mm) */}
      <div className="w-[1050px] h-[740px] bg-white border-[16px] border-double border-brand-red-dark p-12 flex flex-col justify-between items-center text-center shadow-2xl relative print:shadow-none print:border-brand-red-dark print:my-0">
        
        {/* Dekorasi Pojok Klasik */}
        <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-brand-yellow" />
        <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-brand-yellow" />
        <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-brand-yellow" />
        <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-brand-yellow" />

        {/* Header Program */}
        <div>
          <h1 className="text-4xl font-serif font-black text-brand-red-dark tracking-wide uppercase">Sertifikat Kelulusan</h1>
          <p className="text-xs text-brand-muted tracking-[3px] uppercase mt-1.5 font-bold">Hara Chicken — People Development Program</p>
        </div>

        {/* Isi Penghargaan */}
        <div className="space-y-4">
          <p className="text-sm italic text-brand-muted font-medium">Sertifikat ini secara resmi diberikan kepada:</p>
          <div>
            <h2 className="text-4xl font-serif font-black text-brand-ink underline decoration-brand-yellow decoration-4 underline-offset-8">{kru.nama_kru}</h2>
            <p className="text-xs text-brand-muted font-bold tracking-wider uppercase mt-3">{kru.divisi} — {kru.outlets?.nama_outlet || 'Kru Utama'}</p>
          </div>
          <p className="text-xs text-brand-muted max-w-xl mx-auto leading-relaxed pt-2">
            Atas keberhasilannya menyelesaikan seluruh rangkaian modul pelatihan dasar onboarding, bimbingan langsung di outlet, serta lulus ujian kecakapan teori dan evaluasi praktik standar kepatuhan operasional.
          </p>
        </div>

        {/* Tanggal & Tandatangan (Haikal Abi Satrio - People Development) [1] */}
        <div className="w-full flex justify-between px-16 border-t border-brand-border pt-6">
          <div className="text-left">
            <span className="block text-[10px] text-brand-muted font-bold uppercase tracking-wider">Tanggal Terbit</span>
            <span className="text-xs font-extrabold text-brand-ink">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          <div className="text-right">
            <div className="h-10 w-28 border-b-2 border-brand-border mx-auto flex items-center justify-center italic text-brand-muted text-xs">
              Haikal Abi Satrio
            </div>
            <span className="block text-[10px] text-brand-muted font-bold uppercase tracking-wider mt-1.5">People Development</span>
          </div>
        </div>

      </div>

      {/* Aturan CSS Cetak Landscape A4 */}
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
          }
          @page {
            size: A4 landscape;
            margin: 0;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
