export interface Komoditas {
  id: string;
  nama: string;
  kategori: string;
  satuan: string;
  ikon_url?: string;
  is_active: boolean;
  harga_rata_rata?: number;
  harga_terendah?: number;
  harga_tertinggi?: number;
  tanggal_harga?: string;
}

export interface HargaHarian {
  id: string;
  komoditas_id: string;
  nama_komoditas: string;
  satuan: string;
  pasar_id: string;
  nama_pasar: string;
  harga: number;
  tanggal: string;
}

export interface HargaHistori {
  tanggal: string;
  harga: number;
  nama_pasar: string;
}

export type PriceAlertTipe = 'naik_diatas' | 'turun_dibawah';

export interface PriceAlert {
  id: string;
  user_nik: string;
  komoditas_id: string;
  nama_komoditas: string;
  tipe: PriceAlertTipe;
  nominal: number;
  is_active: boolean;
  last_triggered_at?: string;
  created_at: string;
}

export interface TickerItem {
  komoditas_id: string;
  nama: string;
  harga_sekarang: number;
  harga_kemarin: number;
  perubahan_persen: number;
  arah: 'naik' | 'turun';
}

export interface Pasar {
  id: string;
  nama: string;
}

export interface Koperasi {
  id: string;
  nama: string;
  kota?: string;
}

export interface HargaKoperasi {
  id: string;
  komoditas_id: string;
  nama_komoditas?: string;
  koperasi_id: string;
  nama_koperasi?: string;
  harga: number;
  tanggal: string;
  input_oleh?: string;
  created_at?: string;
}
