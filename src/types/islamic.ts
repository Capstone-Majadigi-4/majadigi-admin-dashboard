export type AcaraStatus = 'aktif' | 'selesai' | 'dibatalkan';

export interface Acara {
  id: string;
  judul: string;
  tanggal: string;
  waktu_mulai: string;
  waktu_selesai: string;
  lokasi: string;
  kuota_maksimal: number;
  kuota_terisi: number;
  deskripsi?: string;
  poster_url?: string;
  status: AcaraStatus;
  dibuat_oleh?: string | null;
  created_at?: string;
}

export interface Fasilitas {
  id: string;
  nama: string;
  kapasitas: number;
  harga_per_hari: string | number;
  deskripsi: string;
  foto_url?: string;
  is_active: boolean;
  tanggal_booked?: string[];
}

export type BookingStatus = 'pending_review' | 'disetujui' | 'ditolak';

export interface Booking {
  id: string;
  fasilitas_id: string;
  fasilitas?: Fasilitas;
  user_nik: string;
  nama_acara: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  estimasi_peserta: number;
  dokumen_url?: string;
  estimasi_biaya?: string | number;
  kode_bayar?: string;
  status: BookingStatus;
  catatan_admin?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  created_at?: string;
}
