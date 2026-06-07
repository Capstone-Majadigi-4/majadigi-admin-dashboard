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
}

export interface Fasilitas {
  id: string;
  nama: string;
  kapasitas: number;
  harga_per_hari: number;
  deskripsi: string;
  foto_url?: string;
  is_active: boolean;
  tanggal_booked?: string[];
}

export type BookingStatus = 'menunggu' | 'disetujui' | 'ditolak';

export interface Booking {
  id: string;
  fasilitas_id: string;
  nama_fasilitas: string;
  user_nik: string;
  user_nama: string;
  nama_acara: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  estimasi_peserta: number;
  dokumen_url?: string;
  status: BookingStatus;
  catatan_admin?: string;
  created_at: string;
}
