# Keperluan MVP SK Quiz: Matematik Tahun 6

Dokumen ini menyatakan keperluan MVP lengkap untuk frontend dan backend projek SK Quiz. Ia adalah kontrak antara arkitek, ejen dokumentasi, dan ejen pelaksana.

Semua teks UI, label, mesej ralat, dan kandungan antara muka dalam Bahasa Malaysia (bukan Bahasa Indonesia).

---

## Bahagian 1: Model Domain

### 1.1 Entiti dan Perhubungan

```
Subject (Mata Pelajaran)
  ├── 1:N → Tahun
  │         ├── 1:N → Topic (Topik)
  │         │         ├── 1:N → Question (Soalan)
  │         │         └── 1:N → QuizAttempt (Percubaan Kuiz)
  │         │                     └── 1:N → QuizAnswer (Jawapan)
```

### 1.2 Subject

Hanya satu subject untuk MVP: `Matematik`.

| Medan     | Jenis    | Contoh       |
| --------- | -------- | ------------ |
| id        | integer  | 1            |
| nama      | string   | "Matematik"  |

### 1.3 Tahun

Hanya satu tahun untuk MVP: `Tahun 6`.

| Medan      | Jenis    | Penerangan                      |
| ---------- | -------- | ------------------------------- |
| id         | integer  |                                 |
| subject_id | integer  | FK ke Subject                   |
| nama       | string   | "Tahun 6"                       |

### 1.4 Topic (Topik)

Tiga topik tetap untuk Matematik Tahun 6:

| ID | Nama Topik              |
| -- | ----------------------- |
| 1  | Nombor dan Operasi      |
| 2  | Ukuran dan Geometri     |
| 3  | Pengurusan Data         |

| Medan     | Jenis    | Penerangan         |
| --------- | -------- | ------------------ |
| id        | integer  |                    |
| tahun_id  | integer  | FK ke Tahun        |
| nama      | string   |                    |

### 1.5 Question (Soalan)

90 soalan keseluruhan: 3 topik × 3 tahap kesukaran × 10 soalan.

| Medan            | Jenis                       | Penerangan                                               |
| ---------------- | --------------------------- | -------------------------------------------------------- |
| id               | integer                     |                                                          |
| topic_id         | integer                     | FK ke Topic                                              |
| jenis_soalan     | enum                        | Lihat 1.6                                                |
| tahap_kesukaran  | enum                        | `mudah`, `sederhana`, `sukar`                             |
| status           | enum                        | `aktif`, `tidak_aktif` (default: `aktif`)                |
| teks_soalan      | text                        | Teks soalan dalam Bahasa Malaysia                        |
| pilihan          | JSONB (nullable)            | Untuk aneka pilihan sahaja                                |
| jawapan_betul    | JSONB                       | Jawapan atau jawapan yang diterima (lihat 1.6)             |
| created_at       | timestamp with timezone     |                                                          |
| updated_at       | timestamp with timezone     |                                                          |

Peraturan unik: tiada soalan dengan `topic_id`, `jenis_soalan`, `tahap_kesukaran` yang sama boleh melebihi 10 yang berstatus `aktif`.

### 1.6 Jenis Soalan dan Struktur Jawapan

#### Aneka Pilihan

- `jenis_soalan`: `aneka_pilihan`
- `pilihan`: `{"A": "teks pilihan A", "B": "teks pilihan B", "C": "teks pilihan C", "D": "teks pilihan D"}`
- `jawapan_betul`: `{"pilihan": "A"}` (satu huruf: A, B, C, atau D)
- Penilaian: padanan tepat huruf pilihan

#### Isi Tempat Kosong

- `jenis_soalan`: `isi_tempat_kosong`
- `pilihan`: null (tidak digunakan)
- `jawapan_betul`: `{"jawapan_diterima": ["45", "45.0", "empat puluh lima"]}`
- `teks_soalan` mesti mengandungi penanda `______` menunjukkan tempat kosong
- Penilaian: jawapan murid ditrim whitespace, ditukar ke huruf kecil, dibandingkan dengan setiap entri `jawapan_diterima` (juga ditrim dan huruf kecil)
- Padanan pada mana-mana satu entri dikira betul

#### Betul / Salah

- `jenis_soalan`: `betul_salah`
- `pilihan`: null (tidak digunakan)
- `jawapan_betul`: `{"nilai": true}` atau `{"nilai": false}`
- Penilaian: padanan boolean tepat

#### Padanan

- `jenis_soalan`: `padanan`
- `pilihan`: null (tidak digunakan)
- `jawapan_betul`: `{"pasangan": [{"kiri": "A", "kanan": "X"}, {"kiri": "B", "kanan": "Y"}]}`
- Penilaian: strict all-or-nothing, setiap pasangan mesti tepat, tertib pasangan tidak mempengaruhi penilaian (set comparison)

### 1.7 QuizAttempt (Percubaan Kuiz)

| Medan            | Jenis                       | Penerangan                                    |
| ---------------- | --------------------------- | --------------------------------------------- |
| id               | integer                     |                                               |
| topic_id         | integer                     | FK ke Topic                                   |
| tahap_kesukaran  | enum                        | `mudah`, `sederhana`, `sukar`                  |
| nama_peserta     | string                      | Nama murid (teks bebas, 1-50 aksara)           |
| status           | enum                        | `dalam_progres`, `selesai`                     |
| skor             | integer (nullable)          | Bilangan jawapan betul (dikira semasa submit)   |
| jumlah_soalan    | integer                     | Sentiasa 10                                    |
| masa_mula        | timestamp with timezone     |                                               |
| masa_hantar      | timestamp with timezone     | null sehingga submit                           |
| created_at       | timestamp with timezone     |                                               |
| updated_at       | timestamp with timezone     |                                               |

### 1.8 QuizAnswer (Jawapan Kuiz)

| Medan            | Jenis                       | Penerangan                                    |
| ---------------- | --------------------------- | --------------------------------------------- |
| id               | integer                     |                                               |
| quiz_attempt_id  | integer                     | FK ke QuizAttempt                             |
| question_id      | integer                     | FK ke Question                                |
| data_jawapan     | JSONB                       | Data jawapan murid (lihat 1.9)                 |
| adalah_betul     | boolean (nullable)          | null sehingga submit, dikira semasa submit    |
| created_at       | timestamp with timezone     |                                               |
| updated_at       | timestamp with timezone     |                                               |

### 1.9 Struktur `data_jawapan` Mengikut Jenis Soalan

| Jenis Soalan       | Bentuk `data_jawapan`                                        |
| ------------------ | ------------------------------------------------------------ |
| aneka_pilihan     | `{"pilihan": "A"}`                                           |
| isi_tempat_kosong  | `{"teks": "45"}`                                             |
| betul_salah       | `{"nilai": true}`                                            |
| padanan           | `{"pasangan": [{"kiri": "A", "kanan": "X"}, {"kiri": "B", "kanan": "Y"}]}` |

---

## Bahagian 2: Peranan dan Pengesahan MVP

### 2.1 Peranan

| Peranan | Penerangan                      | Capaian                            |
| ------- | ------------------------------- | ---------------------------------- |
| Admin   | Guru yang mengurus bank soalan  | Semua laluan `/admin/*`            |
| Murid   | Pelajar yang menjawab kuiz      | Semua laluan `/murid/*`            |

### 2.2 Pengesahan MVP

- Login MVP: pemilih peranan ringkas di landing page (`/`).
- Tiada kata laluan atau pendaftaran pengguna.
- Peranan disimpan dalam state klien sahaja (contoh: localStorage atau React Context).
- Tiada sesi pelayan diuruskan untuk MVP (ADR-0003 menetapkan sesi pelayan untuk pengesahan sebenar; MVP menggunakan model ringkas kerana tiada data sensitif peribadi).
- Laluan `/admin/*` dan `/murid/*` menyemak peranan di peringkat klien dan `middleware.ts` Next.js (redirect ke `/` jika tiada peranan dipilih).

---

## Bahagian 3: Keperluan Frontend

### Prinsip Umum Semua Laluan

- Semua komponen menggunakan Server Components (RSC) sebagai default; Client Components hanya untuk permukaan interaktif.
- Data fetching melalui TanStack Query (`useQuery`, `useMutation`).
- Semua respons API dibalut dalam `ApiEnvelope<T>`:
  ```ts
  interface ApiEnvelope<T> {
    data: T;
  }
  ```
- Respons ralat dibalut dalam `ApiError`:
  ```ts
  interface ApiError {
    mesej: string;
    kod: string;
    butiran?: Record<string, string[]>;
  }
  ```
- Semua borang divalidasi dengan Zod di klien sebelum serahan rangkaian.

### Laluan 1: `/` (Landing Page)

**Apa yang pengguna lihat dan lakukan:**
- Tajuk aplikasi: "SK Quiz: Matematik Tahun 6"
- Dua butang besar: "Saya Guru" (Admin) dan "Saya Murid"
- Klik butang memilih peranan, simpan ke localStorage/Context, navigasi ke `/admin/` atau `/murid/`

**Keadaan:**
- Loading: Tiada (halaman statik)
- Empty: Tidak berkaitan
- Error: Tidak berkaitan
- Edge: Jika pengguna sudah memilih peranan (semak localStorage), paparkan mesej "Anda telah memilih sebagai [peranan]. Adakah anda mahu tukar?" dengan pilihan "Teruskan" dan "Tukar Peranan"

**Panggilan API:** Tiada

**Validasi:** Tiada input pengguna

**Interaksi utama:**
- Klik butang peranan → simpan peranan → navigasi

### Laluan 2: `/admin/` (Dashboard Admin)

**Apa yang pengguna lihat dan lakukan:**
- Navigasi ke sub-halaman: Bank Soalan, Prestasi Murid
- Kad ringkasan statistik:
  - Jumlah soalan keseluruhan
  - Jumlah soalan aktif
  - Jumlah percubaan kuiz
  - Purata skor (jika ada percubaan)
- Pautan cepat: "Tambah Soalan Baru"

**Keadaan:**
- Loading: Skeleton kad statistik (4 segi empat tepat)
- Empty: Kad statistik menunjukkan "0" (bukan mesej kosong)
- Error: Mesej "Gagal memuatkan statistik. Sila cuba lagi." dengan butang cuba semula
- Edge: Jika tiada soalan langsung, paparan statistik masih muncul (semua 0)

**Panggilan API:**
- `GET /api/v1/questions?status=aktif&page=1&page_size=1` (hanya untuk kiraan)
- `GET /api/v1/quiz-attempts?page=1&page_size=1` (hanya untuk kiraan)
- Atau endpoint agregasi berasingan jika disediakan (untuk MVP, guna query parameters untuk dapatkan kiraan dari header/total)

**Validasi:** Tiada input pengguna

**Interaksi utama:**
- Klik navigasi sub-halaman
- Klik "Tambah Soalan Baru" → `/admin/bank-soalan/baru/`

### Laluan 3: `/admin/bank-soalan/` (Senarai Soalan)

**Apa yang pengguna lihat dan lakukan:**
- Jadual senarai soalan dengan lajur: No., Teks Soalan (dipendekkan), Topik, Tahap, Jenis, Status, Tindakan
- Baris penapis di atas jadual:
  - Dropdown Topik (dengan pilihan "Semua Topik")
  - Dropdown Tahap Kesukaran ("Semua", "Mudah", "Sederhana", "Sukar")
  - Dropdown Jenis Soalan ("Semua", "Aneka Pilihan", "Isi Tempat Kosong", "Betul/Salah", "Padanan")
  - Dropdown Status ("Semua", "Aktif", "Tidak Aktif")
- Paginasi di bawah jadual (10 soalan per halaman)
- Butang "Tambah Soalan" di atas jadual
- Lajur Tindakan: Butang "Edit", Butang togol status (Aktifkan/Nyahaktifkan), Butang "Padam" dengan dialog pengesahan

**Keadaan:**
- Loading: Skeleton baris jadual (5 baris)
- Empty: Mesej "Tiada soalan ditemui." dengan ilustrasi dan butang "Tambah Soalan Pertama"
  - Jika penapis aktif dan tiada hasil: "Tiada soalan sepadan dengan penapis. Cuba tukar penapis."
- Error: Mesej "Gagal memuatkan senarai soalan." dengan butang cuba semula
- Edge Cases:
  - Penukaran penapis mereset halaman ke 1
  - Apabila memadam soalan terakhir pada halaman terakhir, kembali ke halaman sebelumnya
  - Status soalan "tidak_aktif": soalan tidak akan dipilih untuk kuiz baru tetapi masih boleh diedit
  - Dialog pengesahan padam: "Adakah anda pasti mahu memadam soalan ini? Tindakan ini tidak boleh dibatalkan."

**Panggilan API:**
- `GET /api/v1/questions?topic_id=X&difficulty=Y&question_type=Z&status=S&page=N&page_size=10`
- `PATCH /api/v1/questions/{id}/status` (untuk togol aktif/tidak aktif)
- `DELETE /api/v1/questions/{id}` (untuk padam)

**Validasi:** Tiada input pengguna selain parameter query

**Interaksi utama:**
- Menukar penapis → query semula dengan parameter baru
- Klik "Tambah Soalan" → `/admin/bank-soalan/baru/`
- Klik "Edit" → `/admin/bank-soalan/{id}/edit/`
- Klik togol status → PATCH request, kemas kini baris secara optimistik
- Klik "Padam" → dialog pengesahan → DELETE request → keluarkan baris dari jadual

### Laluan 4: `/admin/bank-soalan/baru/` (Tambah Soalan Baharu)

**Apa yang pengguna lihat dan lakukan:**
- Borang cipta soalan dengan medan:
  1. Pilih Topik (dropdown, wajib)
  2. Pilih Tahap Kesukaran (dropdown: Mudah, Sederhana, Sukar, wajib)
  3. Pilih Jenis Soalan (radio/butang pilihan: Aneka Pilihan, Isi Tempat Kosong, Betul/Salah, Padanan, wajib)
  4. Teks Soalan (textarea, wajib, 5-500 aksara)
  5. Medan spesifik jenis (berubah berdasarkan pilihan di langkah 3):
     - Aneka Pilihan: 4 input teks untuk pilihan A, B, C, D (semua wajib) + dropdown jawapan betul (A/B/C/D, wajib)
     - Isi Tempat Kosong: input untuk jawapan diterima (boleh tambah banyak, minimum 1, maksimum 10) + butang "Tambah Jawapan". Setiap jawapan 1-100 aksara.
     - Betul/Salah: radio pilihan "Betul" dan "Salah" (wajib)
     - Padanan: 2 hingga 6 pasangan. Setiap pasangan: input "Kiri" dan input "Kanan" (kedua-dua wajib). Butang "Tambah Pasangan" dan butang "Buang" setiap pasangan.
  6. Status: radio "Aktif" dan "Tidak Aktif" (default: Aktif)
- Butang "Simpan Soalan" dan "Batal"
- Navigasi kembali: "← Kembali ke Bank Soalan"

**Keadaan:**
- Loading: Butang "Simpan Soalan" dilumpuhkan dengan spinner semasa serahan
- Empty: Tidak berkaitan (borang kosong adalah keadaan default)
- Error:
  - Ralat rangkaian: mesej "Gagal menyimpan soalan. Sila cuba lagi." di bawah butang simpan
  - Ralat validasi pelayan: paparkan di sebelah medan berkaitan
  - Ralat had soalan: "Setiap kombinasi Topik, Tahap, dan Jenis hanya boleh mempunyai 10 soalan aktif. Sila nyahaktifkan soalan sedia ada atau ubah kombinasi."
- Edge Cases:
  - Apabila jenis soalan ditukar, medan spesifik jenis sebelumnya dikosongkan
  - Butang "Batal" memaparkan dialog "Adakah anda pasti mahu batalkan? Data yang diisi akan hilang." jika borang telah diisi (dirty state)
  - Untuk isi tempat kosong: `teks_soalan` mesti mengandungi sekurang-kurangnya satu `______`. Validasi di peringkat Zod sebelum hantar.
  - Untuk padanan: minimum 2 pasangan, maksimum 6 pasangan. Setiap pasangan mesti unik (tiada duplikasi `kiri` atau `kanan`).

**Panggilan API:**
- `GET /api/v1/subjects` (untuk dapatkan senarai subject, walaupun hanya satu untuk MVP)
- `GET /api/v1/subjects/{id}/tahun` (untuk dapatkan tahun)
- `GET /api/v1/tahun/{id}/topics` (untuk dapatkan senarai topik)
- `POST /api/v1/questions`

**Validasi:**
- Skema Zod klien:
  - `topic_id`: integer positif
  - `tahap_kesukaran`: enum `["mudah", "sederhana", "sukar"]`
  - `jenis_soalan`: enum `["aneka_pilihan", "isi_tempat_kosong", "betul_salah", "padanan"]`
  - `teks_soalan`: string, 5-500 aksara, tidak hanya whitespace
  - Validasi spesifik jenis (lihat 1.6)
  - `status`: enum `["aktif", "tidak_aktif"]` (default: "aktif")

**Interaksi utama:**
- Pilih jenis soalan → medan spesifik jenis muncul
- Klik "Simpan Soalan" → validasi klien → POST → redirect ke `/admin/bank-soalan/` dengan mesej kejayaan
- Klik "Batal" → dialog pengesahan jika dirty → redirect ke `/admin/bank-soalan/`

### Laluan 5: `/admin/bank-soalan/{id}/edit/` (Edit Soalan)

**Apa yang pengguna lihat dan lakukan:**
- Sama seperti borang cipta soalan, tetapi pra-isi dengan data sedia ada
- Tajuk halaman: "Edit Soalan"
- Jenis soalan tidak boleh ditukar (dilumpuhkan/sebab pilihan jenis akan mengubah struktur data yang tidak serasi)
- Semua medan lain boleh diedit
- Navigasi kembali: "← Kembali ke Bank Soalan"

**Keadaan:**
- Loading: Skeleton borang semasa memuatkan data soalan
- Empty: Tidak berkaitan (laluan tidak sah jika ID tidak wujud)
- Error:
  - Soalan tidak dijumpai (404): mesej "Soalan tidak dijumpai." dengan butang "Kembali ke Bank Soalan"
  - Ralat rangkaian: mesej "Gagal memuatkan soalan." dengan butang cuba semula
  - Ralat semasa menyimpan: sama seperti laluan cipta
- Edge Cases:
  - Status 409 Conflict jika kombinasi topik+tahap+jenis sudah mencapai had 10 aktif
  - Dirty state tracking: dialog pengesahan jika pengguna cuba meninggalkan halaman dengan perubahan belum disimpan
  - Menukar topik/tahap/status boleh menyebabkan had soalan dilanggar jika sudah ada 10 aktif untuk kombinasi baru

**Panggilan API:**
- `GET /api/v1/questions/{id}`
- `GET /api/v1/subjects`
- `GET /api/v1/subjects/{id}/tahun`
- `GET /api/v1/tahun/{id}/topics`
- `PUT /api/v1/questions/{id}`

**Validasi:**
- Skema yang sama seperti cipta, kecuali `jenis_soalan` dibaca sahaja (tidak boleh ditukar oleh klien)

**Interaksi utama:**
- Muat data → pra-isi borang
- Klik "Simpan Perubahan" → validasi klien → PUT → redirect ke `/admin/bank-soalan/` dengan mesej kejayaan
- Klik "Batal" → dialog pengesahan jika dirty → redirect ke `/admin/bank-soalan/`

### Laluan 6: `/admin/prestasi/` (Prestasi Murid)

**Apa yang pengguna lihat dan lakukan:**
- Penapis: Dropdown Topik ("Semua Topik"), Dropdown Tahap ("Semua Tahap")
- Jadual senarai percubaan kuiz dengan lajur:
  - Nama Murid
  - Topik
  - Tahap
  - Skor (contoh: "7/10")
  - Peratus (70%)
  - Tarikh (masa_hantar)
  - Tindakan: Butang "Lihat" (buka dialog/perincian keputusan)
- Isih default: Tarikh paling baharu dahulu
- Paginasi: 20 percubaan per halaman

**Keadaan:**
- Loading: Skeleton jadual (5 baris)
- Empty: Mesej "Belum ada percubaan kuiz." dengan ilustrasi
  - Jika penapis aktif dan tiada hasil: "Tiada percubaan sepadan dengan penapis."
- Error: Mesej "Gagal memuatkan prestasi." dengan butang cuba semula
- Edge Cases:
  - Skor null jika percubaan belum dihantar (status `dalam_progres`) - jangan paparkan dalam jadual ini. Tapis hanya status `selesai`.

**Panggilan API:**
- `GET /api/v1/quiz-attempts?status=selesai&topic_id=X&difficulty=Y&page=N&page_size=20`
- `GET /api/v1/quiz-attempts/{id}/result` (apabila klik "Lihat")

**Validasi:** Tiada input pengguna selain parameter query

**Interaksi utama:**
- Menukar penapis → query semula
- Klik "Lihat" → dialog atau drawers yang memaparkan perincian keputusan (skor, setiap soalan dengan jawapan murid vs jawapan betul)
- Paginasi → muat halaman seterusnya/sebelumnya

### Laluan 7: `/murid/` (Dashboard Murid)

**Apa yang pengguna lihat dan lakukan:**
- Tajuk: "Selamat Datang ke Kuiz Matematik"
- Kad pemilihan kuiz mengandungi:
  - Input teks: "Nama Kamu" (wajib, 1-50 aksara)
  - Dropdown: "Pilih Topik" (3 pilihan topik)
  - Dropdown: "Pilih Tahap" (Mudah, Sederhana, Sukar)
  - Butang besar: "Mula Kuiz!"
- Pautan: "Lihat Sejarah Kuiz" → `/murid/sejarah/`
- Navigasi: "← Tukar Peranan" (kembali ke landing page, kosongkan peranan)

**Keadaan:**
- Loading: Butang "Mula Kuiz!" dilumpuhkan dengan spinner semasa mencipta percubaan
- Empty: Tidak berkaitan (halaman interaktif)
- Error:
  - Nama kosong: mesej "Sila isi nama anda." di bawah input nama
  - Topik/tahap tidak dipilih: mesej di bawah dropdown berkaitan
  - Ralat semasa mencipta percubaan: "Gagal memulakan kuiz. Sila cuba lagi."
  - Tiada soalan tersedia untuk kombinasi dipilih: "Maaf, tiada soalan tersedia untuk Topik dan Tahap ini. Sila cuba kombinasi lain."
- Edge Cases:
  - Jika murid sudah mempunyai percubaan `dalam_progres` untuk kombinasi sama, paparkan pilihan: "Anda mempunyai kuiz yang belum diselesaikan. Sambung?" dengan butang "Sambung" (navigasi ke `/murid/kuiz/{id}/`) dan "Mula Baru" (buang percubaan lama)
  - Input nama diingati dalam localStorage untuk kemudahan (pre-fill pada lawatan seterusnya)

**Panggilan API:**
- `GET /api/v1/subjects`
- `GET /api/v1/subjects/{id}/tahun`
- `GET /api/v1/tahun/{id}/topics`
- `POST /api/v1/quiz-attempts`

**Validasi:**
- Skema Zod klien:
  - `nama_peserta`: string, 1-50 aksara, trim whitespace, tidak hanya whitespace
  - `topic_id`: integer positif
  - `tahap_kesukaran`: enum `["mudah", "sederhana", "sukar"]`

**Interaksi utama:**
- Isi nama, pilih topik, pilih tahap → klik "Mula Kuiz!" → POST /api/v1/quiz-attempts → navigasi ke `/murid/kuiz/{id}/`
- Klik "Lihat Sejarah Kuiz" → `/murid/sejarah/`

### Laluan 8: `/murid/kuiz/{attemptId}/` (Pemain Kuiz)

**Apa yang pengguna lihat dan lakukan:**
- Panel kiri: Senarai 10 soalan (NavigationPanel)
  - Setiap item menunjukkan: nombor soalan, jenis soalan (ikon), status (dijawab/belum dijawab/ditanda)
  - Klik item menavigasi ke soalan tersebut dalam panel kanan
  - Boleh bebas ulang-alik antara soalan
- Panel kanan: Soalan semasa (QuestionDisplay)
  - Teks soalan penuh
  - Kawalan jawapan spesifik jenis:
    - Aneka Pilihan: 4 butang radio besar (A, B, C, D) dengan teks pilihan
    - Isi Tempat Kosong: Input teks dengan placeholder "Taip jawapan anda..."
    - Betul/Salah: Dua butang besar "Betul" dan "Salah"
    - Padanan: Senarai item kiri dengan dropdown pemilih kanan untuk setiap satu. Atau antaramuka drag-and-drop ringkas.
  - Butang "Sebelumnya" dan "Seterusnya" di bawah soalan (tidak perlu untuk soalan pertama/terakhir)
- Bar atas: Tajuk kuiz (Topik - Tahap), nama murid, pemasa (pilihan, abaikan untuk MVP)
- Butang "Hantar Semua Jawapan" di bahagian bawah panel kiri atau bar atas
- Apabila klik "Hantar Semua Jawapan":
  - Dialog pengesahan pertama: kira soalan belum dijawab, papar "Anda belum menjawab X soalan. Hantar juga?" dengan butang "Hantar Juga" dan "Kembali"
  - Dialog pengesahan kedua: "Adakah anda pasti mahu menghantar jawapan? Tindakan ini tidak boleh dibatalkan."
  - Semasa menghantar: modal/paparan loading "Menghantar jawapan..."
  - Selepas berjaya: paparan keputusan (skor, perincian setiap soalan)

**Keadaan:**
- Loading: Skeleton paparan kuiz (panel kiri skeleton 10 item, panel kanan skeleton soalan)
- Empty: Tidak berkaitan (10 soalan sentiasa dipilih)
- Error:
  - Percubaan tidak dijumpai (404): "Kuiz tidak dijumpai." dengan butang "Kembali ke Dashboard"
  - Percubaan sudah selesai (status `selesai`): navigasi automatik ke paparan keputusan, atau paparan "Kuiz ini sudah dihantar."
  - Ralat rangkaian semasa muat soalan: "Gagal memuatkan soalan kuiz." dengan butang cuba semula
  - Ralat semasa menghantar: "Gagal menghantar jawapan. Sila cuba lagi. Jawapan anda masih disimpan."
- Edge Cases:
  - Navigasi pelayar (back/forward): state jawapan klien mungkin hilang. Simpan jawapan dalam sessionStorage sebagai sandaran.
  - Semua soalan dijawab: butang hantar masih memerlukan pengesahan
  - Tiada soalan dijawab langsung (0/10): butang hantar masih dibenarkan, skor akan jadi 0
  - Isi tempat kosong: whitespace sahaja dikira sebagai tidak dijawab
  - Padanan: semua dropdown mesti dipilih baru dikira sebagai dijawab
  - Percubaan `dalam_progres` lama: jika `masa_mula` melebihi 24 jam, paparkan amaran "Kuiz ini dimulakan lebih 24 jam lalu."

**Panggilan API:**
- `GET /api/v1/quiz-attempts/{id}/result` (atau endpoint berasingan untuk dapatkan soalan + status percubaan)
  - Nota: Untuk MVP, mungkin perlu endpoint berasingan `GET /api/v1/quiz-attempts/{id}` untuk dapatkan metadata percubaan + senarai soalan
- `POST /api/v1/quiz-attempts/{id}/submit`

**Validasi:**
- Tiada validasi borang klien (semua jawapan adalah sah dalam bentuknya)
- Semakan klien untuk dialog peringatan soalan belum dijawab:
  - Aneka Pilihan: tiada pilihan dipilih
  - Isi Tempat Kosong: input kosong atau whitespace sahaja
  - Betul/Salah: tiada pilihan
  - Padanan: tidak semua pasangan dipilih

**Interaksi utama:**
- Klik nombor soalan → papar soalan tersebut
- Jawab soalan → kemas kini state jawapan klien
- Klik "Seterusnya" → navigasi ke soalan seterusnya (jika bukan soalan terakhir)
- Klik "Sebelumnya" → navigasi ke soalan sebelumnya (jika bukan soalan pertama)
- Klik "Hantar Semua Jawapan" → dialog peringatan → dialog pengesahan → POST submit → paparan keputusan

### Laluan 9: `/murid/sejarah/` (Sejarah Percubaan)

**Apa yang pengguna lihat dan lakukan:**
- Tajuk: "Sejarah Kuiz Saya"
- Input carian nama (default: diingati dari localStorage)
- Senarai kad percubaan lepas, setiap satu menunjukkan:
  - Topik dan Tahap
  - Tarikh (masa_hantar)
  - Skor (contoh: "7/10 - 70%")
  - Butang "Lihat Butiran" → kembang/dialog dengan perincian setiap soalan
- Isih: Tarikh paling baharu dahulu
- Maksimum paparan: 50 percubaan terkini (untuk MVP)
- Navigasi: "← Kembali ke Dashboard" → `/murid/`

**Keadaan:**
- Loading: Skeleton kad (3 kad)
- Empty: Mesej "Anda belum mempunyai sejarah kuiz." dengan butang "Mula Kuiz Pertama" → `/murid/`
  - Jika nama carian tidak sepadan: "Tiada sejarah untuk nama '[nama]'. Cuba nama lain atau mula kuiz baru."
- Error: Mesej "Gagal memuatkan sejarah kuiz." dengan butang cuba semula
- Edge Cases:
  - Percubaan `dalam_progres`: paparkan dengan label "Belum Selesai" dan butang "Sambung" (navigasi ke `/murid/kuiz/{id}/`)
  - Carian nama kosong: query tanpa parameter `participant_name`, kembalikan semua percubaan (atau kosong untuk MVP)
  - Nama carian berbeza dari nama tersimpan: pengguna boleh mencari nama murid lain

**Panggilan API:**
- `GET /api/v1/quiz-attempts?participant_name=X&page=1&page_size=50`
- `GET /api/v1/quiz-attempts/{id}/result` (apabila klik "Lihat Butiran")

**Validasi:**
- `participant_name`: string, pilihan, trim whitespace

**Interaksi utama:**
- Input nama → query carian (debounce 500ms atau tekan Enter)
- Klik "Lihat Butiran" → muat keputusan → papar perincian (expand/dialog)
- Klik "Sambung" → navigasi ke kuiz yang belum selesai

---

## Bahagian 4: Keperluan Backend

### Prinsip Umum Semua Endpoint

- Semua respons berjaya: `{ "data": ... }`
- Semua respons ralat:
  ```json
  {
    "detail": {
      "mesej": "Penerangan ralat dalam Bahasa Malaysia",
      "kod": "KOD_RALAT",
      "butiran": { "field_name": ["ralat 1", "ralat 2"] }
    }
  }
  ```
  Nota: FastAPI menggunakan `detail` sebagai kunci default. Untuk konsistensi, gunakan struktur di atas dalam `detail`.
- Semua masa dalam ISO 8601 dengan timezone (`2026-08-09T14:30:00+08:00`)
- Semua endpoint menggunakan prefix `/api/v1/`
- Semua ID dalam respons adalah integer
- Semua respons senarai termasuk metadata paginasi:
  ```json
  {
    "data": [...],
    "meta": {
      "page": 1,
      "page_size": 10,
      "total_items": 90,
      "total_pages": 9
    }
  }
  ```

### 4.1 Struktur Fail Backend

Mengikut ADR-0002 (layered FastAPI):

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── subjects.py
│   │       ├── tahun.py
│   │       ├── topics.py
│   │       ├── questions.py
│   │       └── quiz_attempts.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── subject.py
│   │   ├── tahun.py
│   │   ├── topic.py
│   │   ├── question.py
│   │   ├── quiz_attempt.py
│   │   └── quiz_answer.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── subject.py
│   │   ├── tahun.py
│   │   ├── topic.py
│   │   ├── question.py
│   │   └── quiz_attempt.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── subject.py
│   │   ├── topic.py
│   │   ├── question.py
│   │   └── quiz_attempt.py
│   ├── repositories/
│   │   ├── __init__.py
│   │   ├── subject.py
│   │   ├── topic.py
│   │   ├── question.py
│   │   └── quiz_attempt.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── database.py
│   │   └── exceptions.py
│   └── main.py
├── alembic/
├── tests/
└── pyproject.toml
```

### 4.2 Endpoint 1: GET /api/v1/subjects

**Penerangan:** Dapatkan senarai semua mata pelajaran.

**Query Parameters:** Tiada

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "nama": "Matematik"
    }
  ]
}
```

**Peraturan perniagaan:**
- Untuk MVP hanya ada 1 subject (Matematik). Data statik/seeded.

**Senario ralat:** Tiada.

**Operasi pangkalan data:** `SELECT id, nama FROM subjects ORDER BY id`

---

### 4.3 Endpoint 2: GET /api/v1/subjects/{id}/tahun

**Penerangan:** Dapatkan senarai tahun untuk sesuatu mata pelajaran.

**Path Parameters:**
- `id` (integer): Subject ID

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "subject_id": 1,
      "nama": "Tahun 6"
    }
  ]
}
```

**Peraturan perniagaan:**
- Untuk MVP hanya ada Tahun 6.

**Senario ralat:**
- 404: Subject tidak dijumpai (`{"detail": {"mesej": "Mata pelajaran tidak dijumpai.", "kod": "SUMBER_TIDAK_DIJUMPAI"}}`)

**Operasi pangkalan data:**
1. `SELECT id FROM subjects WHERE id = {id}` → jika tiada, kembalikan 404
2. `SELECT id, subject_id, nama FROM tahun WHERE subject_id = {id} ORDER BY id`

---

### 4.4 Endpoint 3: GET /api/v1/tahun/{id}/topics

**Penerangan:** Dapatkan senarai topik untuk sesuatu tahun.

**Path Parameters:**
- `id` (integer): Tahun ID

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "tahun_id": 1,
      "nama": "Nombor dan Operasi"
    },
    {
      "id": 2,
      "tahun_id": 1,
      "nama": "Ukuran dan Geometri"
    },
    {
      "id": 3,
      "tahun_id": 1,
      "nama": "Pengurusan Data"
    }
  ]
}
```

**Peraturan perniagaan:**
- Tiga topik tetap.

**Senario ralat:**
- 404: Tahun tidak dijumpai (`{"detail": {"mesej": "Tahun tidak dijumpai.", "kod": "SUMBER_TIDAK_DIJUMPAI"}}`)

**Operasi pangkalan data:**
1. `SELECT id FROM tahun WHERE id = {id}` → jika tiada, kembalikan 404
2. `SELECT id, tahun_id, nama FROM topics WHERE tahun_id = {id} ORDER BY id`

---

### 4.5 Endpoint 4: GET /api/v1/questions

**Penerangan:** Dapatkan senarai soalan dengan penapisan dan paginasi.

**Query Parameters:**

| Parameter       | Jenis   | Wajib | Default          | Keterangan                                        |
| --------------- | ------- | ----- | ---------------- | ------------------------------------------------- |
| topic_id        | integer | Tidak | null             | Tapis mengikut topik                              |
| difficulty      | string  | Tidak | null             | `mudah`, `sederhana`, `sukar`                      |
| question_type   | string  | Tidak | null             | `aneka_pilihan`, `isi_tempat_kosong`, `betul_salah`, `padanan` |
| status          | string  | Tidak | null             | `aktif`, `tidak_aktif`                              |
| page            | integer | Tidak | 1                | Nombor halaman (min 1)                            |
| page_size       | integer | Tidak | 10               | Bilangan item per halaman (min 1, max 100)        |

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "topic_id": 1,
      "topic_nama": "Nombor dan Operasi",
      "jenis_soalan": "aneka_pilihan",
      "tahap_kesukaran": "mudah",
      "status": "aktif",
      "teks_soalan": "Berapakah hasil darab 7 dan 8?",
      "pilihan": {"A": "54", "B": "56", "C": "58", "D": "60"},
      "jawapan_betul": {"pilihan": "B"},
      "created_at": "2026-08-01T10:00:00+08:00",
      "updated_at": "2026-08-01T10:00:00+08:00"
    }
  ],
  "meta": {
    "page": 1,
    "page_size": 10,
    "total_items": 90,
    "total_pages": 9
  }
}
```

**Peraturan perniagaan:**
- Semua parameter penapis adalah pilihan dan digabungkan dengan operasi AND.
- Parameter `page` dan `page_size` mesti integer positif.
- `page_size` maksimum 100.

**Senario ralat:**
- 422: Parameter query tidak sah (FastAPI auto-validation)
- 400: `page` atau `page_size` di luar julat (`{"detail": {"mesej": "Parameter halaman tidak sah.", "kod": "PARAMETER_TIDAK_SAH"}}`)

**Operasi pangkalan data:**
1. Bina query dengan JOIN ke topics untuk dapatkan `topic_nama`
2. Tambah klausa WHERE untuk setiap penapis yang diberi
3. Kira jumlah rekod sepadan (`COUNT(*)`)
4. Dapatkan rekod dengan `LIMIT {page_size} OFFSET {(page-1)*page_size}`
5. Isih: `ORDER BY id ASC` (susunan tetap)

---

### 4.6 Endpoint 5: GET /api/v1/questions/{id}

**Penerangan:** Dapatkan perincian satu soalan.

**Path Parameters:**
- `id` (integer): Question ID

**Response (200):**
```json
{
  "data": {
    "id": 1,
    "topic_id": 1,
    "topic_nama": "Nombor dan Operasi",
    "jenis_soalan": "aneka_pilihan",
    "tahap_kesukaran": "mudah",
    "status": "aktif",
    "teks_soalan": "Berapakah hasil darab 7 dan 8?",
    "pilihan": {"A": "54", "B": "56", "C": "58", "D": "60"},
    "jawapan_betul": {"pilihan": "B"},
    "created_at": "2026-08-01T10:00:00+08:00",
    "updated_at": "2026-08-01T10:00:00+08:00"
  }
}
```

**Nota keselamatan (ADR-0004):** Endpoint ini mengembalikan `jawapan_betul`. Ini diperlukan untuk antaramuka admin (edit soalan). Untuk endpoint yang digunakan oleh murid (dalam konteks kuiz), jawapan_betul TIDAK BOLEH dikembalikan. Lihat endpoint 4.11 untuk konteks kuiz murid.

**Senario ralat:**
- 404: Soalan tidak dijumpai (`{"detail": {"mesej": "Soalan tidak dijumpai.", "kod": "SUMBER_TIDAK_DIJUMPAI"}}`)

**Operasi pangkalan data:**
1. `SELECT q.*, t.nama as topic_nama FROM questions q JOIN topics t ON q.topic_id = t.id WHERE q.id = {id}`

---

### 4.7 Endpoint 6: POST /api/v1/questions

**Penerangan:** Cipta soalan baharu.

**Request Body (content-type: application/json):**

```json
{
  "topic_id": 1,
  "jenis_soalan": "aneka_pilihan",
  "tahap_kesukaran": "mudah",
  "status": "aktif",
  "teks_soalan": "Berapakah hasil darab 7 dan 8?",
  "pilihan": {"A": "54", "B": "56", "C": "58", "D": "60"},
  "jawapan_betul": {"pilihan": "B"}
}
```

**Skema validasi Pydantic (spesifik jenis):**

Semua jenis:
- `topic_id`: `int > 0`
- `jenis_soalan`: `Literal["aneka_pilihan", "isi_tempat_kosong", "betul_salah", "padanan"]`
- `tahap_kesukaran`: `Literal["mudah", "sederhana", "sukar"]`
- `status`: `Literal["aktif", "tidak_aktif"]` (default: `"aktif"`)
- `teks_soalan`: `str`, min 5 aksara, max 500 aksara, tidak hanya whitespace

Aneka pilihan:
- `pilihan`: `dict` wajib, mesti ada kunci "A", "B", "C", "D". Setiap nilai `str` tidak kosong.
- `jawapan_betul`: `{"pilihan": "A"}` dengan `pilihan` dalam ["A", "B", "C", "D"]

Isi tempat kosong:
- `pilihan`: mesti null atau tidak hadir
- `jawapan_betul`: `{"jawapan_diterima": ["jawapan1", "jawapan2"]}`, array dengan 1-10 item, setiap item `str` tidak kosong
- `teks_soalan`: mesti mengandungi sekurang-kurangnya satu `______`

Betul/Salah:
- `pilihan`: mesti null atau tidak hadir
- `jawapan_betul`: `{"nilai": true}` atau `{"nilai": false}`

Padanan:
- `pilihan`: mesti null atau tidak hadir
- `jawapan_betul`: `{"pasangan": [{"kiri": "A", "kanan": "X"}, {"kiri": "B", "kanan": "Y"}]}`, array dengan 2-6 item, setiap item mesti ada `kiri` (str tidak kosong) dan `kanan` (str tidak kosong). Semua `kiri` mesti unik. Semua `kanan` mesti unik.

**Response (201):**
```json
{
  "data": {
    "id": 1,
    ... (semua medan seperti GET /questions/{id})
  }
}
```

**Peraturan perniagaan:**
- Topik mesti wujud. Semak kewujudan `topic_id`.
- Keseluruhan kombinasi `topic_id + jenis_soalan + tahap_kesukaran + status=aktif` tidak boleh melebihi 10 soalan aktif.
- `jawapan_betul` mesti sepadan dengan struktur yang betul mengikut `jenis_soalan`.
- Untuk aneka pilihan: `jawaban_betul.pilihan` mesti wujud dalam `pilihan`.

**Senario ralat:**
- 422: Validasi gagal (Pydantic/FastAPI auto)
- 404: Topik tidak dijumpai (`{"detail": {"mesej": "Topik tidak dijumpai.", "kod": "SUMBER_TIDAK_DIJUMPAI"}}`)
- 409: Had 10 soalan aktif untuk kombinasi telah dicapai (`{"detail": {"mesej": "Had 10 soalan aktif untuk kombinasi Topik, Tahap, dan Jenis ini telah dicapai.", "kod": "HAD_SOALAN_DICAPAI"}}`)
- 400: `teks_soalan` untuk isi_tempat_kosong tidak mengandungi `______` (`{"detail": {"mesej": "Teks soalan mesti mengandungi penanda tempat kosong '______'.", "kod": "PENANDA_TEMPAT_KOSONG_TIADA"}}`)

**Operasi pangkalan data:**
1. Semak kewujudan topik
2. Jika `status == "aktif"`: kira soalan sedia ada dengan `topic_id`, `jenis_soalan`, `tahap_kesukaran`, `status == "aktif"`. Jika >= 10, kembalikan 409.
3. INSERT ke dalam `questions`
4. Kembalikan rekod yang baru dicipta

---

### 4.8 Endpoint 7: PUT /api/v1/questions/{id}

**Penerangan:** Kemas kini soalan sedia ada secara penuh.

**Path Parameters:**
- `id` (integer): Question ID

**Request Body:** Sama seperti POST /api/v1/questions, kecuali `jenis_soalan` tidak boleh ditukar (abaikan atau tolak jika nilai berbeza).

**Response (200):**
```json
{
  "data": {
    "id": 1,
    ... (semua medan dikemas kini)
  }
}
```

**Peraturan perniagaan:**
- Soalan mesti wujud.
- `jenis_soalan` tidak boleh ditukar. Jika nilai dalam body berbeza dari rekod sedia ada, abaikan dan gunakan nilai sedia ada, ATAU tolak dengan ralat 422.
  - Untuk MVP: **abaikan** nilai `jenis_soalan` yang dihantar. Gunakan nilai dalam pangkalan data.
- Peraturan had 10 soalan aktif juga terpakai. Apabila mengemas kini status dari `tidak_aktif` ke `aktif`, semak had.
- Semua peraturan validasi sama seperti POST.

**Senario ralat:**
- 404: Soalan tidak dijumpai
- 422: Validasi gagal
- 409: Had 10 soalan aktif dilanggar
- 400: `teks_soalan` tidak mengandungi `______` untuk isi_tempat_kosong

**Operasi pangkalan data:**
1. Semak kewujudan soalan
2. Jika `status` dikemas kini ke `aktif`: kira soalan aktif, tolak soalan semasa. Jika >= 10, 409.
3. UPDATE semua medan (kecuali `jenis_soalan`) pada rekod soalan
4. KEMASKINI `updated_at`
5. Kembalikan rekod dikemas kini

---

### 4.9 Endpoint 8: DELETE /api/v1/questions/{id}

**Penerangan:** Padam soalan.

**Path Parameters:**
- `id` (integer): Question ID

**Response (200):**
```json
{
  "data": {
    "mesej": "Soalan berjaya dipadam."
  }
}
```

**Peraturan perniagaan:**
- Padam kekal (hard delete).
- Jika soalan dirujuk oleh QuizAnswer sedia ada (percubaan kuiz lepas), keputusan seni bina diperlukan. Untuk MVP: **benarkan padam**. QuizAnswer menyimpan `question_id` dan `data_jawapan`, jadi rekod sejarah tidak akan hilang tetapi `question_id` tidak lagi boleh dirujuk. Ini diterima untuk MVP.

**Senario ralat:**
- 404: Soalan tidak dijumpai

**Operasi pangkalan data:**
1. Semak kewujudan soalan
2. DELETE FROM questions WHERE id = {id}

---

### 4.10 Endpoint 9: PATCH /api/v1/questions/{id}/status

**Penerangan:** Togol status aktif/tidak aktif soalan.

**Path Parameters:**
- `id` (integer): Question ID

**Request Body:**
```json
{
  "status": "tidak_aktif"
}
```

**Validasi:** `status` mesti `"aktif"` atau `"tidak_aktif"`

**Response (200):**
```json
{
  "data": {
    "id": 1,
    "status": "tidak_aktif",
    ... (medan lain seperti GET)
  }
}
```

**Peraturan perniagaan:**
- Jika menukar dari `tidak_aktif` ke `aktif`: semak had 10 soalan aktif untuk kombinasi.
- Jika menukar dari `aktif` ke `tidak_aktif`: sentiasa dibenarkan.

**Senario ralat:**
- 404: Soalan tidak dijumpai
- 409: Had 10 soalan aktif dilanggar (apabila mengaktifkan)
- 422: Status tidak sah

**Operasi pangkalan data:**
1. Semak kewujudan soalan
2. Jika status baru == "aktif" dan status lama != "aktif": kira soalan aktif. Jika >= 10, 409.
3. UPDATE status, kemas kini `updated_at`
4. Kembalikan rekod dikemas kini

---

### 4.11 Endpoint 10: GET /api/v1/quiz-attempts

**Penerangan:** Dapatkan senarai percubaan kuiz dengan penapisan dan paginasi.

**Query Parameters:**

| Parameter        | Jenis   | Wajib | Default          | Keterangan                          |
| ---------------- | ------- | ----- | ---------------- | ----------------------------------- |
| topic_id         | integer | Tidak | null             | Tapis mengikut topik                |
| difficulty       | string  | Tidak | null             | `mudah`, `sederhana`, `sukar`        |
| participant_name | string  | Tidak | null             | Carian separa (ILIKE) mengikut nama |
| status           | string  | Tidak | null             | `dalam_progres`, `selesai`           |
| page             | integer | Tidak | 1                | Nombor halaman (min 1)              |
| page_size        | integer | Tidak | 20               | Bilangan item per halaman (min 1, max 100) |

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "topic_id": 1,
      "topic_nama": "Nombor dan Operasi",
      "tahap_kesukaran": "mudah",
      "nama_peserta": "Ali",
      "status": "selesai",
      "skor": 7,
      "jumlah_soalan": 10,
      "masa_mula": "2026-08-09T10:00:00+08:00",
      "masa_hantar": "2026-08-09T10:15:00+08:00",
      "created_at": "2026-08-09T10:00:00+08:00",
      "updated_at": "2026-08-09T10:15:00+08:00"
    }
  ],
  "meta": {
    "page": 1,
    "page_size": 20,
    "total_items": 5,
    "total_pages": 1
  }
}
```

**Peraturan perniagaan:**
- Semua parameter penapis adalah pilihan dan digabungkan dengan AND.
- `participant_name` menggunakan carian `ILIKE` untuk padanan separa.
- Isih default: `ORDER BY created_at DESC` (paling baharu dahulu).

**Senario ralat:**
- 422: Parameter query tidak sah
- 400: `page` atau `page_size` di luar julat

**Operasi pangkalan data:**
1. Bina query dengan JOIN ke topics untuk `topic_nama`
2. Tambah klausa WHERE untuk setiap penapis
3. Untuk `participant_name`: `WHERE nama_peserta ILIKE '%{nilai}%'`
4. Kira jumlah, dapatkan rekod dengan LIMIT/OFFSET
5. Isih: `ORDER BY created_at DESC`

---

### 4.12 Endpoint 11: POST /api/v1/quiz-attempts

**Penerangan:** Mulakan percubaan kuiz baru. Pilih 10 soalan secara rawak (susunan tetap selepas dipilih) dan sediakan jawapan kosong.

**Request Body:**
```json
{
  "topic_id": 1,
  "tahap_kesukaran": "mudah",
  "nama_peserta": "Ali"
}
```

**Validasi Pydantic:**
- `topic_id`: `int > 0`
- `tahap_kesukaran`: `Literal["mudah", "sederhana", "sukar"]`
- `nama_peserta`: `str`, min 1 aksara, max 50 aksara, trim whitespace, tidak hanya whitespace

**Response (201):**
```json
{
  "data": {
    "id": 1,
    "topic_id": 1,
    "topic_nama": "Nombor dan Operasi",
    "tahap_kesukaran": "mudah",
    "nama_peserta": "Ali",
    "status": "dalam_progres",
    "skor": null,
    "jumlah_soalan": 10,
    "masa_mula": "2026-08-09T14:30:00+08:00",
    "masa_hantar": null,
    "soalan": [
      {
        "id": 5,
        "jenis_soalan": "aneka_pilihan",
        "teks_soalan": "Berapakah hasil darab 7 dan 8?",
        "pilihan": {"A": "54", "B": "56", "C": "58", "D": "60"}
      },
      {
        "id": 12,
        "jenis_soalan": "isi_tempat_kosong",
        "teks_soalan": "Hasil tambah 25 dan 30 ialah ______.",
        "pilihan": null
      },
      ... (10 soalan)
    ]
  }
}
```

**Peraturan perniagaan:**
- Topik mesti wujud.
- Mesti ada sekurang-kurangnya 10 soalan dengan `status = aktif`, `topic_id` sepadan, dan `tahap_kesukaran` sepadan.
- Pilih 10 soalan secara rawak dari set yang layak. Susunan dipilih adalah **tetap** untuk keseluruhan percubaan (simpan susunan dalam QuizAnswer).
- **ADR-0004 (Keselamatan):** JANGAN sesekali mengembalikan `jawapan_betul` dalam respons ini. Klien tidak boleh mengetahui jawapan betul.
- Untuk setiap soalan terpilih, cipta rekod `QuizAnswer` dengan `data_jawapan = null` dan `adalah_betul = null`.
- Tetapkan `masa_mula` kepada masa semasa pelayan.
- `status` awal: `dalam_progres`.

**Senario ralat:**
- 404: Topik tidak dijumpai
- 422: Validasi gagal
- 400: Kurang dari 10 soalan layak (`{"detail": {"mesej": "Tidak cukup soalan. Hanya terdapat {n} soalan aktif untuk Topik dan Tahap ini.", "kod": "SOALAN_TIDAK_MENCUKUPI"}}`)
- 409: Peserta sudah mempunyai percubaan `dalam_progres` untuk kombinasi topik+tahap yang sama (pilihan: untuk MVP, benarkan sahaja. Atau pilih untuk menolak.) → Untuk MVP: **benarkan** percubaan berganda.

**Operasi pangkalan data (dalam transaksi):**
1. Semak kewujudan topik
2. Semak bilangan soalan layak: `SELECT COUNT(*) FROM questions WHERE topic_id = {topic_id} AND tahap_kesukaran = {tahap_kesukaran} AND status = 'aktif'`. Jika < 10, 400.
3. Pilih 10 soalan rawak: `SELECT id FROM questions WHERE topic_id = {topic_id} AND tahap_kesukaran = {tahap_kesukaran} AND status = 'aktif' ORDER BY RANDOM() LIMIT 10`
4. INSERT ke `quiz_attempts` dengan `masa_mula = NOW()`
5. Untuk setiap soalan terpilih: INSERT ke `quiz_answers` (`quiz_attempt_id`, `question_id`, `data_jawapan = null`, `adalah_betul = null`)
6. Kembalikan `quiz_attempt` + senarai soalan (tanpa `jawapan_betul`)

---

### 4.13 Endpoint 12: POST /api/v1/quiz-attempts/{id}/submit

**Penerangan:** Hantar semua jawapan untuk percubaan kuiz. **Pelayan mengira ketepatan.** (ADR-0004)

**Path Parameters:**
- `id` (integer): QuizAttempt ID

**Request Body:**
```json
{
  "jawapan": [
    {
      "question_id": 5,
      "data_jawapan": {"pilihan": "B"}
    },
    {
      "question_id": 12,
      "data_jawapan": {"teks": "55"}
    },
    {
      "question_id": 7,
      "data_jawapan": {"nilai": true}
    },
    {
      "question_id": 3,
      "data_jawapan": {"pasangan": [{"kiri": "A", "kanan": "X"}, {"kiri": "B", "kanan": "Y"}]}
    }
  ]
}
```

**Validasi Pydantic:**
- `jawapan`: array dengan **tepat 10 item** (semua soalan mesti dihantar)
- Setiap item:
  - `question_id`: integer, mesti sepadan dengan salah satu soalan dalam percubaan ini
  - `data_jawapan`: objek JSON yang strukturnya bergantung pada jenis soalan (lihat 1.9)
- Setiap `question_id` mesti unik dalam array (tiada duplikasi)
- Setiap `question_id` mesti milik percubaan ini

**Respons (200):**
```json
{
  "data": {
    "id": 1,
    "status": "selesai",
    "skor": 7,
    "jumlah_soalan": 10,
    "masa_hantar": "2026-08-09T14:45:00+08:00",
    "perincian": [
      {
        "question_id": 5,
        "jenis_soalan": "aneka_pilihan",
        "teks_soalan": "Berapakah hasil darab 7 dan 8?",
        "pilihan": {"A": "54", "B": "56", "C": "58", "D": "60"},
        "jawapan_murid": {"pilihan": "B"},
        "jawapan_betul": {"pilihan": "B"},
        "adalah_betul": true
      },
      {
        "question_id": 12,
        "jenis_soalan": "isi_tempat_kosong",
        "teks_soalan": "Hasil tambah 25 dan 30 ialah ______.",
        "pilihan": null,
        "jawapan_murid": {"teks": "55"},
        "jawapan_betul": {"jawapan_diterima": ["55", "55.0", "lima puluh lima"]},
        "adalah_betul": true
      },
      ... (10 soalan)
    ]
  }
}
```

**Peraturan perniagaan (pengiraan ketepatan - PELAYAN):**

**Aneka Pilihan:**
- `adalah_betul = (data_jawapan.pilihan == jawapan_betul.pilihan)`

**Isi Tempat Kosong:**
- Normalisasi kedua-dua belah: `trim()` + huruf kecil
- `adalah_betul = jawapan_diterima` (dinormalisasi) mengandungi `data_jawapan.teks` (dinormalisasi)
- `data_jawapan.teks` kosong atau whitespace sahaja dikira sebagai tidak dijawab (`adalah_betul = false`)

**Betul/Salah:**
- `adalah_betul = (data_jawapan.nilai === jawapan_betul.nilai)`

**Padanan:**
- `adalah_betul =` semua pasangan sepadan tepat (perbandingan set, tertib diabaikan)
- Set `jawapan_murid` mesti sama dengan set `jawapan_betul`
- Jika `data_jawapan.pasangan` kurang atau lebih item, atau mana-mana item tidak sepadan: `false`

**Pengiraan Skor:**
- `skor = COUNT(adalah_betul = true)` dari 10 jawapan

**Peraturan lain:**
- Percubaan mesti berstatus `dalam_progres`. Jika sudah `selesai`, tolak.
- `masa_hantar` ditetapkan kepada masa semasa pelayan.
- Semua 10 jawapan mesti ada dalam `data_jawapan` (tiada null). Jika klien tidak menjawab soalan, hantar jawapan kosong (contoh: `{"pilihan": ""}` untuk aneka pilihan). Pelayan akan menilai sebagai salah.
- Simpan `data_jawapan` seperti yang dihantar oleh klien.
- **ADR-0004:** Klien tidak boleh menghantar `adalah_betul` atau `skor`. Pelayan mengira sepenuhnya.

**Senario ralat:**
- 404: Percubaan tidak dijumpai
- 409: Percubaan sudah diselesaikan (`{"detail": {"mesej": "Kuiz ini telah dihantar.", "kod": "KUIZ_TELAH_SELESAI"}}`)
- 422: Validasi gagal (bilangan jawapan bukan 10, question_id tidak sah, duplikasi question_id, format data_jawapan tidak sah)
- 400: `question_id` tidak tergolong dalam percubaan ini (`{"detail": {"mesej": "Soalan tidak tergolong dalam kuiz ini.", "kod": "SOALAN_TIDAK_SAH"}}`)

**Operasi pangkalan data (dalam transaksi):**
1. Semak kewujudan percubaan dan status
2. Jika `status == selesai`, 409
3. Dapatkan semua QuizAnswer untuk percubaan ini (10 rekod) + JOIN Question untuk dapatkan `jenis_soalan` dan `jawapan_betul`
4. Untuk setiap item dalam `jawapan`:
   a. Sahkan `question_id` wujud dalam set QuizAnswer
   b. Dapatkan `jenis_soalan` dari Question
   c. Kira `adalah_betul` berdasarkan peraturan di atas
   d. UPDATE QuizAnswer: SET `data_jawapan`, `adalah_betul`
5. Kira `skor` = jumlah `adalah_betul = true`
6. UPDATE QuizAttempt: SET `status = 'selesai'`, `skor = {skor}`, `masa_hantar = NOW()`
7. Kembalikan keputusan penuh

---

### 4.14 Endpoint 13: GET /api/v1/quiz-attempts/{id}/result

**Penerangan:** Dapatkan keputusan penuh percubaan kuiz dengan perincian setiap soalan.

**Path Parameters:**
- `id` (integer): QuizAttempt ID

**Response (200):**
```json
{
  "data": {
    "id": 1,
    "topic_id": 1,
    "topic_nama": "Nombor dan Operasi",
    "tahap_kesukaran": "mudah",
    "nama_peserta": "Ali",
    "status": "selesai",
    "skor": 7,
    "jumlah_soalan": 10,
    "masa_mula": "2026-08-09T10:00:00+08:00",
    "masa_hantar": "2026-08-09T10:15:00+08:00",
    "perincian": [
      {
        "question_id": 5,
        "jenis_soalan": "aneka_pilihan",
        "teks_soalan": "Berapakah hasil darab 7 dan 8?",
        "pilihan": {"A": "54", "B": "56", "C": "58", "D": "60"},
        "jawapan_murid": {"pilihan": "B"},
        "jawapan_betul": {"pilihan": "B"},
        "adalah_betul": true
      },
      ... (10 soalan)
    ]
  }
}
```

**Peraturan perniagaan:**
- Hanya untuk percubaan berstatus `selesai`.
- `jawapan_betul` didedahkan di sini kerana ini adalah keputusan akhir (selepas hantar).
- Untuk percubaan `dalam_progres`, soalan tanpa `jawapan_betul` boleh dikembalikan (untuk semakan guru). Tetapi untuk MVP murid: hanya `selesai`.
- Jika soalan telah dipadam (question_id tidak lagi wujud dalam questions), paparkan `jawapan_murid` (dari quiz_answers.data_jawapan) tetapi `teks_soalan` dan `jawapan_betul` dipaparkan sebagai "Soalan telah dipadam".

**Senario ralat:**
- 404: Percubaan tidak dijumpai
- 409: Percubaan belum selesai (untuk konteks murid) (`{"detail": {"mesej": "Kuiz belum dihantar.", "kod": "KUIZ_BELUM_SELESAI"}}`)
  - Untuk konteks admin (guru melihat prestasi): benarkan lihat walaupun `dalam_progres`, tetapi tanpa `jawapan_betul` jika belum dihantar. Untuk MVP: **hanya benarkan `selesai`** untuk semua peranan.

**Operasi pangkalan data:**
1. Semak kewujudan percubaan
2. Jika `status != selesai`, 409
3. Dapatkan QuizAttempt + JOIN Topic
4. Dapatkan semua QuizAnswer + LEFT JOIN Question (untuk teks_soalan, jenis_soalan, pilihan, jawapan_betul)
5. Untuk setiap jawapan, bina objek perincian
6. Jika Question tidak wujud (LEFT JOIN null): `teks_soalan = "Soalan telah dipadam"`, `jawapan_betul = null`
7. Kembalikan keputusan

---

## Bahagian 5: Pemetaan Laluan ke Folder Ciri

### 5.1 `src/features/question-bank/`

| Tanggungjawab                     | Laluan                                | Endpoint API Berkaitan                          |
| --------------------------------- | ------------------------------------- | ----------------------------------------------- |
| Senarai soalan + penapis          | `/admin/bank-soalan/`                 | GET /api/v1/questions                           |
| Borang cipta soalan               | `/admin/bank-soalan/baru/`            | POST /api/v1/questions                          |
| Borang edit soalan                | `/admin/bank-soalan/{id}/edit/`       | GET/PUT /api/v1/questions/{id}                  |
| Togol status                      | (tindakan dalam jadual)              | PATCH /api/v1/questions/{id}/status             |
| Padam soalan                      | (tindakan dalam jadual)              | DELETE /api/v1/questions/{id}                   |

Struktur dalaman:
```
src/features/question-bank/
├── components/
│   ├── SoalanJadual.tsx            # Jadual soalan dengan penapis
│   ├── SoalanBorang.tsx            # Borang cipta/edit (diguna kongsi)
│   ├── AnekaPilihanForm.tsx         # Sub-borang aneka pilihan
│   ├── IsiTempatKosongForm.tsx      # Sub-borang isi tempat kosong
│   ├── BetulSalahForm.tsx           # Sub-borang betul/salah
│   ├── PadananForm.tsx              # Sub-borang padanan
│   └── PadamDialog.tsx              # Dialog pengesahan padam
├── hooks/
│   ├── useSoalanSenarai.ts          # TanStack Query untuk senarai
│   ├── useSoalanCipta.ts            # TanStack Query mutation untuk cipta
│   ├── useSoalanEdit.ts             # TanStack Query mutation untuk kemas kini
│   ├── useSoalanPadam.ts            # TanStack Query mutation untuk padam
│   └── useSoalanStatusTogol.ts      # TanStack Query mutation untuk togol status
├── schemas/
│   └── soalan.ts                    # Skema Zod untuk validasi borang
├── services/
│   └── soalanApi.ts                 # Fungsi fetch untuk API soalan
├── types/
│   └── index.ts                     # Jenis tempatan (Soalan, SoalanBorang, SoalanPenapis)
└── index.ts                         # Barrel export API awam
```

### 5.2 `src/features/quiz-taking/`

| Tanggungjawab                    | Laluan                           | Endpoint API Berkaitan                          |
| -------------------------------- | -------------------------------- | ----------------------------------------------- |
| Mula kuiz (pilih topik/tahap)    | `/murid/`                        | POST /api/v1/quiz-attempts                      |
| Pemain kuiz (10 soalan)          | `/murid/kuiz/{attemptId}/`       | GET /api/v1/quiz-attempts/{id}/result???         |
| Hantar jawapan                   | `/murid/kuiz/{attemptId}/`       | POST /api/v1/quiz-attempts/{id}/submit          |

Nota: Pemain kuiz memerlukan cara untuk mendapatkan soalan + metadata percubaan. Endpoint `POST /api/v1/quiz-attempts` (mula) sudah mengembalikan soalan. Untuk menyambung kuiz `dalam_progres`, guna `GET /api/v1/quiz-attempts/{id}/result` (diubah suai untuk benarkan `dalam_progres` dalam konteks pemain kuiz).

Untuk MVP, tambahkan parameter `?include_questions=true` pada `GET /api/v1/quiz-attempts/{id}/result` untuk membenarkan soalan dikembalikan tanpa jawapan_betul semasa `dalam_progres`.

Struktur dalaman:
```
src/features/quiz-taking/
├── components/
│   ├── PemilihKuiz.tsx              # Komponen pilih topik, tahap, nama
│   ├── PemainKuiz.tsx               # Layout utama pemain kuiz
│   ├── PanelNavigasi.tsx            # Panel kiri: senarai nombor soalan
│   ├── PaparanSoalan.tsx            # Panel kanan: soalan semasa
│   ├── JawapanAnekaPilihan.tsx      # Kawalan jawapan aneka pilihan
│   ├── JawapanIsiTempatKosong.tsx    # Kawalan jawapan isi tempat kosong
│   ├── JawapanBetulSalah.tsx        # Kawalan jawapan betul/salah
│   ├── JawapanPadanan.tsx           # Kawalan jawapan padanan
│   ├── DialogHantar.tsx             # Dialog pengesahan hantar
│   └── PaparanKeputusan.tsx         # Paparan keputusan selepas hantar
├── hooks/
│   ├── useKuizMula.ts               # Mutation untuk mula kuiz
│   ├── useKuizHantar.ts             # Mutation untuk hantar jawapan
│   ├── useKuizState.ts              # State klien untuk jawapan (useReducer)
│   └── useKuizNavigasi.ts           # Logik navigasi soalan
├── schemas/
│   └── kuiz.ts                      # Skema Zod untuk jawapan
├── services/
│   └── kuizApi.ts                   # Fungsi fetch untuk API kuiz
├── types/
│   └── index.ts                     # Jenis tempatan (JawapanKuiz, StateKuiz, dll.)
└── index.ts
```

### 5.3 `src/features/results/`

| Tanggungjawab                    | Laluan                           | Endpoint API Berkaitan                          |
| -------------------------------- | -------------------------------- | ----------------------------------------------- |
| Sejarah percubaan murid          | `/murid/sejarah/`                | GET /api/v1/quiz-attempts                       |
| Perincian keputusan              | (expand/dialog dalam sejarah)   | GET /api/v1/quiz-attempts/{id}/result           |
| Prestasi murid (admin)           | `/admin/prestasi/`               | GET /api/v1/quiz-attempts                       |
| Perincian keputusan (admin)      | (expand/dialog dalam prestasi)  | GET /api/v1/quiz-attempts/{id}/result           |

Struktur dalaman:
```
src/features/results/
├── components/
│   ├── SejarahSenarai.tsx           # Senarai kad sejarah (murid)
│   ├── PrestasiJadual.tsx           # Jadual prestasi (admin)
│   ├── PerincianKeputusan.tsx       # Perincian keputusan (kembang/dialog)
│   └── KadPercubaan.tsx             # Kad ringkasan satu percubaan
├── hooks/
│   ├── useSejarahSenarai.ts         # TanStack Query untuk senarai percubaan
│   └── usePerincianKeputusan.ts     # TanStack Query untuk satu keputusan
├── services/
│   └── keputusanApi.ts              # Fungsi fetch untuk API quiz-attempts
├── types/
│   └── index.ts                     # Jenis tempatan (RingkasanPercubaan, PerincianPercubaan)
└── index.ts
```

### 5.4 Folder Global dan Dikongsi

```
src/
├── app/
│   ├── layout.tsx                    # Root layout + TanStack Query Provider
│   ├── page.tsx                      # Landing page (pemilih peranan)
│   ├── admin/
│   │   ├── layout.tsx                # Admin layout + semakan peranan
│   │   ├── page.tsx                  # Dashboard admin (import dari features)
│   │   ├── bank-soalan/
│   │   │   ├── page.tsx              # Senarai soalan (import dari features)
│   │   │   ├── baru/
│   │   │   │   └── page.tsx          # Cipta soalan (import dari features)
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   │           └── page.tsx      # Edit soalan (import dari features)
│   │   └── prestasi/
│   │       └── page.tsx              # Prestasi murid (import dari features)
│   └── murid/
│       ├── layout.tsx                # Murid layout + semakan peranan
│       ├── page.tsx                  # Dashboard murid (import dari features)
│       ├── kuiz/
│       │   └── [attemptId]/
│       │       └── page.tsx          # Pemain kuiz (import dari features)
│       └── sejarah/
│           └── page.tsx              # Sejarah (import dari features)
├── components/
│   ├── ui/                           # shadcn/ui primitif
│   └── layout/
│       ├── AdminLayout.tsx
│       └── MuridLayout.tsx
├── hooks/
│   └── usePeranan.ts                # Hook global untuk peranan (Context/localStorage)
├── lib/
│   ├── queryClient.ts               # Konfigurasi TanStack Query
│   └── apiClient.ts                 # Klien fetch asas (base URL, error handling)
├── utils/
│   ├── normalisasi.ts               # Normalisasi teks (trim, huruf kecil)
│   └── format.ts                    # Pemformat tarikh, peratus, dll.
├── types/
│   ├── api.ts                        # ApiEnvelope<T>, ApiError, PaginatedResponse<T>
│   └── peranan.ts                    # Jenis Peranan enum
└── tests/
    ├── unit/
    ├── integration/
    └── shared/
        ├── fixtures/
        ├── factories/
        └── handlers/
```

---

## Bahagian 6: Keadaan Global dan Cross-Cutting

### 6.1 Pengurusan Peranan

- Jenis: `type Peranan = "admin" | "murid" | null`
- Penyimpanan: localStorage dengan kunci `sk_quiz_peranan`
- Context: `PerananProvider` dalam root layout
- Middleware Next.js: Periksa `sk_quiz_peranan` cookie/header. Redirect ke `/` jika tiada peranan untuk laluan `/admin/*` dan `/murid/*`.
- Tukar peranan: Kosongkan localStorage + redirect ke `/`

### 6.2 Klien API

- Base URL: Pembolehubah persekitaran `NEXT_PUBLIC_API_URL` (default: `http://localhost:8000/api/v1`)
- Fetch wrapper dengan:
  - Content-Type: application/json
  - Error handling: parse `detail` dari respons JSON, baling ralat berstruktur
  - Timeout: 30 saat

### 6.3 Pengendalian Ralat Global

- TanStack Query `QueryCache` global: tangkap ralat rangkaian, papar toast "Ralat sambungan. Sila cuba lagi."
- Client error boundaries: sekitar kawasan interaktif utama (pemain kuiz, borang soalan)
- Server error boundaries: `error.tsx` pada aras `/admin/` dan `/murid/`

### 6.4 Loading States

- Suspense boundaries untuk Server Component yang memuatkan data
- Skeleton UI untuk semua senarai dan jadual
- Butang dilumpuhkan dengan spinner untuk semua tindakan mutation

### 6.5 Skema Warna / Tema

- shadcn/ui tema default dengan warna jenama disesuaikan (pilihan)
- Tiada mod gelap untuk MVP (simpan untuk kemudian)

---

## Bahagian 7: Andaian dan Kekangan MVP

### 7.1 Dalam Skop MVP

- Semua 9 laluan frontend
- Semua 13 endpoint backend
- Semua 4 jenis soalan
- Kedua-dua peranan (Admin, Murid)
- 90 soalan (data seed atau manual entry)
- Bahasa Malaysia untuk semua UI dan kandungan
- Pengesahan ringkas (pemilih peranan)
- Pengiraan ketepatan di pelayan
- Responsif untuk desktop dan tablet (mobile phone rendah keutamaan untuk MVP)

### 7.2 Di Luar Skop MVP

- Pengesahan sebenar dengan kata laluan
- Penjadualan kuiz atau had masa
- Pemasa undur (countdown timer)
- Pemarkahan separa untuk padanan (strict all-or-nothing sahaja)
- Eksport data (CSV/PDF)
- Muat naik imej dalam soalan
- Sintesis teks-ke-suara
- Papan pendahulu
- Pemberitahuan
- Mod gelap
- Mobile app (React Native) - ADR-0005 adalah untuk fasa kemudian

### 7.3 Andaian Teknikal

- Pangkalan data PostgreSQL di-port 5432
- Pelayan FastAPI di-port 8000
- Pelayan Next.js dev di-port 3000
- Data domain (subject, tahun, topik) di-seed melalui skrip Alembic atau data migration
- 90 soalan MVP: dimasukkan melalui UI admin (bukan seed), atau disediakan sebagai seed SQL untuk pembangunan
- Tiada Redis atau caching luaran untuk MVP
- Tiada WebSocket untuk MVP

---

## Bahagian 8: Panduan Pelaksanaan untuk Ejen

### 8.1 Tertib Pelaksanaan Disyorkan

1. Backend: Model pangkalan data + migrasi (Subject, Tahun, Topic, Question, QuizAttempt, QuizAnswer)
2. Backend: Seed data domain (Matematik, Tahun 6, 3 topik)
3. Backend: Endpoint GET subjects/tahun/topics (hierarki rujukan)
4. Backend: Endpoint CRUD soalan (POST, GET, GET/{id}, PUT, DELETE, PATCH status)
5. Frontend: Landing page + pengurusan peranan
6. Frontend: Layout admin + murid
7. Frontend: Ciri bank soalan (senarai, cipta, edit, padam)
8. Backend: Endpoint percubaan kuiz (POST mula, POST hantar, GET senarai, GET result)
9. Frontend: Dashboard murid + pemain kuiz
10. Frontend: Sejarah murid + prestasi admin
11. Backend: Data seed 90 soalan (opsyenal, guna UI admin untuk memasukkan)

### 8.2 Ujian Minimum Disyorkan

- Backend: Ujian unit untuk pengiraan ketepatan (services/question_scoring.py)
- Backend: Ujian integrasi untuk endpoint CRUD soalan
- Backend: Ujian integrasi untuk aliran kuiz penuh (mula → hantar → result)
- Frontend: Ujian unit untuk fungsi normalisasi teks
- Frontend: Ujian integrasi untuk borang cipta soalan (semua 4 jenis)
- Frontend: Ujian integrasi untuk pemain kuiz (navigasi, jawab, hantar)
- E2E: Aliran admin cipta soalan → murid jawab kuiz → admin lihat prestasi

### 8.3 Senarai Semak Governance

Sebelum pelaksanaan bermula, sahkan:
- [ ] Semua laluan diletakkan dalam folder ciri yang betul
- [ ] Tiada ciri mengimport internal ciri lain
- [ ] Semua pengiraan ketepatan di pelayan (ADR-0004)
- [ ] Tiada `jawapan_betul` dibocorkan ke klien semasa kuiz aktif
- [ ] Semua teks UI dalam Bahasa Malaysia
- [ ] Semua respons API menggunakan `ApiEnvelope<T>` / struktur ralat
- [ ] Semua borang menggunakan Zod untuk validasi klien
- [ ] Semua state pelayan menggunakan TanStack Query
- [ ] Halaman laluan hanya orkestrasi, tiada logik perniagaan
