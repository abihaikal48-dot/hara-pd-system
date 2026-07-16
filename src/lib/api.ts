import { supabase } from './supabaseClient';

// Helper Logging Aktivitas Otomatis
export async function logActivity(actorEmail: string, aksi: string, entitas: string, idData: string, detail: string) {
  await supabase.from('log_aktivitas').insert({
    actor_email: actorEmail,
    aksi,
    entitas,
    id_data: idData,
    detail
  });
}

// 1. Ambil Semua Data Master (Outlet & Kru)
export async function getMasterData() {
  const { data: outlets } = await supabase.from('outlets').select('*').order('nama_outlet');
  const { data: kru } = await supabase.from('kru').select('*, outlets(nama_outlet)').order('nama_kru');
  const { data: bankSop } = await supabase.from('bank_sop').select('*').eq('status_aktif', true).order('judul_sop');
  
  return {
    outlets: outlets || [],
    kru: kru || [],
    bankSop: bankSop || []
  };
}

// 2. Fungsi CRUD Generik dengan Dukungan Log Aktivitas
export async function getEntities(tableName: string, filters?: Record<string, any>) {
  let query = supabase.from(tableName).select('*');
  
  if (filters) {
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== '') {
        query = query.eq(key, filters[key]);
      }
    });
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function addEntity(tableName: string, payload: Record<string, any>, actorEmail: string) {
  const { data, error } = await supabase.from(tableName).insert(payload).select().single();
  if (error) throw error;
  
  await logActivity(actorEmail, 'CREATE', tableName, data.id, JSON.stringify(payload).substring(0, 300));
  return data;
}

export async function updateEntity(tableName: string, id: string, payload: Record<string, any>, actorEmail: string) {
  const { data, error } = await supabase.from(tableName).update(payload).eq('id', id).select().single();
  if (error) throw error;
  
  await logActivity(actorEmail, 'UPDATE', tableName, id, JSON.stringify(payload).substring(0, 300));
  return data;
}

export async function deleteEntity(tableName: string, id: string, actorEmail: string) {
  const { error } = await supabase.from(tableName).delete().eq('id', id);
  if (error) throw error;
  
  await logActivity(actorEmail, 'DELETE', tableName, id, 'Data berhasil dihapus permanen dari Supabase');
  return { ok: true };
}
