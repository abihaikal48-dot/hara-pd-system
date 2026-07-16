'use client';

import React, { useState, useEffect } from 'react';
import { getEntities, addEntity, updateEntity, deleteEntity, getMasterData } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Plus, Edit2, Trash2, X, Loader2, Search, Users, MapPin } from 'lucide-react';

interface Kru {
  id: string;
  nama_kru: string;
  divisi: 'Kitchen' | 'Helper' | 'Geprek' | 'Kasir';
  outlet_id: string;
  tanggal_masuk: string;
  status_aktif: boolean;
  catatan: string;
  outlets?: { nama_outlet: string };
}

interface Outlet {
  id: string;
  nama_outlet: string;
}

export default function KruPage() {
  const { user } = useAuth();
  const [kruList, setKruList] = useState<Kru[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [search, setSearch] = useState('');
  const [filterDivisi, setFilterDivisi] = useState('');
  const [loading, setLoading] = useState(true);
  
  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nama_kru: '',
    divisi: 'Kitchen',
    outlet_id: '',
    tanggal_masuk: '',
    status_aktif: true,
    catatan: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const master = await getMasterData();
      setOutlets(master.outlets);
      const list = await getEntities('kru');
      setKruList(list as Kru[]);
    } catch (err) {
      alert('Gagal memuat data master kru');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (kru?: Kru) => {
    if (kru) {
      setEditId(kru.id);
      setFormData({
        nama_kru: kru.nama_kru,
        divisi: kru.divisi,
        outlet_id: kru.outlet_id,
        tanggal_masuk: kru.tanggal_masuk || '',
        status_aktif: kru.status_aktif,
        catatan: kru.catatan || ''
      });
    } else {
      setEditId(null);
      setFormData({
        nama_kru: '',
        divisi: 'Kitchen',
        outlet_id: outlets[0]?.id || '',
        tanggal_masuk: new Date().toISOString().substring(0, 10),
        status_aktif: true,
        catatan: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const actor = user?.email || 'system';
      if (editId) {
        await updateEntity('kru', editId, formData, actor);
      } else {
        await addEntity('kru', formData, actor);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      alert('Gagal menyimpan data: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus kru ini? Riwayat penilaian yang terkait akan terpengaruh.')) {
      try {
        await deleteEntity('kru', id, user?.email || 'system');
        loadData();
      } catch (err: any) {
        alert('Gagal menghapus: ' + err.message);
      }
    }
  };

  const filteredKru = kruList.filter(k => {
    const matchSearch = k.nama_kru.toLowerCase().includes(search.toLowerCase());
    const matchDivisi = filterDivisi ? k.divisi === filterDivisi : true;
    return matchSearch && matchDivisi;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-red" />
            <span>Master Kru</span>
          </h1>
          <p className="text-xs text-brand-muted dark:text-dark-muted mt-1">Kelola data keanggotaan dan tim kerja operasional.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-brand-red hover:bg-brand-red-dark text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kru</span>
        </button>
      </div>

      {/* Saringan & Pencarian */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-2">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-brand-muted pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama kru..."
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white dark:bg-dark-card border border-brand-border dark:border-dark-border rounded-xl focus:outline-none"
          />
        </div>
        <select 
          value={filterDivisi} 
          onChange={(e) => setFilterDivisi(e.target.value)}
          className="p-2.5 text-xs bg-white dark:bg-dark-card border border-brand-border dark:border-dark-border rounded-xl focus:outline-none"
        >
          <option value="">Semua Divisi</option>
          <option>Kitchen</option>
          <option>Helper</option>
          <option>Geprek</option>
          <option>Kasir</option>
        </select>
      </div>

      {/* Grid Kartu Kru */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-brand-muted" />
        </div>
      ) : filteredKru.length === 0 ? (
        <p className="text-xs text-brand-muted py-10 text-center">Tidak ada data kru ditemukan.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredKru.map((k) => (
            <div key={k.id} className="bg-white dark:bg-dark-card p-4 rounded-xl border border-brand-border dark:border-dark-border shadow-sm relative flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-4 flex flex-col items-end gap-1.5">
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${k.status_aktif ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-500' : 'bg-brand-red/10 text-brand-red'}`}>
                  {k.status_aktif ? 'Aktif' : 'Resign'}
                </span>
                <span className="text-[10px] font-bold text-brand-red-dark bg-brand-red/5 px-2 py-0.5 rounded-lg border border-brand-red/10">
                  {k.divisi}
                </span>
              </div>

              <div className="space-y-3 pr-16">
                <div>
                  <h3 className="font-extrabold text-sm text-brand-ink dark:text-dark-ink">{k.nama_kru}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-brand-muted dark:text-dark-muted mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{k.outlets?.nama_outlet || 'Tanpa Outlet'}</span>
                  </div>
                </div>
                
                <div className="pt-2 text-[11px] border-t border-brand-border dark:border-dark-border grid grid-cols-2 gap-1">
                  <div>
                    <span className="block text-[9px] text-brand-muted font-bold uppercase">Tanggal Gabung</span>
                    <span className="font-medium">{k.tanggal_masuk ? new Date(k.tanggal_masuk).toLocaleDateString('id-ID') : '-'}</span>
                  </div>
                </div>
                {k.catatan && (
                  <p className="text-[11px] text-brand-muted italic mt-1 line-clamp-2">"{k.catatan}"</p>
                )}
              </div>

              <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-brand-border dark:border-dark-border">
                <button 
                  onClick={() => handleOpenModal(k)}
                  className="p-2 rounded-lg bg-brand-bg dark:bg-dark-bg text-brand-muted hover:text-brand-ink transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => handleDelete(k.id)}
                  className="p-2 rounded-lg bg-brand-red/10 text-brand-red hover:bg-brand-red/20 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-dark-card rounded-2xl shadow-xl border border-brand-border overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-brand-border">
              <h2 className="text-sm font-extrabold">{editId ? 'Ubah Data Kru' : 'Tambah Data Kru'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg hover:bg-brand-bg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-brand-muted uppercase mb-1">Nama Lengkap Kru *</label>
                <input 
                  type="text" 
                  value={formData.nama_kru}
                  onChange={(e) => setFormData({...formData, nama_kru: e.target.value})}
                  placeholder="Haikal Kusuma"
                  className="w-full p-2.5 text-xs bg-brand-bg dark:bg-dark-bg border border-brand-border rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-brand-muted uppercase mb-1">Divisi Tugas *</label>
                  <select 
                    value={formData.divisi}
                    onChange={(e: any) => setFormData({...formData, divisi: e.target.value})}
                    className="w-full p-2.5 text-xs bg-brand-bg dark:bg-dark-bg border border-brand-border rounded-xl"
                  >
                    <option>Kitchen</option>
                    <option>Helper</option>
                    <option>Geprek</option>
                    <option>Kasir</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-brand-muted uppercase mb-1">Penugasan Outlet *</label>
                  <select 
                    value={formData.outlet_id}
                    onChange={(e) => setFormData({...formData, outlet_id: e.target.value})}
                    className="w-full p-2.5 text-xs bg-brand-bg dark:bg-dark-bg border border-brand-border rounded-xl"
                    required
                  >
                    {outlets.map(o => (
                      <option key={o.id} value={o.id}>{o.nama_outlet}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-brand-muted uppercase mb-1">Tanggal Masuk</label>
                  <input 
                    type="date" 
                    value={formData.tanggal_masuk}
                    onChange={(e) => setFormData({...formData, tanggal_masuk: e.target.value})}
                    className="w-full p-2.5 text-xs bg-brand-bg dark:bg-dark-bg border border-brand-border rounded-xl"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="status_aktif"
                      checked={formData.status_aktif}
                      onChange={(e) => setFormData({...formData, status_aktif: e.target.checked})}
                      className="rounded text-brand-red w-4 h-4"
                    />
                    <label htmlFor="status_aktif" className="text-xs font-bold">Status Aktif Bekerja</label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-brand-muted uppercase mb-1">Catatan Kinerja</label>
                <textarea 
                  value={formData.catatan}
                  onChange={(e) => setFormData({...formData, catatan: e.target.value})}
                  placeholder="Catatan tambahan mengenai perilaku atau kompetensi awal..."
                  className="w-full p-2.5 text-xs bg-brand-bg dark:bg-dark-bg border border-brand-border rounded-xl"
                  rows={2}
                />
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
