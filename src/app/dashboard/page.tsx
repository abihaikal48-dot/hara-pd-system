
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
  Edit2, Trash2, Search, Loader2, CheckCircle2, Info, Download, Printer,
  UserCheck, Users, Play, Check, Shield, Flame, BookmarkCheck, CalendarDays,
  History, UsersRound, HelpCircle as HelpIcon, FileSpreadsheet, RefreshCw,
  Activity, AlertCircle, Sparkles, LifeBuoy
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

// LOGO BARU: GEOMETRIS MINIMALIS ELEGAN
const LogoPDPro = () => (
  <svg className="w-10 h-10 shadow-lg drop-shadow-[0_4px_10px_rgba(244,180,0,0.25)]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
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

// =========================================================
// UNIFIED DYNAMIC CRUD ENGINE SCHEMA DEFINITION [1]
// (FUNGSI ANGGARAN DISKIP / DISEMBUNYIKAN SECARA TOTAL)
// =========================================================
const ENTITY_CONFIGS: Record<string, {
  table: string;
  title: string;
  desc: string;
  selectQuery: string;
  guideline: string; // TEMPLATE & PANDUAN KONDISI UNTUK TIAP HALAMAN [1]
  fields: Array<{ name: string; label: string; type: 'text' | 'textarea' | 'select' | 'number' | 'date'; options?: string[] }>;
  columns: string[];
}> = {
  outlets: {
    table: 'outlets',
    title: 'Master Outlet',
    desc: 'Kelola data operasional seluruh outlet penugasan Hara Chicken.',
    selectQuery: '*',
    guideline: 'Contoh Pengisian: Kode Outlet: HC-BTL01 | Nama Outlet: Hara Bantul 01 | Kepala Outlet: Haikal Abi Satrio. Gunakan format kode standar (HC-...) untuk memudahkan pemetaan relasi data.',
    fields: [
      { name: 'kode_outlet', label: 'Kode Outlet (Contoh: HC-BTL01)', type: 'text' },
      { name: 'nama_outlet', label: 'Nama Outlet', type: 'text' },
      { name: 'alamat', label: 'Alamat Lengkap', type: 'textarea' },
      { name: 'kepala_outlet', label: 'Nama Kepala Outlet', type: 'text' },
      { name: 'area_supervisor', label: 'Nama Area Supervisor', type: 'text' }
    ],
    columns: ['kode_outlet', 'nama_outlet', 'kepala_outlet', 'area_supervisor']
  },
  kru: {
    table: 'kru',
    title: 'Master Kru',
    desc: 'Kelola tim kerja penugasan. Pilih outlet penugasan di bawah.',
    selectQuery: '*, outlets!outlet_id(nama_outlet)',
    guideline: 'Contoh Pengisian: Nama Lengkap: Rian Syah | Divisi: Kitchen | Outlet: Hara Bantul 01. Untuk kru magang, tuliskan statusnya pada kolom catatan kinerja.',
    fields: [
      { name: 'nama_kru', label: 'Nama Lengkap Kru', type: 'text' },
      { name: 'divisi', label: 'Divisi Tugas', type: 'select', options: ['Kitchen', 'Helper', 'Geprek', 'Kasir'] },
      { name: 'outlet_id', label: 'Outlet Penugasan', type: 'select' },
      { name: 'tanggal_masuk', label: 'Tanggal Masuk', type: 'date' },
      { name: 'catatan', label: 'Catatan Kinerja awal', type: 'textarea' }
    ],
    columns: ['nama_kru', 'divisi', 'status_aktif']
  },
  tna: {
    table: 'tna',
    title: 'Training Need Analysis (TNA)',
    desc: 'Catat setiap kesenjangan kompetensi yang ditemukan di lapangan untuk menyusun rencana training.',
    selectQuery: '*, outlets!outlet_id(nama_outlet)',
    guideline: 'Contoh Pengisian: Divisi: Kitchen | Kesenjangan: Rasa sambal bawang sering berubah karena takaran garam cabai ditakar pakai feeling (tidak ditimbang). | Solusi: Adakan kuis re-training resep sambal bawang (SOP-GPR-01).',
    fields: [
      { name: 'divisi', label: 'Divisi', type: 'select', options: ['Kitchen', 'Helper', 'Geprek', 'Kasir'] },
      { name: 'sumber_temuan', label: 'Sumber Temuan', type: 'text' },
      { name: 'deskripsi_gap', label: 'Deskripsi Gap', type: 'textarea' },
      { name: 'jenis_gap', label: 'Jenis Gap', type: 'select', options: ['Pengetahuan', 'Keterampilan', 'Sikap'] },
      { name: 'prioritas', label: 'Prioritas', type: 'select', options: ['Tinggi', 'Sedang', 'Rendah'] },
      { name: 'rencana_tindak_lanjut', label: 'Rencana Tindak Lanjut', type: 'textarea' },
      { name: 'status', label: 'Status', type: 'select', options: ['Belum', 'Proses', 'Selesai'] }
    ],
    columns: ['divisi', 'deskripsi_gap', 'prioritas', 'status']
  },
  rencana: {
    table: 'rencana_training',
    title: 'Rencana Training / Silabus',
    desc: 'Rancang jadwal dan metode pelatihan berdasarkan kebutuhan training.',
    selectQuery: '*, outlets!outlet_id(nama_outlet)',
    guideline: 'Contoh Pengisian: Topik: Kalibrasi Resep Sambal Bawang | Sasaran Peserta: Kru Geprek & Kitchen | Metode: Praktik langsung menggunakan timbangan digital. Isi tanggal pelaksanaan agar masuk ke radar pengingat sistem.',
    fields: [
      { name: 'topik', label: 'Topik Pelatihan', type: 'text' },
      { name: 'tujuan_pembelajaran', label: 'Tujuan Pembelajaran', type: 'textarea' },
      { name: 'peserta', label: 'Sasaran Peserta', type: 'text' },
      { name: 'metode', label: 'Metode', type: 'select', options: ['Kelas', 'Praktik', 'Simulasi', 'Mentoring'] },
      { name: 'durasi', label: 'Durasi Sesi', type: 'text' },
      { name: 'fasilitator', label: 'Fasilitator', type: 'text' },
      { name: 'tanggal_pelaksanaan', label: 'Tanggal Pelaksanaan', type: 'date' },
      { name: 'status', label: 'Status Rencana', type: 'select', options: ['Direncanakan', 'Terlaksana', 'Dibatalkan'] }
    ],
    columns: ['topik', 'peserta', 'fasilitator', 'tanggal_pelaksanaan', 'status']
  },
  observasi: {
    table: 'observasi_lapangan',
    title: 'Observasi Kerja Lapangan',
    desc: 'Catat hasil pemantauan kepatuhan standar kerja operasional kru saat shift berjalan.',
    selectQuery: '*, kru(nama_kru), outlets!outlet_id(nama_outlet)',
    guideline: 'Contoh Pengisian: SOP Diamati: SOP-KAS-01 (Greeting) | Hasil: Perlu Perbaikan | Catatan Lapangan: Kasir lupa menanyakan dine-in/take-away saat jam ramai antrean. RTL: Coaching GROW.',
    fields: [
      { name: 'tanggal_shift', label: 'Tanggal & Shift', type: 'text' },
      { name: 'standar_sop', label: 'Standar SOP Diamati', type: 'text' },
      { name: 'hasil', label: 'Hasil Observasi', type: 'select', options: ['Sesuai Standar', 'Perlu Perbaikan'] },
      { name: 'catatan_detail', label: 'Catatan Lapangan', type: 'textarea' },
      { name: 'rencana_follow_up', label: 'Rencana Tindak Lanjut', type: 'textarea' }
    ],
    columns: ['kru_id', 'tanggal_shift', 'standar_sop', 'hasil']
  },
  coaching: {
    table: 'coaching_log',
    title: 'Coaching Log (Model GROW)',
    desc: 'Dokumentasikan sesi percakapan pembinaan personal bermetode GROW bersama kru.',
    selectQuery: '*, kru(nama_kru), outlets!outlet_id(nama_outlet)',
    guideline: 'Contoh Pengisian: Goal: Mengurangi kesalahan transaksi POS kasir menjadi 0 dalam sebulan. Reality: Sering terburu-buru saat antrean panjang. Options: Pasang memo kecil pengingat di layar POS. Will: Praktikkan mulai shift malam nanti.',
    fields: [
      { name: 'tanggal', label: 'Tanggal Sesi', type: 'date' },
      { name: 'goal', label: 'Goal (Sasaran)', type: 'text' },
      { name: 'reality', label: 'Reality (Kondisi Saat Ini)', type: 'textarea' },
      { name: 'options', label: 'Options (Pilihan Aksi)', type: 'textarea' },
      { name: 'will_komitmen', label: 'Will (Komitmen Aksi & Waktu)', type: 'textarea' },
      { name: 'hasil_follow_up', label: 'Catatan Follow-Up', type: 'textarea' }
    ],
    columns: ['kru_id', 'tanggal', 'goal', 'will_komitmen']
  },
  gap: {
    table: 'gap_analysis',
    title: 'Competency Gap Analysis',
    desc: 'Analisis tingkat kesenjangan kompetensi kerja kru terhadap standar standar jabatan.',
    selectQuery: '*, kru(nama_kru), outlets!outlet_id(nama_outlet)',
    guideline: 'Contoh Pengisian: Kompetensi Dinilai: Kecepatan Dusting Tepung | Skor Standar: 3 (Kompeten) | Skor Aktual: 1 (Belum Kuasai) | Gap Score: 2 (Kurang 2 poin). Rekomendasi: Sertakan kelas dusting minggu ini.',
    fields: [
      { name: 'kompetensi_dinilai', label: 'Kompetensi Kerja Dinilai', type: 'text' },
      { name: 'skor_standar', label: 'Skor Standar', type: 'number' },
      { name: 'skor_aktual', label: 'Skor Aktual', type: 'number' },
      { name: 'rekomendasi', label: 'Rekomendasi Tindakan', type: 'textarea' }
    ],
    columns: ['kru_id', 'kompetensi_dinilai', 'skor_standar', 'skor_aktual', 'gap_score']
  },
  keluhan: {
    table: 'kartu_keluhan',
    title: 'Kartu Keluhan Pelanggan',
    desc: 'Log keluhan operasional. Keluhan Tipe A wajib diatasi segera di outlet.',
    selectQuery: '*, kru:kru_terkait_id(nama_kru), outlets!outlet_id(nama_outlet)',
    guideline: 'Contoh Pengisian: Tipe Keluhan: A - Segera di Tempat | Deskripsi: Rasa sambal bawang asin ekstrim | Tindakan Diambil: Meminta maaf secara tulus, menarik porsi lama, menyajikan porsi baru dengan resep timbang akurat.',
    fields: [
      { name: 'tanggal_shift', label: 'Tanggal & Shift', type: 'text' },
      { name: 'tipe_keluhan', label: 'Tipe Keluhan', type: 'select', options: ['A - Segera di Tempat', 'B - Dikaji Manajemen'] },
      { name: 'deskripsi_keluhan', label: 'Deskripsi Keluhan', type: 'textarea' },
      { name: 'tindakan_diambil', label: 'Tindakan yang Diambil', type: 'textarea' },
      { name: 'status', label: 'Status Kasus', type: 'select', options: ['Dalam kajian', 'Selesai'] },
      { name: 'tindak_lanjut_training', label: 'Rekomendasi Tindak Lanjut', type: 'text' }
    ],
    columns: ['tanggal_shift', 'tipe_keluhan', 'status']
  },
  talent: {
    table: 'talent_tracker',
    title: 'Talent & Suksesi Tracker',
    desc: 'Identifikasi dan pantau kesiapan suksesi kepemimpinan bagi kru berprestasi.',
    selectQuery: '*, kru:kandidat_id(nama_kru), outlets!outlet_id(nama_outlet)',
    guideline: 'Contoh Pengisian: Target Posisi: Kapten Outlet | Tanggung Jawab Uji Coba: Mengatur jadwal shift mingguan | Progres Terkini: 80% lancar, masih perlu bimbingan komunikasi konflik | Target Kesiapan: Bulan Depan.',
    fields: [
      { name: 'target_posisi', label: 'Target Posisi Promosi', type: 'text' },
      { name: 'tanggung_jawab_uji_coba', label: 'Tanggung Jawab Uji Coba', type: 'textarea' },
      { name: 'progres_terkini', label: 'Progres Evaluasi', type: 'textarea' },
      { name: 'target_waktu_siap', label: 'Target Kesiapan', type: 'text' }
    ],
    columns: ['kru_id', 'target_posisi', 'target_waktu_siap']
  },
  idp: {
    table: 'pd_idp',
    title: 'Individual Development Plan (IDP)',
    desc: 'Rencana kerja peningkatan kecakapan mandiri kru berjangka menengah.',
    selectQuery: '*, kru(nama_kru), outlets!outlet_id(nama_outlet)',
    guideline: 'Contoh Pengisian: Kompetensi Sasaran: Penguasaan Kasir Utama | Aksi Nyata: Membaca Modul Kasir 15 menit/hari, mendampingi kasir senior | Target Selesai: 30 Hari | Dukungan: Modul Pembelajaran POS.',
    fields: [
      { name: 'kompetensi_sasaran', label: 'Kompetensi Sasaran', type: 'text' },
      { name: 'aksi_nyata', label: 'Aksi Nyata', type: 'textarea' },
      { name: 'target_selesai', label: 'Target Selesai', type: 'date' },
      { name: 'dukungan_dibutuhkan', label: 'Dukungan/Alat Dibutuhkan', type: 'text' },
      { name: 'status', label: 'Status IDP', type: 'select', options: ['Direncanakan', 'Berjalan', 'Selesai'] }
    ],
    columns: ['kru_id', 'kompetensi_sasaran', 'target_selesai', 'status']
  },
  evaluasi_reaksi: {
    table: 'pd_evaluasi_reaksi',
    title: 'Evaluasi Reaksi Training (Kirkpatrick L1)',
    desc: 'Ukur tingkat kepuasan peserta terhadap materi, sarana, dan fasilitator pelatihan.',
    selectQuery: '*',
    guideline: 'Contoh Pengisian: Topik Training: Penepungan Keriting | Fasilitator: Haikal Abi Satrio | Rating Materi: 5 (Sangat Puas). Pastikan semua skor terisi angka 1 sampai 5.',
    fields: [
      { name: 'topik_training', label: 'Topik Pelatihan', type: 'text' },
      { name: 'tanggal', label: 'Tanggal Sesi', type: 'date' },
      { name: 'fasilitator', label: 'Nama Fasilitator', type: 'text' },
      { name: 'skor_materi', label: 'Rating Materi (1-5)', type: 'number' },
      { name: 'skor_fasilitator', label: 'Rating Fasilitator (1-5)', type: 'number' },
      { name: 'skor_sarana', label: 'Rating Sarana (1-5)', type: 'number' },
      { name: 'saran_perbaikan', label: 'Masukan & Saran', type: 'textarea' }
    ],
    columns: ['topik_training', 'tanggal', 'fasilitator', 'skor_materi']
  },
  pre_post: {
    table: 'pd_pre_post_test',
    title: 'Pre-Test & Post-Test Tracker',
    desc: 'Catat peningkatan pengetahuan kognitif kru sebelum dan sesudah pelatihan.',
    selectQuery: '*, kru(nama_kru), outlets!outlet_id(nama_outlet)',
    guideline: 'Contoh Pengisian: Topik: SOP Penggorengan Deep Fryer | Skor Pre-Test: 40 | Skor Post-Test: 90. Learning Gain (N-Gain) akan dihitung otomatis oleh trigger Supabase.',
    fields: [
      { name: 'topik', label: 'Topik Pelatihan', type: 'text' },
      { name: 'skor_pre', label: 'Skor Pre-Test', type: 'number' },
      { name: 'skor_post', label: 'Skor Post-Test', type: 'number' }
    ],
    columns: ['kru_id', 'topik', 'skor_pre', 'skor_post', 'learning_gain', 'status_kelulusan']
  },
  onboarding: {
    table: 'pd_onboarding',
    title: 'Onboarding Journey Checklist',
    desc: 'Pantau tahapan adaptasi kerja dan orientasi kru baru secara berkala.',
    selectQuery: '*, kru(nama_kru), outlets!outlet_id(nama_outlet)',
    guideline: 'Contoh Pengisian: Tahap Onboarding: Week 1 | Status Checklist: Proses | Catatan Mentor: Menunjukkan peningkatan cepat dalam teknik penepungan standar krispi.',
    fields: [
      { name: 'tanggal_mulai', label: 'Tanggal Mulai', type: 'date' },
      { name: 'tahap_onboarding', label: 'Tahap Onboarding', type: 'select', options: ['Day 1', 'Week 1', 'Month 1', 'Month 3'] },
      { name: 'status_checklist', label: 'Status Checklist', type: 'select', options: ['Belum Mulai', 'Proses', 'Selesai'] },
      { name: 'catatan_mentor', label: 'Catatan Mentor', type: 'textarea' }
    ],
    columns: ['kru_id', 'tanggal_mulai', 'tahap_onboarding', 'status_checklist']
  },
  pip: {
    table: 'pd_pip_log',
    title: 'Performance Improvement Plan (PIP)',
    desc: 'Program bimbingan intensif bagi kru yang membutuhkan perbaikan kinerja khusus.',
    selectQuery: '*, kru(nama_kru), outlets!outlet_id(nama_outlet)',
    guideline: 'Contoh Pengisian: Masalah: Sering terlambat masuk kerja > 15 menit tanpa info | Target Perbaikan: 0 keterlambatan selama 30 hari PIP berjalan | Status: Dalam Pemantauan.',
    fields: [
      { name: 'masalah_kinerja_utama', label: 'Masalah Kinerja Utama', type: 'textarea' },
      { name: 'target_perbaikan_kerja', label: 'Target Perbaikan Kerja', type: 'textarea' },
      { name: 'durasi_pip_hari', label: 'Durasi PIP (Hari)', type: 'number' },
      { name: 'tanggal_mulai_pip', label: 'Tanggal Mulai PIP', type: 'date' },
      { name: 'hasil_evaluasi_akhir', label: 'Evaluasi Akhir', type: 'select', options: ['Dalam Pemantauan', 'Lulus (Kinerja Baik)', 'Gagal (Tindak Lanjut HR)'] }
    ],
    columns: ['kru_id', 'tanggal_mulai_pip', 'durasi_pip_hari', 'hasil_evaluasi_akhir']
  },
  kamus: {
    table: 'pd_kamus_kompetensi',
    title: 'Kamus Kompetensi Kerja',
    desc: 'Katalog acuan definisi perilaku kerja standar di bawah divisi Hara Chicken.',
    selectQuery: '*',
    guideline: 'Contoh Pengisian: Nama Kompetensi: Integritas Layanan | Definisi: Menjaga kejujuran porsi ulek sambal dan takaran air beras sesuai standardisasi Hara.',
    fields: [
      { name: 'nama_kompetensi', label: 'Nama Kompetensi', type: 'text' },
      { name: 'definisi', label: 'Definisi Kompetensi', type: 'textarea' },
      { name: 'level_1_basic', label: 'Level 1 (Basic)', type: 'textarea' },
      { name: 'level_2_intermediate', label: 'Level 2 (Intermediate)', type: 'textarea' },
      { name: 'level_3_advanced', label: 'Level 3 (Advanced)', type: 'textarea' }
    ],
    columns: ['nama_kompetensi', 'definisi']
  },
  audit: {
    table: 'pd_audit_standar',
    title: 'Audit Standar Operasional',
    desc: 'Audit kepatuhan standar kualitas kebersihan, kecepatan saji, dan keramahan.',
    selectQuery: '*, outlets!outlet_id(nama_outlet)',
    guideline: 'Contoh Pengisian: Auditor: Haikal Abi Satrio | Skor Kebersihan: 5 | Skor Kecepatan: 4. Rata-rata skor audit (1-5) akan dikalkulasi otomatis oleh Supabase trigger.',
    fields: [
      { name: 'tanggal_audit', label: 'Tanggal Audit', type: 'date' },
      { name: 'auditor_lapangan', label: 'Auditor Lapangan', type: 'text' },
      { name: 'skor_kebersihan', label: 'Skor Kebersihan (1-5)', type: 'number' },
      { name: 'skor_kecepatan', label: 'Skor Kecepatan (1-5)', type: 'number' },
      { name: 'skor_keramahan', label: 'Skor Keramahan (1-5)', type: 'number' },
      { name: 'catatan_audit', label: 'Catatan Khusus Audit', type: 'textarea' }
    ],
    columns: ['tanggal_audit', 'auditor_lapangan', 'rata_rata_skor']
  },
  recognition: {
    table: 'pd_recognition',
    title: 'Employee Recognition Log',
    desc: 'Pendataan pemberian apresiasi, kudos, dan penghargaan kru berprestasi.',
    selectQuery: '*, kru(nama_kru), outlets!outlet_id(nama_outlet)',
    guideline: 'Contoh Pengisian: Jenis Apresiasi: Crew of the Month | Uraian: Konsistensi teknik penggorengan matang sempurna (SOP-KIT-03) selama jam padat | Pemberi: Owner.',
    fields: [
      { name: 'jenis_apresiasi', label: 'Jenis Apresiasi', type: 'text' },
      { name: 'keterangan_prestasi', label: 'Uraian Prestasi Kerja', type: 'textarea' },
      { name: 'tanggal_pemberian', label: 'Tanggal Pemberian', type: 'date' },
      { name: 'pemberi_apresiasi', label: 'Pemberi Apresiasi', type: 'text' }
    ],
    columns: ['kru_id', 'jenis_apresiasi', 'tanggal_pemberian', 'pemberi_apresiasi']
  },
  sertifikasi: {
    table: 'pd_sertifikasi',
    title: 'Sertifikasi Kompetensi Kru',
    desc: 'Monitor sertifikat resmi penjaminan mutu kru (misal: Food Safety, Halal).',
    selectQuery: '*, kru(nama_kru), outlets!outlet_id(nama_outlet)',
    guideline: 'Contoh Pengisian: Nama Sertifikasi: Sertifikasi Kasir Utama | Nomor: CERT/KAS/102. Tuliskan status keaktifan secara tertib.',
    fields: [
      { name: 'nama_sertifikasi', label: 'Nama Sertifikasi', type: 'text' },
      { name: 'nomor_sertifikat', label: 'Nomor Sertifikat Resmi', type: 'text' },
      { name: 'tanggal_terbit', label: 'Tanggal Terbit', type: 'date' },
      { name: 'tanggal_kedaluwarsa', label: 'Tanggal Kedaluwarsa', type: 'date' }
    ],
    columns: ['kru_id', 'nama_sertifikasi', 'tanggal_kedaluwarsa', 'status_keaktifan']
  },
  sop: {
    table: 'bank_sop',
    title: 'Bank Standar Operasional Prosedur (SOP)',
    desc: 'Kelola data SOP. Butir langkah kerja di sini otomatis memuat ceklis ujian.',
    selectQuery: '*',
    guideline: 'Contoh Pengisian: Kode SOP: SOP-KIT-01 | Divisi: Kitchen | Judul: Memasak Nasi. Tuliskan langkah-langkah kerja berurutan dengan dipisahkan baris baru (Enter).',
    fields: [
      { name: 'kode_sop', label: 'Kode SOP', type: 'text' },
      { name: 'divisi', label: 'Divisi', type: 'select', options: ['Kitchen', 'Helper', 'Geprek', 'Kasir'] },
      { name: 'judul_sop', label: 'Judul SOP', type: 'text' },
      { name: 'langkah_langkah', label: 'Langkah Kerja (Satu langkah per baris)', type: 'textarea' },
      { name: 'referensi_modul', label: 'Referensi Modul', type: 'text' }
    ],
    columns: ['kode_sop', 'judul_sop', 'divisi']
  },
  soal: {
    table: 'bank_soal',
    title: 'Bank Soal Kuis Teori',
    desc: 'Kelola data soal. Butir soal di sini akan diacak menjadi kuis uji teori.',
    selectQuery: '*',
    guideline: 'Contoh Pengisian: Topik: SOP Dapur | Jenis: Pilihan Ganda | Kunci: b (Gunakan huruf kecil a/b/c/d). Untuk Benar/Salah, isi Kunci dengan kata Benar atau Salah.',
    fields: [
      { name: 'topik', label: 'Topik Kuis', type: 'text' },
      { name: 'divisi', label: 'Divisi', type: 'select', options: ['Kitchen', 'Helper', 'Geprek', 'Kasir'] },
      { name: 'jenis_soal', label: 'Jenis Soal', type: 'select', options: ['Pilihan Ganda', 'Benar/Salah', 'Essay'] },
      { name: 'pertanyaan', label: 'Pertanyaan Soal', type: 'textarea' },
      { name: 'opsi_a', label: 'Opsi A', type: 'text' },
      { name: 'opsi_b', label: 'Opsi B', type: 'text' },
      { name: 'opsi_c', label: 'Opsi C', type: 'text' },
      { name: 'opsi_d', label: 'Opsi D', type: 'text' },
      { name: 'kunci_jawaban', label: 'Kunci Jawaban', type: 'text' },
      { name: 'bobot', label: 'Bobot Nilai', type: 'number' }
    ],
    columns: ['topik', 'jenis_soal', 'kunci_jawaban']
  }
};

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
  const [auditScores, setAuditScores] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);

  // CRUD & Modals State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

  // Dynamic CRUD State for other tables
  const [dynamicRows, setDynamicRows] = useState<any[]>([]);
  const [dynamicSearch, setDynamicSearch] = useState('');
  const [dynamicLoading, setDynamicLoading] = useState(false);

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

  // Pengaturan State (Isolasi Failsafe) [1]
  const [settingsList, setSettingsList] = useState<any[]>([]);
  const [savingSettings, setSavingSettings] = useState(false);

  // =========================================================
  // FUNGSI PEMBANTU UTAMA (DISEJAJARKAN DI ATAS AGAR BEBAS ERROR)
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

  // Load All System Data On Mount (Pemisahan Isolasi Try-Catch) [1]
  const loadSystemData = async () => {
    setLoading(true);
    try {
      const { data: ot } = await supabase.from('outlets').select('*').order('nama_outlet');
      const { data: kr } = await supabase.from('kru').select('*, outlets!outlet_id(nama_outlet)').order('nama_kru');
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
      const { data: obs } = await supabase.from('observasi_lapangan').select('*, outlets!outlet_id(nama_outlet), kru(nama_kru, divisi)');
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
      const { data: tna } = await supabase.from('tna').select('*, outlets!outlet_id(nama_outlet)').eq('prioritas', 'Tinggi').neq('status', 'Selesai').limit(5);
      const { data: cmp } = await supabase.from('kartu_keluhan').select('*, outlets!outlet_id(nama_outlet)').neq('status', 'Selesai').limit(5);
      setTnaList(tna || []);
      setComplaints(cmp || []);

      // UPGRADE DASHBOARD ADVANCED: Ambil log audit standar dan log aktivitas riil [1]
      const { data: aud } = await supabase.from('pd_audit_standar').select('*, outlets!outlet_id(nama_outlet)').order('tanggal_audit', { ascending: false }).limit(3);
      const { data: logs } = await supabase.from('log_aktivitas').select('*').order('waktu', { ascending: false }).limit(4);
      setAuditScores(aud || []);
      setActivityLogs(logs || []);

      // Ambil Pengaturan (Isolasi Khusus Agar Tidak Crash jika Belum di-Seed) [1]
      try {
        const { data: setts } = await supabase.from('settings').select('*');
        setSettingsList(setts || []);
      } catch (err) {
        console.warn("Tabel settings belum siap atau kosong");
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Muat Data Kueri Dinamis untuk 17 Modul Lain (Bebas dari Galat Relasi Supabase) [1]
  const loadDynamicRows = async (tabKey: string) => {
    const config = ENTITY_CONFIGS[tabKey];
    if (!config) return;

    setDynamicLoading(true);
    try {
      const { data, error } = await supabase
        .from(config.table)
        .select(config.selectQuery)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDynamicRows(data || []);
    } catch (err: any) {
      alert('Gagal memuat tabel: ' + err.message);
    } finally {
      setDynamicLoading(false);
    }
  };

  // Simpan Pembaruan Konfigurasi Pengaturan Global
  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      for (const s of settingsList) {
        await supabase.from('settings').update({ value: s.value }).eq('id', s.id);
      }
      alert('Konfigurasi pengaturan global berhasil diperbarui!');
      loadSystemData();
    } catch (err: any) {
      alert('Gagal menyimpan pengaturan: ' + err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  // Monitor Pergantian Tab Dinamis
  useEffect(() => {
    if (ENTITY_CONFIGS.hasOwnProperty(activeTab)) {
      loadDynamicRows(activeTab);
    }
  }, [activeTab]);

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
      } else {
        // Dynamic Form Auto-Populate
        setFormData(prev => ({
          ...prev,
          kru_id: kruId,
          outlet_id: foundKru.outlet_id,
          divisi: foundKru.divisi
        }));
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

  // =========================================================
  // DYNAMIC CRUD ACTIONS HANDLER [1]
  // =========================================================
  const handleOpenDynamicModal = (row?: any) => {
    const config = ENTITY_CONFIGS[activeTab];
    if (!config) return;

    if (row) {
      setEditId(row.id);
      const initialForm: Record<string, any> = {};
      config.fields.forEach(f => {
        initialForm[f.name] = row[f.name];
      });
      // Sertakan data relasional opsional jika ada
      initialForm.kru_id = row.kru_id || '';
      initialForm.outlet_id = row.outlet_id || '';
      setFormData(initialForm);
    } else {
      setEditId(null);
      const initialForm: Record<string, any> = {};
      config.fields.forEach(f => {
        initialForm[f.name] = f.type === 'number' ? 0 : f.type === 'select' && f.options ? f.options[0] : '';
      });
      // Sediakan nilai default relasional opsional
      initialForm.kru_id = kruList[0]?.id || '';
      initialForm.outlet_id = outlets[0]?.id || '';
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const handleSaveDynamicEntity = async (e: React.FormEvent) => {
    e.preventDefault();
    const config = ENTITY_CONFIGS[activeTab];
    if (!config) return;

    setSubmitting(true);
    try {
      const payload = { ...formData };
      
      // Bersihkan ketergantungan relasional asing jika tabel yang diubah adalah Master Data [1]
      if (config.table === 'outlets') {
        delete payload.kru_id;
        delete payload.outlet_id;
      }
      if (config.table === 'kru') {
        delete payload.kru_id;
      }

      if (editId) {
        const { error } = await supabase.from(config.table).update(payload).eq('id', editId);
        if (error) throw error;
        alert('Data berhasil diperbarui!');
      } else {
        const { error } = await supabase.from(config.table).insert(payload);
        if (error) throw error;
        alert('Data berhasil ditambahkan!');
      }

      setIsModalOpen(false);
      loadDynamicRows(activeTab);
      loadSystemData();
    } catch (err: any) {
      alert('Gagal menyimpan: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDynamicEntity = async (id: string) => {
    const config = ENTITY_CONFIGS[activeTab];
    if (!config) return;

    if (confirm('Yakin ingin menghapus data ini secara permanen dari Supabase?')) {
      try {
        const { error } = await supabase.from(config.table).delete().eq('id', id);
        if (error) throw error;
        alert('Data dihapus!');
        loadDynamicRows(activeTab);
        loadSystemData();
      } catch (err: any) {
        alert('Gagal menghapus: ' + err.message);
      }
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-brand-bg dark:bg-dark-bg text-brand-ink dark:text-dark-ink transition-colors duration-200">
      
      {/* Backdrop Mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* ===== SIDEBAR NAVIGASI UTUH ===== */}
      <aside className={`
        fixed inset-y-0 left-0 w-[270px] bg-gradient-to-br from-brand-red-dark via-brand-red to-[#D9583F] 
        text-white p-5 flex flex-col z-50 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/10">
          <div className="flex items-center gap-3">
            <LogoPDPro />
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

          {/* SIKLUS PD UTAMA (AKTIF TOTAL) [1] */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-2 px-1">Siklus Pelatihan</p>
            <div className="space-y-1">
              <button 
                onClick={() => { setActiveTab('tna'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all ${activeTab === 'tna' ? 'bg-white text-brand-red-dark font-bold' : 'text-white/80 hover:bg-white/10'}`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>TNA Kesenjangan</span>
              </button>
              <button 
                onClick={() => { setActiveTab('rencana'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all ${activeTab === 'rencana' ? 'bg-white text-brand-red-dark font-bold' : 'text-white/80 hover:bg-white/10'}`}
              >
                <CalendarRange className="w-4 h-4" />
                <span>Rencana Training</span>
              </button>
              <button 
                onClick={() => { setActiveTab('observasi'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all ${activeTab === 'observasi' ? 'bg-white text-brand-red-dark font-bold' : 'text-white/80 hover:bg-white/10'}`}
              >
                <Eye className="w-4 h-4" />
                <span>Observasi Lapangan</span>
              </button>
              <button 
                onClick={() => { setActiveTab('coaching'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all ${activeTab === 'coaching' ? 'bg-white text-brand-red-dark font-bold' : 'text-white/80 hover:bg-white/10'}`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Coaching Log</span>
              </button>
              <button 
                onClick={() => { setActiveTab('gap'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all ${activeTab === 'gap' ? 'bg-white text-brand-red-dark font-bold' : 'text-white/80 hover:bg-white/10'}`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Gap Analysis</span>
              </button>
              <button 
                onClick={() => { setActiveTab('keluhan'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all ${activeTab === 'keluhan' ? 'bg-white text-brand-red-dark font-bold' : 'text-white/80 hover:bg-white/10'}`}
              >
                <AlertOctagon className="w-4 h-4" />
                <span>Kartu Keluhan</span>
              </button>
              <button 
                onClick={() => { setActiveTab('talent'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all ${activeTab === 'talent' ? 'bg-white text-brand-red-dark font-bold' : 'text-white/80 hover:bg-white/10'}`}
              >
                <Star className="w-4 h-4" />
                <span>Talent Tracker</span>
              </button>
            </div>
          </div>

          {/* SUBMENU PD LANJUTAN (AKTIF TOTAL) [1] */}
          <div>
            <button 
              onClick={() => setIsPdSubOpen(!isPdSubOpen)}
              className="w-full flex items-center justify-between text-white/50 text-[10px] uppercase tracking-wider font-bold mb-2 px-1 hover:text-white"
            >
              <span>PD Lanjutan (Pro)</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isPdSubOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <div className={`space-y-1 pl-2 border-l border-white/10 mt-1 transition-all duration-200 ${isPdSubOpen ? 'block' : 'hidden'}`}>
              {[
                { key: 'idp', label: '🎯 IDP Karyawan' },
                { key: 'evaluasi_reaksi', label: '📋 Evaluasi L1' },
                { key: 'pre_post', label: '📊 Pre/Post Test' },
                { key: 'onboarding', label: '🚀 Onboarding' },
                { key: 'pip', label: '⚖️ PIP Kinerja' },
                { key: 'kamus', label: '📖 Kamus Kompetensi' },
                { key: 'audit', label: '🔍 Audit Operasional' },
                { key: 'recognition', label: '⭐ Reward & Kudos' },
                { key: 'sertifikasi', label: '🎖️ Sertifikasi Kru' },
                { key: 'sop', label: '📘 Bank SOP' },
                { key: 'soal', label: '❓ Bank Soal' }
              ].map(sub => (
                <button 
                  key={sub.key}
                  onClick={() => { setActiveTab(sub.key); setIsSidebarOpen(false); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] transition-all ${activeTab === sub.key ? 'bg-white text-brand-red-dark font-bold' : 'text-white/80 hover:bg-white/10'}`}
                >
                  {sub.label}
                </button>
              ))}
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${activeTab === 'laporan' ? 'bg-white text-brand-red-dark font-bold text-xs' : 'text-white/80 hover:bg-white/10'}`}
              >
                <FileText className="w-4 h-4" />
                <span>Laporan &amp; Backup</span>
              </button>
            </div>
          </div>

          {/* MENU SETTINGS / PENGATURAN GLOBAL TERPISAH [1] */}
          <div className="pt-2 border-t border-white/10">
            <button 
              onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all ${activeTab === 'settings' ? 'bg-white text-brand-red-dark font-bold' : 'text-white/80 hover:bg-white/10'}`}
            >
              <Settings className="w-4 h-4" />
              <span>Pengaturan</span>
            </button>
          </div>

          {/* TOMBOL PINTASAN PORTAL UJIAN KRU MANDIRI TANPA LOGIN [1] */}
          <div className="pt-2">
            <Link 
              href="/ujian" 
              target="_blank" 
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-brand-yellow/10 border border-brand-yellow/20 hover:bg-brand-yellow/20 text-brand-yellow rounded-lg text-xs font-bold transition-all"
            >
              <span>Ujian Kru (Tanpa Login) ➔</span>
            </Link>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-yellow text-brand-red-dark font-black text-xs flex items-center justify-center">
              HK
            </div>
            <div>
              <p className="text-xs font-bold leading-none">{user ? user.raw_user_meta_data?.nama || 'Karyawan Hara' : 'Staff Hara'}</p>
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
              <h2 className="text-sm font-black capitalize text-brand-ink dark:text-dark-ink">
                {ENTITY_CONFIGS.hasOwnProperty(activeTab) ? ENTITY_CONFIGS[activeTab].title : (activeTab === 'settings' ? 'Pengaturan Global' : `${activeTab} Panel`)}
              </h2>
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
            
            {/* 1. TAB: DASHBOARD (UPGRADE TOTAL PROFESIONAL) [1] */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Banner Gradasi Koki */}
                <div className="relative overflow-hidden bg-gradient-to-r from-brand-red-dark via-brand-red to-[#D9583F] p-6 md:p-8 rounded-2xl text-white shadow-xl flex flex-col md:flex-row justify-between items-center animate-gradient-shift">
                  <div className="space-y-2 z-10 text-center md:text-left max-w-lg">
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-yellow">HARA-PD SYSTEM PRO</p>
                    <h1 className="text-xl md:text-2xl font-black">Selamat Datang, {user ? user.raw_user_meta_data?.nama || 'Karyawan Hara' : 'Staff Hara'} 👋</h1>
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

                {/* DYNAMIC NARRATIVE ANALYSIS PANEL (ANALISIS KALIMAT DIAGNOSTIK) [1] */}
                <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-brand-border dark:border-dark-border space-y-3.5 shadow-sm">
                  <div className="flex items-center gap-2 text-brand-red font-black text-xs uppercase tracking-wider">
                    <Sparkles className="w-4.5 h-4.5 text-brand-yellow" />
                    <span>Laporan Narasi &amp; Analisis Diagnostik Sistem</span>
                  </div>
                  <div className="text-xs space-y-3 text-brand-ink leading-relaxed">
                    <p>
                      📌 Berdasarkan data riwayat tersimpan, tingkat keaktifan mutasi operasional saat ini mencakup <b>{stats.totalOutlet} Outlet aktif</b> dengan kapasitas pembinaan sebanyak <b>{stats.totalKru} Kru terdaftar</b>. Secara umum, pemantauan indikator perilaku di lapangan menunjukkan kondisi stabil.
                    </p>
                    {stats.complaintOpen > 0 ? (
                      <p className="p-2.5 bg-brand-red/5 border border-brand-red/10 rounded-lg text-brand-red-dark">
                        ⚠️ <b>Analisis Komplain:</b> Tercatat ada <b>{stats.complaintOpen} keluhan pelanggan aktif</b> yang membutuhkan tindakan perbaikan mendesak. Rekomendasi tindakan: Evaluasi kepatuhan naskah greeting kasir (SOP-KAS-01) dan perketat standar waktu saji di dapur.
                      </p>
                    ) : (
                      <p className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 rounded-lg">
                        ✅ <b>Status Keluhan:</b> Luar biasa! Seluruh komplain operasional pelanggan telah diselesaikan 100% oleh tim di lapangan. Pertahankan konsistensi kualitas layanan.
                      </p>
                    )}
                    {stats.tnaOpen > 0 && (
                      <p className="p-2.5 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-500 rounded-lg">
                        🔴 <b>Prioritas Pelatihan:</b> Ditemukan kesenjangan kompetensi tinggi pada {stats.tnaOpen} sesi TNA terbuka. Manajer operasional disarankan untuk segera menggelar sesi bimbingan bimbingan mandiri bagi divisi dapur (Kitchen).
                      </p>
                    )}
                  </div>
                </div>

                {/* KPI */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Master Outlet', value: stats.totalOutlet, sub: 'Status aktif', color: 'text-brand-red' },
                    { label: 'Kru Dilatih', value: stats.totalKru, sub: 'Terpelihara', color: 'text-brand-yellow' },
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

                {/* UPGRADE WIDGET: AUDIT OPERASIONAL & LOG AKTIVITAS RIIL [1] */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-brand-border">
                    <h2 className="text-xs font-black text-brand-muted uppercase mb-3 flex items-center gap-1.5">
                      <ClipboardCheck className="w-4 h-4 text-emerald-500" />
                      <span>Rata-Rata Skor Audit Standar Terkini</span>
                    </h2>
                    <div className="divide-y divide-brand-border/40">
                      {auditScores.map((aud, idx) => (
                        <div key={idx} className="py-2.5 flex justify-between text-xs">
                          <div>
                            <p className="font-bold text-brand-ink">{aud.outlets?.nama_outlet || '-'}</p>
                            <p className="text-[10px] text-brand-muted mt-0.5">Auditor: {aud.auditor_lapangan} · {new Date(aud.tanggal_audit).toLocaleDateString('id-ID')}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-black text-brand-red">{aud.rata_rata_skor}</span>
                            <span className="text-[10px] text-brand-muted block">dari 5</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-brand-border">
                    <h2 className="text-xs font-black text-brand-muted uppercase mb-3 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-brand-red" />
                      <span>Log Aktivitas Sistem Terbaru (Audit Trail)</span>
                    </h2>
                    <div className="space-y-3">
                      {activityLogs.map((log, idx) => (
                        <div key={idx} className="text-xs p-2.5 bg-brand-bg dark:bg-dark-bg/60 rounded-xl">
                          <div className="flex justify-between font-bold">
                            <span className="text-brand-red-dark">{log.actor_email || 'system'}</span>
                            <span className="text-[10px] font-normal text-brand-muted">{new Date(log.waktu).toLocaleTimeString('id-ID')}</span>
                          </div>
                          <p className="text-[10px] text-brand-muted mt-1">Aksi: {log.aksi} · Entitas: {log.entitas}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* UPGRADE WIDGET: PUSAT PANDUAN & CONTOH KASUS OPERASIONAL [1] */}
                <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-brand-border">
                  <h2 className="text-xs font-black text-brand-muted uppercase mb-4 flex items-center gap-2">
                    <LifeBuoy className="w-4.5 h-4.5 text-brand-yellow animate-spin" />
                    <span>Panduan Pengisian Kasus &amp; Kondisi (SOP Mutu)</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-3.5 bg-brand-bg dark:bg-dark-bg/60 border border-brand-border/40 rounded-xl space-y-2">
                      <span className="font-extrabold text-brand-red block">📝 Kasus 1: TNA Kesenjangan</span>
                      <p className="text-brand-muted text-[11px] leading-relaxed">
                        <b>Kondisi:</b> Kru memasak nasi terlalu lembek akibat takaran air tidak sesuai SOP dapur.<br />
                        <b>Formulir RTL:</b> "Gelar re-training memasak nasi (SOP-KIT-01) bagi seluruh kru dapur shift pagi."
                      </p>
                    </div>
                    <div className="p-3.5 bg-brand-bg dark:bg-dark-bg/60 border border-brand-border/40 rounded-xl space-y-2">
                      <span className="font-extrabold text-brand-yellow block">💬 Kasus 2: Coaching GROW</span>
                      <p className="text-brand-muted text-[11px] leading-relaxed">
                        <b>Kondisi:</b> Kecepatan saji kasir lambat saat jam padat.<br />
                        <b>Formulir GROW:</b> G = Saji dibawah 3 menit. R = Kurang fokus alat POS. O = Pasang catatan tempel. W = Praktikkan di shift malam.
                      </p>
                    </div>
                    <div className="p-3.5 bg-brand-bg dark:bg-dark-bg/60 border border-brand-border/40 rounded-xl space-y-2">
                      <span className="font-extrabold text-emerald-600 block">🛎️ Kasus 3: Keluhan Pelanggan</span>
                      <p className="text-brand-muted text-[11px] leading-relaxed">
                        <b>Kondisi:</b> Pelanggan komplain rasa sambal bawang terlalu asin.<br />
                        <b>Tipe Keluhan:</b> A (Segera Diatasi).<br />
                        <b>Tindakan:</b> "Minta maaf secara tulus, tarik porsi lama, sajikan sambal baru dengan resep pas."
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ===== CORE ENGINE: DYNAMIC RENDERING UNTUK 19 TAB MAS_TER & PD SISTEM LAIN ===== */}
            {ENTITY_CONFIGS.hasOwnProperty(activeTab) && (
              <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-brand-border animate-fade-slide-in space-y-4">
                
                {/* TEMPLATE PANDUAN KASUS UNTUK MASING-MASING HALAMAN (COUPLED DYNAMICALLY) [1] */}
                <div className="bg-brand-red/5 p-4 border-l-4 border-brand-red dark:border-brand-yellow rounded-r-xl text-xs text-brand-red-dark dark:text-brand-yellow leading-relaxed flex items-start gap-2.5 shadow-sm">
                  <Info className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
                  <p>💡 <b>Panduan Pengisian Modul:</b> {ENTITY_CONFIGS[activeTab].guideline}</p>
                </div>

                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div>
                    <h2 className="text-sm font-black">{ENTITY_CONFIGS[activeTab].title}</h2>
                    <p className="text-[11px] text-brand-muted mt-1 leading-relaxed">{ENTITY_CONFIGS[activeTab].desc}</p>
                  </div>
                  <button 
                    onClick={() => handleOpenDynamicModal()}
                    className="bg-brand-red hover:bg-brand-red-dark text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Data</span>
                  </button>
                </div>

                {/* Filter Search */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-brand-muted pointer-events-none">
                    <Search className="w-4 h-4" />
                  </span>
                  <input 
                    type="text"
                    value={dynamicSearch}
                    onChange={(e) => setDynamicSearch(e.target.value)}
                    placeholder="Cari kata kunci data..."
                    className="w-full pl-10 pr-4 py-2 text-xs bg-brand-bg dark:bg-dark-bg border border-brand-border rounded-xl focus:outline-none"
                  />
                </div>

                {/* List Table */}
                {dynamicLoading ? (
                  <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-brand-muted" /></div>
                ) : dynamicRows.length === 0 ? (
                  <p className="text-xs text-brand-muted py-10 text-center">Belum ada data terekam di Supabase.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-brand-border pb-2 text-brand-muted">
                          {ENTITY_CONFIGS[activeTab].columns.map(col => (
                            <th key={col} className="pb-2 font-bold capitalize">{col.replace(/_/g, ' ')}</th>
                          ))}
                          <th className="pb-2 font-bold text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border/40">
                        {dynamicRows.filter(r => JSON.stringify(r).toLowerCase().includes(dynamicSearch.toLowerCase())).map((row) => (
                          <tr key={row.id} className="hover:bg-brand-bg/40">
                            {ENTITY_CONFIGS[activeTab].columns.map(col => (
                              <td key={col} className="py-3 text-brand-muted">
                                {col === 'kru_id' || col === 'kandidat_id' || col === 'kru_dinilai_id' || col === 'peserta_id' || col === 'kru_terkait_id'
                                  ? (row.kru?.nama_kru || '-')
                                  : col === 'outlet_id'
                                    ? (row.outlets?.nama_outlet || '-')
                                    : col === 'created_at' || col === 'tanggal_pelaksanaan' || col === 'tanggal' || col === 'tanggal_mulai_pip' || col === 'tanggal_terbit' || col === 'tanggal_kedaluwarsa' || col === 'tanggal_pemberian' || col === 'tanggal_audit'
                                      ? (row[col] ? new Date(row[col]).toLocaleDateString('id-ID') : '-')
                                      : String(row[col] ?? '-')
                                }
                              </td>
                            ))}
                            <td className="py-3 text-center">
                              <div className="flex gap-1.5 justify-center">
                                <button onClick={() => handleOpenDynamicModal(row)} className="p-1.5 rounded-lg bg-brand-bg text-brand-muted hover:text-brand-ink">
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => handleDeleteDynamicEntity(row.id)} className="p-1.5 rounded-lg bg-brand-red/10 text-brand-red hover:bg-brand-red/20">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
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
                    <div className="inline-flex p-3 bg-emerald-50 text-emerald-600 rounded-full"><CheckCircle2 className="w-10 h-10" /></div>
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
                  <h2 className="text-xs font-black uppercase text-brand-red">📄 Laporan Evaluasi Multi-Periode</h2>
                  <p className="text-xs text-brand-muted font-medium leading-relaxed">Pilih rentang periodisasi evaluasi (Harian, Mingguan, Bulanan, Tahunan) di bawah ini untuk mencetak dokumen fisik berkop resmi.</p>
                  
                  <div className="space-y-3 p-3 bg-brand-bg dark:bg-dark-bg/40 border border-brand-border/40 rounded-xl">
                    <div>
                      <label className="block text-[9px] font-bold text-brand-muted uppercase mb-1">Outlet Evaluasi</label>
                      <select value={repOutlet} onChange={(e) => setRepOutlet(e.target.value)} className="w-full p-2 text-xs bg-white dark:bg-dark-card border border-brand-border rounded-lg">
                        {outlets.map(o => <option key={o.id} value={o.kode_outlet}>{o.nama_outlet}</option>)}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold text-brand-muted uppercase mb-1">Interval Laporan</label>
                        <select className="w-full p-2 text-xs bg-white dark:bg-dark-card border border-brand-border rounded-lg">
                          <option>Harian (H+0)</option>
                          <option>Mingguan (7 Hari)</option>
                          <option>Bulanan (Siklus Penuh)</option>
                          <option>Tahunan (Evaluasi Kerja)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-brand-muted uppercase mb-1">Tahun Anggaran</label>
                        <input type="number" value={repYear} onChange={(e) => setRepYear(e.target.value)} className="w-full p-2 text-xs bg-white dark:bg-dark-card border border-brand-border rounded-lg" />
                      </div>
                    </div>
                  </div>

                  <Link 
                    href={`/laporan/cetak?outlet=${repOutlet}&period=bulanan&month=${repMonth}&year=${repYear}`}
                    target="_blank"
                    className="w-full bg-brand-red hover:bg-brand-red-dark text-white py-2.5 rounded-lg text-xs font-bold shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak Laporan Kepatuhan Fisik (Kop Resmi)</span>
                  </Link>
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

            {/* ===== 9. TAB BARU: MODUL PENGATURAN GLOBAL TERPISAH [1] ===== */}
            {activeTab === 'settings' && (
              <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-brand-border animate-fade-slide-in space-y-5">
                <div>
                  <h2 className="text-sm font-black flex items-center gap-1.5">
                    <Settings className="w-4 h-4 text-brand-red" />
                    <span>Konfigurasi Threshold &amp; Keamanan Global</span>
                  </h2>
                  <p className="text-[11px] text-brand-muted mt-1 leading-relaxed">Kelola batasan minimum metrik BCI, target kognitif kelulusan, dan alamat pengiriman laporan sistem harian.</p>
                </div>

                {settingsList.length === 0 ? (
                  <p className="text-xs text-brand-muted text-center py-6">Gagal memuat daftar parameter pengaturan cloud.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {settingsList.map((set, idx) => (
                      <div key={idx} className="p-3.5 bg-brand-bg dark:bg-dark-bg/60 border border-brand-border/40 rounded-xl space-y-1.5">
                        <label className="block text-[9px] font-black text-brand-red-dark dark:text-brand-yellow uppercase tracking-wider">{set.key.replace(/_/g, ' ')}</label>
                        <input 
                          type="text"
                          value={set.value}
                          onChange={(e) => {
                            const updated = [...settingsList];
                            updated[idx].value = e.target.value;
                            setSettingsList(updated);
                          }}
                          className="w-full p-2.5 text-xs bg-white dark:bg-dark-card border border-brand-border rounded-xl focus:outline-none"
                        />
                        <span className="block text-[9px] text-brand-muted italic leading-relaxed">{set.keterangan || 'Tidak ada uraian'}</span>
                      </div>
                    ))}
                  </div>
                )}

                <button 
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                  className="w-full bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 text-xs shadow-md"
                >
                  {savingSettings && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Simpan Perubahan Pengaturan</span>
                </button>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* ===== CENTRALIZED GLASSMORPHIC MODAL DIALOG UNTUK SELURUH TAB PD ===== */}
      {isModalOpen && ENTITY_CONFIGS.hasOwnProperty(activeTab) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-dark-card rounded-2xl shadow-xl border border-brand-border dark:border-dark-border overflow-hidden animate-pop-in">
            <div className="flex items-center justify-between p-4 border-b border-brand-border dark:border-dark-border bg-brand-bg dark:bg-dark-bg">
              <div>
                <h2 className="text-xs font-black text-brand-red uppercase tracking-wider">{editId ? 'Ubah Data' : 'Tambah Data'}</h2>
                <p className="text-[10px] text-brand-muted">{ENTITY_CONFIGS[activeTab].title}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg hover:bg-brand-bg">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSaveDynamicEntity} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Relasi Hubungan Kru Opsional (Failsafe Auto-Populate) */}
              {ENTITY_CONFIGS[activeTab].table !== 'pd_kamus_kompetensi' && ENTITY_CONFIGS[activeTab].table !== 'pd_annual_pd_plan' && ENTITY_CONFIGS[activeTab].table !== 'outlets' && ENTITY_CONFIGS[activeTab].table !== 'kru' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-brand-bg dark:bg-dark-bg/60 rounded-xl border border-brand-border">
                  <div>
                    <label className="block text-[9px] font-bold text-brand-muted uppercase mb-1">Nama Kru/Subjek Sasaran</label>
                    <select 
                      value={formData.kru_id || ''} 
                      onChange={(e) => handleKruSelectionChange(e.target.value, 'dynamic')}
                      className="w-full p-2 text-xs bg-white dark:bg-dark-card border border-brand-border rounded-lg text-brand-ink dark:text-dark-ink"
                      required
                    >
                      <option value="">-- Pilih Kru --</option>
                      {kruList.map(k => <option key={k.id} value={k.id}>{k.nama_kru}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-brand-muted uppercase mb-1">Penugasan Outlet</label>
                    <select 
                      value={formData.outlet_id || ''} 
                      disabled
                      className="w-full p-2 text-xs bg-white/50 dark:bg-dark-card/50 border border-brand-border rounded-lg cursor-not-allowed font-semibold text-brand-ink dark:text-dark-ink"
                    >
                      {outlets.map(o => <option key={o.id} value={o.id}>{o.nama_outlet}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {/* Pemetaan Atribut Dinamis Sesuai Kolom Database */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ENTITY_CONFIGS[activeTab].fields.map(field => {
                  if (field.name === 'kru_id' || (field.name === 'outlet_id' && ENTITY_CONFIGS[activeTab].table !== 'kru')) return null;
                  return (
                    <div key={field.name} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                      <label className="block text-[9px] font-bold text-brand-muted uppercase mb-1">{field.label}</label>
                      
                      {field.type === 'textarea' && (
                        <textarea 
                          value={formData[field.name] || ''}
                          onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                          className="w-full p-2 text-xs bg-brand-bg dark:bg-dark-bg border border-brand-border rounded-lg text-brand-ink dark:text-dark-ink"
                          rows={3}
                          required
                        />
                      )}

                      {field.type === 'select' && field.options && (
                        <select 
                          value={formData[field.name] || ''}
                          onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                          className="w-full p-2 text-xs bg-brand-bg dark:bg-dark-bg border border-brand-border rounded-lg text-brand-ink dark:text-dark-ink"
                        >
                          {field.options.map(opt => <option key={opt}>{opt}</option>)}
                        </select>
                      )}

                      {/* Dropdown Khusus Pemilihan Outlet Relasional untuk Master Kru [1] */}
                      {field.name === 'outlet_id' && ENTITY_CONFIGS[activeTab].table === 'kru' && (
                        <select 
                          value={formData.outlet_id || ''}
                          onChange={(e) => setFormData({...formData, outlet_id: e.target.value})}
                          className="w-full p-2 text-xs bg-brand-bg dark:bg-dark-bg border border-brand-border rounded-lg text-brand-ink dark:text-dark-ink"
                          required
                        >
                          <option value="">-- Pilih Outlet --</option>
                          {outlets.map(o => <option key={o.id} value={o.id}>{o.nama_outlet}</option>)}
                        </select>
                      )}

                      {field.type === 'date' && (
                        <input 
                          type="date"
                          value={formData[field.name] ? new Date(formData[field.name]).toISOString().substring(0, 10) : ''}
                          onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                          className="w-full p-2 text-xs bg-brand-bg dark:bg-dark-bg border border-brand-border rounded-lg text-brand-ink dark:text-dark-ink"
                          required
                        />
                      )}

                      {field.type === 'number' && (
                        <input 
                          type="number"
                          value={formData[field.name] ?? 0}
                          onChange={(e) => setFormData({...formData, [field.name]: Number(e.target.value)})}
                          className="w-full p-2 text-xs bg-brand-bg dark:bg-dark-bg border border-brand-border rounded-lg text-brand-ink dark:text-dark-ink"
                          required
                        />
                      )}

                      {field.type === 'text' && (
                        <input 
                          type="text"
                          value={formData[field.name] || ''}
                          onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                          className="w-full p-2 text-xs bg-brand-bg dark:bg-dark-bg border border-brand-border rounded-lg text-brand-ink dark:text-dark-ink"
                          required
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-brand-border">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold border border-brand-border rounded-xl hover:bg-brand-bg"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-bold bg-brand-red text-white rounded-xl hover:bg-brand-red-dark flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Simpan</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
