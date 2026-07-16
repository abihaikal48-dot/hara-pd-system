'use client';

import React, { useState, useEffect } from 'react';
import { getEntities, addEntity, updateEntity, deleteEntity } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Plus, Edit2, Trash2, X, Loader2, Search, Building2 } from 'lucide-react';

interface Outlet {
  id: string;
  kode_outlet: string;
  nama_outlet: string;
  alamat: string;
  kepala_outlet: string;
  area_supervisor: string;
  status_aktif: boolean;
}

export default function OutletsPage() {
  const { user } = useAuth();
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    kode_outlet: '',
    nama_outlet: '',
    alamat: '',
    kepala_outlet: '',
    area_supervisor: '',
    status_aktif: true
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchOutlets = async () => {
    setLoading(true);
    try {
      const data = await getEntities('outlets');
      setOutlets(data as Outlet[]);
    } catch (err) {
      alert('Gagal mengambil data outlet');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutlets();
  }, []);

  const handleOpenModal = (outlet?: Outlet) => {
    if (outlet) {
      setEditId(outlet.id);
      setFormData({
        kode_outlet: outlet.kode_outlet,
        nama_outlet: outlet.nama_outlet,
        alamat: outlet.alamat || '',
        kepala_outlet: outlet.kepala_outlet || '',
        area_supervisor: outlet.area_supervisor || '',
        status_aktif: outlet.status_aktif
      });
    } else {
      setEditId(null);
      setFormData({
        kode_outlet: '',
        nama_outlet: '',
        alamat: '',
        kepala_outlet: '',
        area_supervisor: '',
        status_aktif: true
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
        await updateEntity('outlets', editId, formData, actor);
      } else {
        await addEntity('outlets', formData, actor);
      }
      setIsModalOpen(false);
      fetchOutlets();
    } catch (err: any) {
      alert('Gagal menyimpan data: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus outlet ini secara permanen? Data terkait dapat ikut terpengaruh.')) {
      try {
        await deleteEntity('outlets', id, user?.email || 'system');
        fetchOutlets();
      } catch (err: any) {
        alert('Gagal menghapus data: ' + err.message);
      }
    }
  };

  const filteredOutlets = outlets.filter(o => 
    o.nama_outlet.toLowerCase().includes(search.toLowerCase()) ||
    o.kode_outlet.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Aksi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand-red" />
            <span>Master Outlet</span>
          </h1>
          <p className="text-xs text-brand-muted dark:text-dark-muted mt-1">Daftar seluruh cakupan operasional outlet Hara Chicken.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-brand-red hover:bg-brand-red-dark text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Outlet</span>
        </button>
      </div>

      {/* Filter Pencarian */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-brand-muted pointer-events-none">
          <Search className="w-4 h-4" />
        </span>
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari kode atau nama outlet..."
          className="w-full pl-10 pr-4 py-2.5 text-xs bg-white dark:bg-dark-card border border-brand-border dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all"
        />
      </div>

      {/* Grid Kartu Responsif HP / Desktop */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-brand-muted" />
        </div>
      ) : filteredOutlets.length === 0 ? (
        <p className="text-xs text-brand-muted py-10 text-center">Tidak ada data outlet ditemukan.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOutlets.map((o) => (
            <div key={o.id} className="bg-white dark:bg-dark-card p-4 rounded-xl border border-brand-border dark:border-dark-border shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3">
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${o.status_aktif ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-500' : 'bg-brand-red/10 text-brand-red'}`}>
                  {o.status_aktif ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
              <div className="space-y-2 pr-12">
                <p className="text-[10px] font-bold text-brand-muted dark:text-dark-muted tracking-wider uppercase">{o.kode_outlet}</p>
                <h3 className="font-bold text-sm text-brand-ink dark:text-dark-ink leading-tight">{o.nama_outlet}</h3>
                <p className="text-xs text-brand-muted dark:text-dark-muted line-clamp-2">{o.alamat || 'Alamat belum diatur'}</p>
                <div className="pt-2 text-[11px] grid grid-cols-2 gap-2 border-t border-brand-border dark:border-dark-border">
                  <div>
                    <span className="block text-[9px] text-brand-muted dark:text-dark-muted font-bold uppercase">Kepala Outlet</span>
                    <span className="font-medium text-brand-ink dark:text-dark-ink">{o.kepala_outlet || '-'}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-brand-muted dark:text-dark-muted font-bold uppercase">Area Supervisor</span>
                    <span className="font-medium text-brand-ink dark:text-dark-ink">{o.area_supervisor || '-'}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-brand-border dark:border-dark-border">
                <button 
                  onClick={() => handleOpenModal(o)}
                  className="p-2 rounded-lg bg-brand-bg dark:bg-dark-bg text-brand-muted hover:text-brand-ink dark:hover:text-dark-ink transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => handleDelete(o.id)}
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
          <div className="w-full max-w-md bg-white dark:bg-dark-card rounded-2xl shadow-xl border border-brand-border dark:border-dark-border overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-brand-border dark:border-dark-border">
              <h2 className="text-sm font-extrabold">{editId ? 'Ubah Outlet' : 'Tambah Outlet'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg hover:bg-brand-bg dark:hover:bg-dark-bg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-brand-muted uppercase mb-1">Kode Outlet *</label>
                  <input 
                    type="text" 
                    value={formData.kode_outlet}
                    onChange={(e) => setFormData({...formData, kode_outlet: e.target.value.toUpperCase()})}
                    placeholder="HC-BTL01"
                    className="w-full p-2.5 text-xs bg-brand-bg dark:bg-dark-bg border border-brand-border dark:border-dark-border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-brand-muted uppercase mb-1">Nama Outlet *</label>
                  <input 
                    type="text" 
                    value={formData.nama_outlet}
                    onChange={(e) => setFormData({...formData, nama_outlet: e.target.value})}
                    placeholder="Bantul 01"
                    className="w-full p-2.5 text-xs bg-brand-bg dark:bg-dark-bg border border-brand-border dark:border-dark-border rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-brand-muted uppercase mb-1">Alamat</label>
                <textarea 
                  value={formData.alamat}
                  onChange={(e) => setFormData({...formData, alamat: e.target.value})}
                  placeholder="Isi alamat lengkap outlet..."
                  className="w-full p-2.5 text-xs bg-brand-bg dark:bg-dark-bg border border-brand-border dark:border-dark-border rounded-xl"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-brand-muted uppercase mb-1">Kepala Outlet</label>
                  <input 
                    type="text" 
                    value={formData.kepala_outlet}
                    onChange={(e) => setFormData({...formData, kepala_outlet: e.target.value})}
                    className="w-full p-2.5 text-xs bg-brand-bg dark:bg-dark-bg border border-brand-border dark:border-dark-border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-brand-muted uppercase mb-1">Area Supervisor</label>
                  <input 
                    type="text" 
                    value={formData.area_supervisor}
                    onChange={(e) => setFormData({...formData, area_supervisor: e.target.value})}
                    className="w-full p-2.5 text-xs bg-brand-bg dark:bg-dark-bg border border-brand-border dark:border-dark-border rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="status_aktif"
                  checked={formData.status_aktif}
                  onChange={(e) => setFormData({...formData, status_aktif: e.target.checked})}
                  className="rounded text-brand-red focus:ring-brand-red w-4 h-4"
                />
                <label htmlFor="status_aktif" className="text-xs font-bold text-brand-ink dark:text-dark-ink">Status Aktif Operasional</label>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-brand-border dark:border-dark-border">
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
