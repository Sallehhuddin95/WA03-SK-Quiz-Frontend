# Ciri: Bank Soalan (Admin)

Sumber utama: `docs/mvp-requirements.md`, Bahagian 3, Laluan 3, 4, dan 5.
Rujukan API: `specs/api/questions.md`, `specs/api/reference-data.md`.

---

## Gambaran Keseluruhan

Ciri bank soalan membolehkan Admin (guru) mengurus 90 soalan Matematik Tahun 6. Admin boleh melihat senarai soalan dengan penapisan, mencipta soalan baharu dalam empat jenis, mengedit soalan sedia ada, menogol status aktif/tidak aktif, dan memadam soalan.

Setiap kombinasi Topik, Tahap Kesukaran, dan Jenis Soalan hanya boleh mengandungi maksimum 10 soalan berstatus `aktif`.

MVP: 3 topik × 3 tahap kesukaran × 10 soalan = 90 soalan.

---

## Pelakon

- **Admin (Guru)**: mengurus bank soalan melalui laluan `/admin/bank-soalan/*`

---

## Prasyarat

- Admin telah memilih peranan di landing page (`/`)
- Peranan disimpan dalam localStorage (kekunci `sk_quiz_peranan`)
- Data rujukan (Subject, Tahun, Topic) telah di-seed dalam pangkalan data

---

## Aliran Utama

### A. Senarai Soalan (Laluan 3: `/admin/bank-soalan/`)

#### Apa yang pengguna lihat dan lakukan

1. Admin tiba di halaman `/admin/bank-soalan/`.
2. Sistem memaparkan jadual senarai soalan dengan lajur:
   - No. (nombor urutan)
   - Teks Soalan (dipendekkan kepada 80 aksara)
   - Topik (nama topik)
   - Tahap (Mudah / Sederhana / Sukar)
   - Jenis (Aneka Pilihan / Isi Tempat Kosong / Betul/Salah / Padanan)
   - Status (Aktif / Tidak Aktif, dengan penanda warna)
   - Tindakan (butang Edit, togol status, butang Padam)
3. Baris penapis di atas jadual mengandungi empat dropdown:
   - Topik: "Semua Topik", "Nombor dan Operasi", "Ukuran dan Geometri", "Pengurusan Data"
   - Tahap Kesukaran: "Semua", "Mudah", "Sederhana", "Sukar"
   - Jenis Soalan: "Semua", "Aneka Pilihan", "Isi Tempat Kosong", "Betul/Salah", "Padanan"
   - Status: "Semua", "Aktif", "Tidak Aktif"
4. Butang "Tambah Soalan" di atas jadual, navigasi ke `/admin/bank-soalan/baru/`.
5. Paginasi di bawah jadual: 10 soalan per halaman.

#### Tindakan dalam jadual

- **Edit**: navigasi ke `/admin/bank-soalan/{id}/edit/`.
- **Togol status**: PATCH `/api/v1/questions/{id}/status` dengan status berlawanan. Kemas kini baris secara optimistik. Jika gagal, kembalikan status asal dan papar ralat.
- **Padam**: buka dialog pengesahan dengan teks "Adakah anda pasti mahu memadam soalan ini? Tindakan ini tidak boleh dibatalkan." Butang "Padam" (merah) dan "Batal". Selepas pengesahan, DELETE `/api/v1/questions/{id}`, keluarkan baris dari jadual.

#### Keadaan

| Keadaan | Paparan |
| --- | --- |
| Loading | Skeleton baris jadual (5 baris, lebar berbeza) |
| Empty (tiada soalan langsung) | Mesej "Tiada soalan ditemui." dengan ilustrasi. Butang "Tambah Soalan Pertama" dipaparkan |
| Empty (penapis aktif, tiada padanan) | Mesej "Tiada soalan sepadan dengan penapis. Cuba tukar penapis." |
| Error | Mesej "Gagal memuatkan senarai soalan." dengan butang cuba semula |

#### Kes Tepi

- Menukar mana-mana penapis mereset halaman ke 1
- Memadam soalan terakhir pada halaman terakhir: kembali ke halaman sebelumnya
- Soalan `tidak_aktif` masih dipaparkan dalam jadual tetapi tidak akan dipilih untuk kuiz baharu

#### Panggilan API

- `GET /api/v1/questions?topic_id=X&difficulty=Y&question_type=Z&status=S&page=N&page_size=10`
- `PATCH /api/v1/questions/{id}/status` (togol aktif/tidak aktif)
- `DELETE /api/v1/questions/{id}` (padam)

---

### B. Tambah Soalan Baharu (Laluan 4: `/admin/bank-soalan/baru/`)

#### Apa yang pengguna lihat dan lakukan

1. Admin tiba di halaman cipta soalan. Tajuk: "Tambah Soalan Baharu".
2. Navigasi kembali: "← Kembali ke Bank Soalan".
3. Borang mengandungi medan berikut:

**Medan 1: Pilih Topik** (dropdown, wajib)
- Pilihan dimuatkan dari `GET /api/v1/tahun/{id}/topics` (selepas dapatkan subject dan tahun).

**Medan 2: Pilih Tahap Kesukaran** (dropdown, wajib)
- Pilihan: Mudah, Sederhana, Sukar
- Nilai: `mudah`, `sederhana`, `sukar`

**Medan 3: Pilih Jenis Soalan** (butang radio atau kad pilihan, wajib)
- Aneka Pilihan (`aneka_pilihan`)
- Isi Tempat Kosong (`isi_tempat_kosong`)
- Betul/Salah (`betul_salah`)
- Padanan (`padanan`)

**Medan 4: Teks Soalan** (textarea, wajib, 5-500 aksara)
- Placeholder: "Tulis soalan anda di sini..."
- Kaunter aksara dipaparkan

**Medan 5: Medan Spesifik Jenis** (berubah berdasarkan pilihan di medan 3)

*Sub-borang Aneka Pilihan:*
- Empat input teks: Pilihan A, Pilihan B, Pilihan C, Pilihan D (semua wajib, tidak kosong)
- Dropdown "Jawapan Betul": A / B / C / D (wajib)

*Sub-borang Isi Tempat Kosong:*
- Teks soalan mesti mengandungi sekurang-kurangnya satu `______`
- Input untuk jawapan diterima: minimum 1, maksimum 10 entri
- Setiap entri: 1-100 aksara, tidak kosong, tidak hanya whitespace
- Butang "Tambah Jawapan" untuk menambah entri baharu
- Butang "Buang" (ikon X) pada setiap entri untuk mengeluarkan
- Tiada entri jawapan diterima yang duplikasi (selepas normalisasi: trim, huruf kecil)

*Sub-borang Betul/Salah:*
- Dua butang radio: "Betul" dan "Salah" (wajib pilih satu)
- Nilai: `true` untuk Betul, `false` untuk Salah

*Sub-borang Padanan:*
- Minimum 2 pasangan, maksimum 6 pasangan
- Setiap pasangan: input teks "Kiri" dan input teks "Kanan" (kedua-dua wajib, tidak kosong)
- Butang "Tambah Pasangan" untuk menambah pasangan baharu (dilumpuhkan jika sudah 6)
- Butang "Buang" pada setiap pasangan (dilumpuhkan jika hanya 2 pasangan)
- Semua nilai `kiri` mesti unik dalam set. Semua nilai `kanan` mesti unik dalam set

**Medan 6: Status** (butang radio, default: "Aktif")
- Pilihan: Aktif (`aktif`), Tidak Aktif (`tidak_aktif`)

**Butang tindakan:**
- "Simpan Soalan" (utama, hijau)
- "Batal" (sekunder, kelabu)

#### Keadaan

| Keadaan | Paparan |
| --- | --- |
| Loading (muat data rujukan) | Skeleton dropdown (3 dropdown kosong) |
| Loading (serahan) | Butang "Simpan Soalan" dilumpuhkan dengan spinner, teks "Menyimpan..." |
| Empty | Tidak berkaitan (borang kosong adalah keadaan default) |
| Error rangkaian (muat) | Mesej "Gagal memuatkan data rujukan. Sila cuba lagi." |
| Error rangkaian (simpan) | Mesej "Gagal menyimpan soalan. Sila cuba lagi." di bawah butang simpan |
| Error validasi pelayan | Papar ralat di sebelah medan berkaitan |
| Error had soalan (409) | Mesej "Setiap kombinasi Topik, Tahap, dan Jenis hanya boleh mempunyai 10 soalan aktif. Sila nyahaktifkan soalan sedia ada atau ubah kombinasi." |

#### Kes Tepi

- Menukar jenis soalan mengosongkan medan spesifik jenis sebelumnya. Dialog amaran tidak diperlukan kerana pengguna secara sedar memilih jenis baharu dengan melihat perubahan UI.
- Butang "Batal" apabila borang dirty: dialog "Adakah anda pasti mahu batalkan? Data yang diisi akan hilang." dengan butang "Tinggalkan" dan "Kekal".
- Isi tempat kosong: jika `teks_soalan` tidak mengandungi `______`, papar ralat field-level "Teks soalan mesti mengandungi penanda tempat kosong '______'."
- Padanan: jika terdapat duplikasi `kiri` atau `kanan`, papar ralat field-level.

#### Validasi (Zod, klien)

```ts
const soalanSkema = z.object({
  topic_id: z.number().int().positive("Pilih topik."),
  tahap_kesukaran: z.enum(["mudah", "sederhana", "sukar"]),
  jenis_soalan: z.enum(["aneka_pilihan", "isi_tempat_kosong", "betul_salah", "padanan"]),
  teks_soalan: z.string().min(5, "Teks soalan mesti sekurang-kurangnya 5 aksara.").max(500, "Teks soalan maksimum 500 aksara.").refine(v => v.trim().length > 0, "Teks soalan tidak boleh kosong."),
  status: z.enum(["aktif", "tidak_aktif"]).default("aktif"),
  // Medan spesifik jenis:
  // ... ditentukan oleh refined schema berdasarkan jenis_soalan
});
```

Validasi spesifik jenis (selection-based refinement):
- `aneka_pilihan`: `pilihan` mesti ada kunci A, B, C, D, setiap nilai tidak kosong. `jawapan_betul.pilihan` dalam ["A", "B", "C", "D"].
- `isi_tempat_kosong`: `pilihan` = null/tiada. `jawapan_betul.jawapan_diterima` array 1-10 item, setiap tidak kosong, unik selepas normalisasi. `teks_soalan` mesti mengandungi `______`.
- `betul_salah`: `pilihan` = null/tiada. `jawapan_betul.nilai` boolean.
- `padanan`: `pilihan` = null/tiada. `jawapan_betul.pasangan` array 2-6 item, `kiri` unik, `kanan` unik, setiap tidak kosong.

#### Panggilan API

- `GET /api/v1/subjects` (data rujukan)
- `GET /api/v1/subjects/{id}/tahun` (data rujukan)
- `GET /api/v1/tahun/{id}/topics` (data rujukan)
- `POST /api/v1/questions` (cipta soalan)

#### Interaksi Utama

1. Muat data rujukan (subject → tahun → topik) secara lata.
2. Pengguna isi borang, pilih jenis soalan → sub-borang dipapar.
3. Klik "Simpan Soalan" → validasi klien → POST → redirect ke `/admin/bank-soalan/` dengan mesej kejayaan "Soalan berjaya disimpan."
4. Klik "Batal" → dialog pengesahan jika dirty → redirect ke `/admin/bank-soalan/`.

---

### C. Edit Soalan (Laluan 5: `/admin/bank-soalan/{id}/edit/`)

#### Apa yang pengguna lihat dan lakukan

1. Sama seperti borang cipta, tetapi pra-isi dengan data sedia ada.
2. Tajuk halaman: "Edit Soalan".
3. **Jenis soalan tidak boleh ditukar**: medan dilumpuhkan atau dipapar sebagai teks baca sahaja. Sebab: menukar jenis akan menyebabkan struktur data tidak serasi.
4. Semua medan lain boleh diedit.
5. Navigasi kembali: "← Kembali ke Bank Soalan".

#### Keadaan

| Keadaan | Paparan |
| --- | --- |
| Loading (muat soalan) | Skeleton borang (semua medan skeleton) |
| Error (404: soalan tidak wujud) | Mesej "Soalan tidak dijumpai." dengan butang "Kembali ke Bank Soalan" |
| Error rangkaian (muat) | Mesej "Gagal memuatkan soalan." dengan butang cuba semula |
| Error semasa menyimpan | Sama seperti laluan cipta |

#### Kes Tepi

- 409 Conflict: jika menukar topik/tahap/status boleh menyebabkan kombinasi baharu melanggar had 10 aktif
- Dirty state: dialog pengesahan jika pengguna cuba meninggalkan halaman dengan perubahan belum disimpan
- Sub-borang padanan: data sedia ada dipra-isi dari `jawapan_betul.pasangan`
- Sub-borang isi tempat kosong: jawapan diterima sedia ada dipra-isi dari `jawapan_betul.jawapan_diterima`

#### Panggilan API

- `GET /api/v1/questions/{id}` (muat data soalan)
- `GET /api/v1/subjects` (data rujukan)
- `GET /api/v1/subjects/{id}/tahun` (data rujukan)
- `GET /api/v1/tahun/{id}/topics` (data rujukan)
- `PUT /api/v1/questions/{id}` (simpan perubahan)

#### Interaksi Utama

1. Muat soalan + data rujukan secara selari.
2. Pra-isi semua medan. Jenis soalan dikunci (baca sahaja).
3. Klik "Simpan Perubahan" → validasi klien → PUT → redirect ke `/admin/bank-soalan/` dengan mesej "Soalan berjaya dikemas kini."
4. Klik "Batal" → dialog pengesahan jika dirty → redirect ke `/admin/bank-soalan/`.

---

## Kriteria Penerimaan

- [ ] Admin boleh melihat senarai soalan dengan penapisan empat kriteria
- [ ] Penapisan digabungkan dengan operasi AND, mereset halaman ke 1
- [ ] Paginasi 10 soalan per halaman dengan kiraan jumlah yang betul
- [ ] Admin boleh mencipta soalan baharu untuk semua empat jenis
- [ ] Borang bertukar sub-borang secara dinamik berdasarkan jenis soalan yang dipilih
- [ ] Semua validasi klien (Zod) berfungsi sebelum serahan
- [ ] Had 10 soalan aktif dikuatkuasakan: ralat 409 dipapar dengan mesej jelas
- [ ] Admin boleh mengedit soalan. Jenis soalan tidak boleh ditukar.
- [ ] Admin boleh menogol status soalan (aktif ↔ tidak aktif)
- [ ] Admin boleh memadam soalan dengan dialog pengesahan
- [ ] Semua keadaan: loading, empty (dengan/tanpa penapis), error, edge cases dikendalikan
- [ ] Teks UI dalam Bahasa Malaysia
- [ ] Responsif pada desktop dan tablet

---

## Kebergantungan

### Endpoint API

| Endpoint | Kegunaan |
| --- | --- |
| `GET /api/v1/questions` | Senarai soalan dengan penapis + paginasi |
| `GET /api/v1/questions/{id}` | Muat satu soalan untuk edit |
| `POST /api/v1/questions` | Cipta soalan baharu |
| `PUT /api/v1/questions/{id}` | Kemas kini soalan |
| `DELETE /api/v1/questions/{id}` | Padam soalan |
| `PATCH /api/v1/questions/{id}/status` | Togol status aktif/tidak aktif |
| `GET /api/v1/subjects` | Data rujukan untuk dropdown lata |
| `GET /api/v1/subjects/{id}/tahun` | Data rujukan untuk dropdown lata |
| `GET /api/v1/tahun/{id}/topics` | Data rujukan untuk dropdown lata |

### Folder Ciri

```
src/features/question-bank/
├── components/
│   ├── SoalanJadual.tsx
│   ├── SoalanBorang.tsx
│   ├── AnekaPilihanForm.tsx
│   ├── IsiTempatKosongForm.tsx
│   ├── BetulSalahForm.tsx
│   ├── PadananForm.tsx
│   └── PadamDialog.tsx
├── hooks/
│   ├── useSoalanSenarai.ts
│   ├── useSoalanCipta.ts
│   ├── useSoalanEdit.ts
│   ├── useSoalanPadam.ts
│   └── useSoalanStatusTogol.ts
├── schemas/
│   └── soalan.ts
├── services/
│   └── soalanApi.ts
├── types/
│   └── index.ts
└── index.ts
```

### Laluan Aplikasi

| Laluan | Halaman |
| --- | --- |
| `/admin/bank-soalan/` | Senarai soalan |
| `/admin/bank-soalan/baru/` | Cipta soalan |
| `/admin/bank-soalan/{id}/edit/` | Edit soalan |

---

## Di Luar Skop

- Muat naik imej dalam soalan
- Import/eksport soalan (CSV, Excel)
- Pemadaman pukal (bulk delete)
- Penapisan lanjutan (carian teks penuh)
- Pratonton soalan
- Salin soalan (clone)
- Versi soalan atau sejarah suntingan
