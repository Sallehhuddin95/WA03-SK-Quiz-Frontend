# Ciri: Mengambil Kuiz (Murid)

Sumber utama: `docs/mvp-requirements.md`, Bahagian 3, Laluan 7 dan 8.
Rujukan API: `specs/api/quiz-attempts.md`, `specs/api/reference-data.md`.
Rujukan ADR: `docs/adr/0004-reject-client-tampering-of-protected-fields.md`.

---

## Gambaran Keseluruhan

Ciri mengambil kuiz membolehkan Murid memilih topik dan tahap kesukaran, menjawab 10 soalan kuiz Matematik Tahun 6, menghantar semua jawapan serentak, dan menerima keputusan penuh dengan pecahan per soalan.

Pelayan (backend) memilih 10 soalan secara rawak, tidak mendedahkan jawapan betul semasa kuiz aktif, dan mengira ketepatan sepenuhnya di pelayan (ADR-0004).

Murid boleh bebas ulang-alik antara soalan melalui panel navigasi kiri. Semua jawapan dihantar dalam satu batch.

---

## Pelakon

- **Murid**: memilih topik/tahap, menjawab soalan, menghantar jawapan, melihat keputusan
- **Pelayan**: memilih soalan secara rawak, mengesahkan jawapan, mengira ketepatan, menyimpan percubaan

---

## Prasyarat

- Murid telah memilih peranan "Murid" di landing page (`/`)
- Peranan disimpan dalam localStorage (kekunci `sk_quiz_peranan`)
- Pelayan mempunyai sekurang-kurangnya 10 soalan `aktif` untuk kombinasi topik dan tahap yang dipilih

---

## Aliran Utama

### Fasa 1: Pemilihan Kuiz (Laluan 7: `/murid/`)

1. Murid tiba di dashboard Murid. Tajuk: "Selamat Datang ke Kuiz Matematik".
2. Sistem memaparkan kad pemilihan kuiz dengan:
   - Input teks "Nama Kamu" (wajib, 1-50 aksara). Diingati dalam localStorage untuk pra-isi.
   - Dropdown "Pilih Topik" dengan tiga pilihan: Nombor dan Operasi, Ukuran dan Geometri, Pengurusan Data.
   - Dropdown "Pilih Tahap" dengan pilihan: Mudah, Sederhana, Sukar.
   - Butang besar "Mula Kuiz!".
3. Pautan "Lihat Sejarah Kuiz" navigasi ke `/murid/sejarah/`.
4. Pautan "← Tukar Peranan" navigasi ke `/`, kosongkan peranan.
5. Murid mengisi nama, pilih topik, pilih tahap.
6. Murid klik "Mula Kuiz!".
7. Sistem mencipta percubaan melalui `POST /api/v1/quiz-attempts`.
8. Navigasi ke `/murid/kuiz/{attemptId}/`.

#### Keadaan Fasa 1

| Keadaan | Paparan |
| --- | --- |
| Loading (mencipta percubaan) | Butang "Mula Kuiz!" dilumpuhkan dengan spinner, teks "Memulakan kuiz..." |
| Error: nama kosong | Mesej "Sila isi nama anda." di bawah input nama |
| Error: topik tidak dipilih | Mesej "Sila pilih topik." di bawah dropdown topik |
| Error: tahap tidak dipilih | Mesej "Sila pilih tahap." di bawah dropdown tahap |
| Error: rangkaian | Mesej "Gagal memulakan kuiz. Sila cuba lagi." |
| Error: tiada soalan (400) | Mesej "Maaf, tiada soalan tersedia untuk Topik dan Tahap ini. Sila cuba kombinasi lain." |

#### Kes Tepi Fasa 1

- **Percubaan dalam_progres sedia ada**: jika murid sudah mempunyai percubaan `dalam_progres` untuk kombinasi topik dan tahap yang sama, paparkan pilihan: "Anda mempunyai kuiz yang belum diselesaikan." dengan butang "Sambung" (navigasi ke `/murid/kuiz/{id}/`) dan "Mula Baru" (cipta percubaan baharu). MVP membenarkan percubaan berganda.
- Nama murid diingati: simpan dalam localStorage (`sk_quiz_nama_murid`), pra-isi pada lawatan seterusnya.

---

### Fasa 2: Menjawab Kuiz (Laluan 8: `/murid/kuiz/{attemptId}/`)

#### Susun Atur

```
+---------------------------------------------------------+
| ← Dashboard | Kuiz: Nombor dan Operasi - Mudah | Ali     |
+---------------------------------------------------------+
|                |                                          |
| Panel Navigasi | Panel Soalan Semasa                      |
| (kiri, tetap)  | (kanan, boleh skrol)                    |
|                |                                          |
| 1 ● Dijawab    | Soalan 1 dari 10                         |
| 2 ● Dijawab    |                                          |
| 3 ○ Belum      | Berapakah hasil darab 7 dan 8?           |
| 4 ● Dijawab    |                                          |
| 5 ○ Belum      | ○ A: 54                                  |
| 6 ○ Belum      | ○ B: 56                                  |
| 7 ○ Belum      | ○ C: 58                                  |
| 8 ○ Belum      | ○ D: 60                                  |
| 9 ○ Belum      |                                          |
|10 ○ Belum      | [← Sebelumnya]         [Seterusnya →]    |
|                |                                          |
| Dijawab: 4/10  |                                          |
|                |                                          |
| [Hantar Semua  |                                          |
|  Jawapan]      |                                          |
+---------------------------------------------------------+
```

#### Panel Kiri: NavigationPanel

- Senarai 10 nombor soalan (1-10) dalam susunan menegak.
- Setiap item menunjukkan:
  - Nombor soalan
  - Status: ○ (belum dijawab, kelabu) atau ● (dijawab, hijau)
- Item aktif (soalan semasa) diserlahkan dengan sempadan biru.
- Klik mana-mana nombor menavigasi ke soalan tersebut di panel kanan.
- Penunjuk "Dijawab: X/10" di bahagian bawah panel.
- Butang "Hantar Semua Jawapan" di bahagian bawah panel.

#### Panel Kanan: QuestionDisplay

- Memaparkan soalan semasa (satu pada satu masa).
- Komponen:
  - Indikator "Soalan X dari 10"
  - Teks soalan penuh
  - Kawalan jawapan spesifik jenis (lihat sub-seksyen di bawah)
  - Butang navigasi: "← Sebelumnya" (kecuali soalan pertama) dan "Seterusnya →" (kecuali soalan terakhir)

#### Kawalan Jawapan Mengikut Jenis Soalan

**Aneka Pilihan (`aneka_pilihan`)**
- Empat butang radio besar (A, B, C, D)
- Setiap butang menunjukkan label (A/B/C/D) dan teks pilihan
- Hanya satu pilihan boleh dipilih pada satu masa
- Pilihan yang dipilih diserlahkan dengan warna biru
- Klik butang radio atau keseluruhan kawasan pilihan untuk memilih

**Isi Tempat Kosong (`isi_tempat_kosong`)**
- Input teks dengan placeholder "Taip jawapan anda..."
- Teks soalan memaparkan `______` sebagai penanda tempat kosong
- Tiada validasi klien selain daripada pengesanan kosong (untuk dialog peringatan)

**Betul/Salah (`betul_salah`)**
- Dua butang besar: "Betul" dan "Salah"
- Butang yang dipilih diserlahkan dengan warna biru
- Hanya satu pilihan pada satu masa

**Padanan (`padanan`)**
- Senarai item kiri (statik, dari `jawapan_betul.pasangan[].kiri` yang diterbalikkan oleh pelayan)
- Setiap item kiri mempunyai dropdown pemilih kanan
- Semua pilihan kanan tersedia dalam setiap dropdown
- Pilihan kanan yang sudah dipilih dilumpuhkan dalam dropdown lain (elakkan duplikasi)
- Semua dropdown mesti dipilih baru dikira sebagai dijawab

#### Keadaan Fasa 2

| Keadaan | Paparan |
| --- | --- |
| Loading (muat kuiz) | Panel kiri: skeleton 10 item. Panel kanan: skeleton soalan (teks + 4 baris pilihan) |
| Error: percubaan tidak wujud (404) | Mesej "Kuiz tidak dijumpai." dengan butang "Kembali ke Dashboard" |
| Error: percubaan sudah selesai | Navigasi automatik ke paparan keputusan, atau paparan "Kuiz ini sudah dihantar." |
| Error: rangkaian (muat soalan) | Mesej "Gagal memuatkan soalan kuiz." dengan butang cuba semula |

#### Kes Tepi Fasa 2

- **Navigasi pelayar (back/forward)**: state jawapan klien mungkin hilang. Simpan jawapan dalam `sessionStorage` sebagai sandaran di bawah kunci `sk_quiz_jawapan_{attemptId}`.
- **Meninggalkan halaman**: jika murid cuba navigasi keluar (back button, klik pautan lain), dialog pengesahan: "Anda akan kehilangan jawapan yang belum dihantar. Teruskan?" dengan butang "Tinggalkan" dan "Kekal".
- **Percubaan lama (> 24 jam)**: paparkan amaran "Kuiz ini dimulakan lebih 24 jam lalu." di bahagian atas halaman.
- **Isi tempat kosong dengan whitespace sahaja**: dikira sebagai tidak dijawab.
- **Padanan tidak lengkap**: dikira sebagai tidak dijawab sehingga semua dropdown dipilih.
- **Semua soalan dijawab**: butang hantar masih memerlukan pengesahan.
- **Tiada soalan dijawab (0/10)**: butang hantar masih dibenarkan, skor akan jadi 0.

---

### Fasa 3: Penghantaran Jawapan

1. Murid klik "Hantar Semua Jawapan".
2. **Dialog peringatan pertama**: kira soalan yang belum dijawab. Jika ada soalan belum dijawab, papar "Anda belum menjawab X soalan. Hantar juga?" dengan butang "Hantar Juga" dan "Kembali". Jika semua dijawab, langkau ke dialog kedua.
3. **Dialog pengesahan kedua**: "Adakah anda pasti mahu menghantar jawapan? Tindakan ini tidak boleh dibatalkan." dengan butang "Ya, Hantar" dan "Batal".
4. Selepas pengesahan: paparan loading "Menghantar jawapan..." dengan modal/blok skrin penuh. Semua interaksi dilumpuhkan.
5. `POST /api/v1/quiz-attempts/{id}/submit` dengan semua 10 jawapan.
6. Jika berjaya: UI bertukar ke paparan keputusan.
7. Jika gagal: modal ditutup, mesej ralat dipapar.

#### Keadaan Fasa 3

| Keadaan | Paparan |
| --- | --- |
| Submitting | Modal penuh: "Menghantar jawapan..." dengan spinner |
| Error: rangkaian | Mesej "Gagal menghantar jawapan. Sila cuba lagi. Jawapan anda masih disimpan." dengan butang "Hantar Semula" |
| Error: sudah selesai (409) | Mesej "Kuiz ini telah dihantar." navigasi automatik ke keputusan |
| Error: format tidak sah (422) | Mesej "Format jawapan tidak sah. Sila cuba lagi." (sepatutnya tidak berlaku dengan validasi klien) |
| Error: soalan tidak sah (400) | Mesej "Ralat sistem. Sila cuba lagi." (sepatutnya tidak berlaku dalam aliran normal) |

---

### Fasa 4: Paparan Keputusan

Selepas penghantaran berjaya, UI bertukar ke mod keputusan:

1. **Ringkasan skor** di bahagian atas:
   - Skor besar: "7/10"
   - Peratusan: "70%"
   - Bar kemajuan visual
2. **Panel kiri** kini menunjukkan ikon betul/salah untuk setiap soalan:
   - ✅ untuk soalan yang dijawab dengan betul
   - ❌ untuk soalan yang dijawab dengan salah
3. **Panel kanan** memaparkan perincian soalan semasa:
   - Teks soalan
   - Jawapan murid
   - Jawapan betul
   - Penanda betul (hijau) atau salah (merah)
4. Navigasi antara soalan masih berfungsi (boleh lihat perincian setiap soalan).
5. Butang "Kembali ke Dashboard" di bahagian bawah, navigasi ke `/murid/`.

#### Perincian Mengikut Jenis Soalan (Mod Keputusan)

**Aneka Pilihan:**
- Pilihan murid: diserlahkan dengan sempadan hijau (jika betul) atau merah (jika salah)
- Jawapan betul: diserlahkan dengan sempadan hijau sentiasa

**Isi Tempat Kosong:**
- Jawapan murid dipaparkan
- Jawapan diterima dipaparkan di bawah
- Betul: teks hijau. Salah: teks merah + jawapan diterima dipaparkan

**Betul/Salah:**
- Jawapan murid: "Betul" atau "Salah"
- Ikon betul/salah di sebelah

**Padanan:**
- Setiap pasangan dipaparkan dengan jawapan murid dan jawapan betul
- Pasangan betul: baris hijau
- Pasangan salah: baris merah dengan jawapan betul dipaparkan

---

## Peraturan Pemarkahan

Pengiraan ketepatan dilakukan sepenuhnya di pelayan (ADR-0004). Klien tidak menghantar sebarang penanda `adalah_betul` atau `skor`.

| Jenis Soalan | Syarat Betul |
| --- | --- |
| Aneka Pilihan | `jawapan_murid.pilihan` tepat sama dengan `jawapan_betul.pilihan` |
| Isi Tempat Kosong | `jawapan_murid.teks` (ditrim, huruf kecil) padan dengan mana-mana entri dalam `jawapan_betul.jawapan_diterima` (ditrim, huruf kecil) |
| Betul/Salah | `jawapan_murid.nilai` tepat sama dengan `jawapan_betul.nilai` |
| Padanan | Strict all-or-nothing: semua pasangan mesti tepat (perbandingan set, tertib diabaikan). Satu pasangan salah = seluruh soalan salah. |

---

## State Pengurusan Klien

State jawapan diuruskan dengan `useReducer` dalam komponen `PemainKuiz`.

```ts
interface JawapanDraf {
  [questionId: number]: {
    jenis_soalan: "aneka_pilihan" | "isi_tempat_kosong" | "betul_salah" | "padanan";
    data_jawapan: Record<string, unknown> | null;
  };
}

interface StateKuiz {
  mod: "memuat" | "menjawab" | "menghantar" | "keputusan";
  jawapanDrafs: JawapanDraf;
  soalanIndeksSemasa: number;
  dialogHantarTerbuka: boolean;
  ralatHantar: string | null;
}

type TindakanKuiz =
  | { type: "SET_JAWAPAN"; questionId: number; data_jawapan: Record<string, unknown> }
  | { type: "KOSONGKAN_JAWAPAN"; questionId: number }
  | { type: "NAVIGASI"; indeks: number }
  | { type: "MULA_HANTAR" }
  | { type: "RALAT_HANTAR"; mesej: string }
  | { type: "SELESAI"; keputusan: KeputusanKuiz };
```

State disimpan dalam `sessionStorage` sebagai sandaran (kunci: `sk_quiz_jawapan_{attemptId}`) untuk pemulihan selepas navigasi pelayar.

---

## Kriteria Penerimaan

- [ ] Murid boleh memilih topik dan tahap dari dashboard
- [ ] Server memilih 10 soalan secara rawak. Susunan tetap sepanjang percubaan
- [ ] Panel navigasi kiri menunjukkan status dijawab/belum untuk setiap soalan
- [ ] Murid boleh bebas navigasi antara soalan (klik nombor atau butang Sebelumnya/Seterusnya)
- [ ] Kawalan jawapan berbeza untuk setiap jenis soalan (radio, input teks, butang betul/salah, dropdown padanan)
- [ ] Jawapan disimpan dalam state klien (useReducer) dengan sandaran sessionStorage
- [ ] Dua dialog pengesahan sebelum hantar: peringatan soalan belum dijawab + pengesahan muktamad
- [ ] Semua 10 jawapan dihantar dalam satu batch. Klien tidak menghantar penanda betul/salah
- [ ] Pelayan mengira ketepatan sepenuhnya. Klien hanya memaparkan keputusan
- [ ] Keputusan penuh dipaparkan selepas hantar, dengan pecahan per soalan
- [ ] Padanan: strict all-or-nothing
- [ ] Isi tempat kosong: case-insensitive, trimmed, mana-mana jawapan diterima
- [ ] Responsif pada desktop dan tablet

---

## Kebergantungan

### Endpoint API

| Endpoint | Kegunaan |
| --- | --- |
| `GET /api/v1/subjects` | Data rujukan dropdown |
| `GET /api/v1/subjects/{id}/tahun` | Data rujukan dropdown |
| `GET /api/v1/tahun/{id}/topics` | Data rujukan dropdown |
| `POST /api/v1/quiz-attempts` | Mula percubaan, dapatkan soalan |
| `GET /api/v1/quiz-attempts/{id}/result?include_questions=true` | Muat soalan untuk sambung kuiz dalam_progres |
| `POST /api/v1/quiz-attempts/{id}/submit` | Hantar jawapan, terima keputusan |

### Folder Ciri

```
src/features/quiz-taking/
├── components/
│   ├── PemilihKuiz.tsx
│   ├── PemainKuiz.tsx
│   ├── PanelNavigasi.tsx
│   ├── PaparanSoalan.tsx
│   ├── JawapanAnekaPilihan.tsx
│   ├── JawapanIsiTempatKosong.tsx
│   ├── JawapanBetulSalah.tsx
│   ├── JawapanPadanan.tsx
│   ├── DialogHantar.tsx
│   ├── DialogPeringatanBelumDijawab.tsx
│   └── PaparanKeputusan.tsx
├── hooks/
│   ├── useKuizMula.ts
│   ├── useKuizHantar.ts
│   ├── useKuizState.ts
│   └── useKuizNavigasi.ts
├── schemas/
│   └── kuiz.ts
├── services/
│   └── kuizApi.ts
├── types/
│   └── index.ts
└── index.ts
```

### Laluan Aplikasi

| Laluan | Halaman |
| --- | --- |
| `/murid/` | Dashboard Murid (pemilih kuiz) |
| `/murid/kuiz/{attemptId}/` | Pemain kuiz |

---

## Di Luar Skop

- Mod jawab satu per satu (sequential)
- Maklum balas segera per soalan (hanya selepas hantar)
- Pemasa (countdown timer)
- Penjadualan kuiz atau had masa
- Sambung percubaan selepas 24 jam (amaran sahaja)
- Pemarkahan separa untuk padanan (strict all-or-nothing sahaja)
- Kongsi keputusan
- Ulang kuiz automatik (murid perlu balik ke dashboard)
- Sokongan untuk topik Tahun 4 dan 5
