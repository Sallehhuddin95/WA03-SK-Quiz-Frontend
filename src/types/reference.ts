export interface Subject {
  id: number;
  nama: string;
}

export interface Year {
  id: number;
  subject_id: number;
  nama: string;
}

export interface Topic {
  id: number;
  tahun_id: number;
  nama: string;
}
