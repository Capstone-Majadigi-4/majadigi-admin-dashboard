export interface Koridor {
  id: string;
  kode: string;
  nama: string;
  asal: string;
  tujuan: string;
  is_active: boolean;
}

export interface Halte {
  id: string;
  nama: string;
  lat: number;
  lng: number;
  koridor_ids: string[];
}

export interface Armada {
  id: string;
  nomor_kendaraan: string;
  koridor_id: string;
  nama_koridor: string;
  lat?: number;
  lng?: number;
  updated_at?: string;
  status: 'aktif' | 'nonaktif';
}

export type TiketStatus = 'valid' | 'digunakan' | 'expired';

export interface Tiket {
  id: string;
  user_nik: string;
  koridor_id: string;
  jumlah: number;
  total: number;
  status: TiketStatus;
  valid_sampai: string;
  created_at: string;
  koridor: {
    kode: string;
    nama: string;
  };
}
