export interface Dokter {
  id: string;
  nama: string;
  spesialis: string;
  foto_url: string | null;
  jam_mulai: string;
  jam_selesai: string;
  kuota_per_hari: number;
  jadwal: string[];
}

export interface Poli {
  id: string;
  nama: string;
  lantai?: string;
  dokter: Dokter[];
}

export type AntreanStatus = 'menunggu' | 'dipanggil' | 'selesai';

export interface Antrean {
  antrean_id: string;
  nomor_antrean: string;
  poli: string;
  poli_id: string;
  dokter: string;
  estimasi_jam: string;
  status: AntreanStatus;
  tanggal: string;
  pasien_nama: string;
  pasien_nik: string;
}

export interface Kamar {
  id: string;
  nama: string;
  kelas: string;
  kapasitas: number;
  terisi: number;
  tersedia: number;
}

export interface KamarResponse {
  total_kamar: number;
  tersedia: number;
  ruangan: Kamar[];
}

export interface RsudService {
  poli: Poli[];
  antrian: Antrean[];
  kamar: KamarResponse;
}
