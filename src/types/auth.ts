export interface User {
  id: string;
  nik: string;
  nama: string;
  no_hp?: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: User;
}
