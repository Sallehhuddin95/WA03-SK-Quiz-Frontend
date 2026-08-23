# UI: Borang Soalan Admin (Cipta dan Edit)

Sumber utama: `docs/mvp-requirements.md`, Bahagian 3, Laluan 4 dan 5.
Rujukan ciri: `specs/features/question-bank.md`.
Rujukan API: `specs/api/questions.md`, `specs/api/reference-data.md`.

---

## Matlamat

Borang untuk Admin mencipta soalan baharu dan mengedit soalan sedia ada. Borang menyokong empat jenis soalan dengan sub-borang spesifik yang bertukar secara dinamik, validasi klien penuh (Zod), dan pengendalian ralat pelayan.

---

## Titik Masuk

- **Cipta**: `/admin/bank-soalan/baru/` (borang kosong)
- **Edit**: `/admin/bank-soalan/{id}/edit/` (borang pra-isi dari `GET /api/v1/questions/{id}`)

---

## Susun Atur

```
+----------------------------------------------------------+
| ← Kembali ke Bank Soalan                                  |
+----------------------------------------------------------+
| Tambah Soalan Baharu / Edit Soalan                        |
+----------------------------------------------------------+
|                                                           |
| 1. Pilih Topik                                            |
| [Nombor dan Operasi           ▼]                          |
|                                                           |
| 2. Pilih Tahap Kesukaran                                  |
| [Mudah                        ▼]                          |
|                                                           |
| 3. Pilih Jenis Soalan                                     |
| ◉ Aneka Pilihan  ○ Isi Tempat Kosong                      |
| ○ Betul/Salah     ○ Padanan                               |
|                                                           |
| 4. Teks Soalan                                            |
| [_____________________________________]                   |
| [_____________________________________]                   |
| [_____________________________________]                   |
| 125/500 aksara                                            |
|                                                           |
| --- Medan Spesifik Jenis (berubah) ---                    |
|                                                           |
| [Sub-borang mengikut jenis soalan]                        |
|                                                           |
| --- Status ---                                            |
| ◉ Aktif  ○ Tidak Aktif                                    |
|                                                           |
| [  Simpan Soalan  ]    [  Batal  ]                        |
+----------------------------------------------------------+
```

---

## Medan Borang dan Validasi

### Data Rujukan (Dimuatkan Semasa Mount)

Tiga panggilan API lata:
1. `GET /api/v1/subjects` → dapatkan subject_id
2. `GET /api/v1/subjects/{id}/tahun` → dapatkan tahun_id
3. `GET /api/v1/tahun/{id}/topics` → isi dropdown Topik

Gunakan TanStack Query dengan `staleTime: Infinity` (data rujukan tidak berubah).

### Medan 1: Topik (Dropdown)

- Pilihan dimuatkan dari endpoint topik.
- Wajib. Mesej ralat: "Pilih topik."
- Nilai: `topic_id` (integer).
- Label dropdown: nama topik (contoh: "Nombor dan Operasi").

### Medan 2: Tahap Kesukaran (Dropdown)

- Pilihan: Mudah (`mudah`), Sederhana (`sederhana`), Sukar (`sukar`).
- Wajib. Mesej ralat: "Pilih tahap kesukaran."

### Medan 3: Jenis Soalan (Butang Radio / Kad Pilihan)

- Empat pilihan dipapar sebagai kad atau butang besar untuk kejelasan visual.
- Label: "Aneka Pilihan", "Isi Tempat Kosong", "Betul/Salah", "Padanan".
- Nilai: `aneka_pilihan`, `isi_tempat_kosong`, `betul_salah`, `padanan`.
- Wajib. Mesej ralat: "Pilih jenis soalan."
- **Mod edit**: medan ini dikunci (baca sahaja). Dipapar sebagai teks "Jenis Soalan: Aneka Pilihan" dengan latar kelabu.

### Medan 4: Teks Soalan (Textarea)

- Tinggi minimum: 3 baris. Resize menegak sahaja.
- Wajib. 5-500 aksara.
- Mesej ralat:
  - "Teks soalan mesti sekurang-kurangnya 5 aksara." (< 5)
  - "Teks soalan maksimum 500 aksara." (> 500)
  - "Teks soalan tidak boleh kosong." (whitespace sahaja)
- Kaunter aksara di bawah: "125/500 aksara". Warna merah jika > 500.
- Untuk `isi_tempat_kosong`: mesej ralat tambahan "Teks soalan mesti mengandungi penanda tempat kosong '______'."

### Medan Spesifik Jenis

Medan ini berubah secara dinamik berdasarkan `jenis_soalan` yang dipilih.

---

## Sub-Borang: Aneka Pilihan

```
--- Aneka Pilihan ---
Pilihan A: [______________________________]  (wajib)
Pilihan B: [______________________________]  (wajib)
Pilihan C: [______________________________]  (wajib)
Pilihan D: [______________________________]  (wajib)

Jawapan Betul: [A ▼]  (wajib)
```

- Empat input teks: Pilihan A, B, C, D. Setiap satu wajib, tidak kosong. Placeholder: "Teks pilihan A...", dsb.
- Mesej ralat: "Pilihan [X] tidak boleh kosong."
- Dropdown "Jawapan Betul": A, B, C, D.
- Mesej ralat: "Pilih jawapan betul."
- Dropdown hanya mengandungi pilihan yang telah diisi (jika A kosong, A tidak muncul dalam dropdown).

### Validasi Spesifik

```ts
pilihan: z.object({
  A: z.string().min(1, "Pilihan A tidak boleh kosong."),
  B: z.string().min(1, "Pilihan B tidak boleh kosong."),
  C: z.string().min(1, "Pilihan C tidak boleh kosong."),
  D: z.string().min(1, "Pilihan D tidak boleh kosong."),
}),
jawapan_betul: z.object({
  pilihan: z.enum(["A", "B", "C", "D"], { message: "Pilih jawapan betul." }),
}),
```

---

## Sub-Borang: Isi Tempat Kosong

```
--- Isi Tempat Kosong ---
Jawapan Diterima:
┌──────────────────────────────────────────────────────┐
│ 1. [45___________________] [Buang]                    │
│ 2. [45.0_________________] [Buang]                    │
│ 3. [empat puluh lima_____] [Buang]                    │
│ 4. [_____________________] [Buang]  ← entri baru kosong│
└──────────────────────────────────────────────────────┘
[+ Tambah Jawapan]  (dilumpuhkan jika >= 10)

Nota: Teks soalan mesti mengandungi '______'.
```

- Minimum 1 entri jawapan diterima. Maksimum 10.
- Setiap entri: input teks 1-100 aksara. Placeholder: "Jawapan yang diterima..."
- Butang "Buang" pada setiap entri (dilumpuhkan jika hanya 1 entri).
- Butang "Tambah Jawapan" di bawah senarai (dilumpuhkan jika sudah 10).
- Tiada duplikasi jawapan diterima selepas normalisasi (trim + huruf kecil). Mesej ralat: "Jawapan diterima tidak boleh sama."

### Validasi Spesifik

```ts
jawapan_betul: z.object({
  jawapan_diterima: z.array(
    z.string().min(1, "Jawapan tidak boleh kosong.").max(100, "Jawapan maksimum 100 aksara.")
  ).min(1, "Sekurang-kurangnya satu jawapan diterima.")
    .max(10, "Maksimum 10 jawapan diterima.")
    .refine(arr => {
      const normalized = arr.map(s => s.trim().toLowerCase());
      return new Set(normalized).size === normalized.length;
    }, "Jawapan diterima tidak boleh sama."),
}),
teks_soalan: z.string().refine(
  v => v.includes("______"),
  "Teks soalan mesti mengandungi penanda tempat kosong '______'."
),
```

---

## Sub-Borang: Betul/Salah

```
--- Betul/Salah ---
Jawapan Betul:
◉ Betul    ○ Salah
```

- Dua butang radio. Wajib pilih satu.
- Nilai: `true` (Betul), `false` (Salah).
- Mesej ralat: "Pilih jawapan betul."

### Validasi Spesifik

```ts
jawapan_betul: z.object({
  nilai: z.boolean({ message: "Pilih jawapan betul." }),
}),
```

---

## Sub-Borang: Padanan

```
--- Padanan ---
┌────────────────────────────────────────────────────────┐
│ Pasangan 1:                                            │
│ Kiri: [2 x 3__________]  Kanan: [6______________] [✕] │
│                                                        │
│ Pasangan 2:                                            │
│ Kiri: [4 x 5__________]  Kanan: [20_____________] [✕] │
│                                                        │
│ Pasangan 3:                                            │
│ Kiri: [_______________]  Kanan: [_______________] [✕] │
└────────────────────────────────────────────────────────┘
[+ Tambah Pasangan]  (dilumpuhkan jika >= 6)
```

- Minimum 2 pasangan. Maksimum 6 pasangan.
- Setiap pasangan: input "Kiri" (label/item soalan) dan input "Kanan" (padanan jawapan). Kedua-dua wajib, tidak kosong.
- Butang ✕ untuk buang pasangan (dilumpuhkan jika hanya 2 pasangan).
- Butang "+ Tambah Pasangan" (dilumpuhkan jika sudah 6).
- Semua `kiri` mesti unik. Semua `kanan` mesti unik.

### Validasi Spesifik

```ts
jawapan_betul: z.object({
  pasangan: z.array(
    z.object({
      kiri: z.string().min(1, "Item kiri tidak boleh kosong."),
      kanan: z.string().min(1, "Item kanan tidak boleh kosong."),
    })
  ).min(2, "Sekurang-kurangnya 2 pasangan.")
    .max(6, "Maksimum 6 pasangan.")
    .refine(arr => {
      const kiriSet = new Set(arr.map(p => p.kiri.trim()));
      return kiriSet.size === arr.length;
    }, "Item kiri tidak boleh sama.")
    .refine(arr => {
      const kananSet = new Set(arr.map(p => p.kanan.trim()));
      return kananSet.size === arr.length;
    }, "Item kanan tidak boleh sama."),
}),
```

---

## Status

```
Status:
◉ Aktif    ○ Tidak Aktif
```

- Default: Aktif.
- Nota info: "Soalan tidak aktif tidak akan dipilih untuk kuiz."

---

## Tingkah Laku Borang

### Penukaran Jenis Soalan (Mod Cipta Sahaja)

Apabila pengguna menukar jenis soalan dalam mod cipta:
- Medan spesifik jenis sebelumnya dikosongkan.
- Sub-borang baru dipaparkan.
- **Tiada dialog amaran** kerana perubahan visual jelas kepada pengguna.

### Dirty State

Borang menjejak sama ada sebarang medan telah diubah dari nilai asal (mod cipta: dari kosong; mod edit: dari data API).

- Klik "Batal" semasa dirty → dialog: "Adakah anda pasti mahu batalkan? Data yang diisi akan hilang." Butang "Tinggalkan" (merah) dan "Kekal" (kelabu).
- Navigasi pelayar (back/forward) semasa dirty → `beforeunload` event.
- Klik "← Kembali ke Bank Soalan" semasa dirty → dialog yang sama.

### Serahan

1. Klik "Simpan Soalan" / "Simpan Perubahan".
2. Validasi Zod klien. Jika gagal: papar ralat di sebelah medan berkaitan. Tatal ke medan pertama yang ralat.
3. Jika lulus: butang dilumpuhkan dengan spinner "Menyimpan...".
4. Hantar POST (cipta) atau PUT (edit) ke API.
5. Jika berjaya (201/200): redirect ke `/admin/bank-soalan/` dengan mesej toast "Soalan berjaya disimpan." / "Soalan berjaya dikemas kini."
6. Jika gagal:
   - Ralat rangkaian: mesej "Gagal menyimpan soalan. Sila cuba lagi." di bawah butang.
   - 409 Conflict: mesej khusus tentang had 10 soalan aktif.
   - 422: papar ralat field-level dari respons pelayan.

---

## Perbezaan Mod Cipta vs Edit

| Aspek | Cipta | Edit |
| --- | --- | --- |
| Tajuk | "Tambah Soalan Baharu" | "Edit Soalan" |
| Jenis Soalan | Boleh dipilih | Dikunci (baca sahaja) |
| Data awal | Kosong | Pra-isi dari GET /api/v1/questions/{id} |
| Butang simpan | "Simpan Soalan" | "Simpan Perubahan" |
| API | POST /api/v1/questions | PUT /api/v1/questions/{id} |
| Selepas berjaya | Redirect + mesej "disimpan" | Redirect + mesej "dikemas kini" |
| Data rujukan | Dimuatkan semasa mount | Dimuatkan semasa mount |

---

## Keadaan

| Keadaan | Paparan |
| --- | --- |
| Loading (muat data rujukan) | Skeleton: 3 dropdown kosong, medan lain disembunyikan |
| Loading (mod edit: muat soalan) | Skeleton borang penuh (semua medan skeleton) |
| Loading (serahan) | Butang simpan: spinner + "Menyimpan...". Semua medan dilumpuhkan |
| Error (muat data rujukan) | Mesej "Gagal memuatkan data rujukan." + butang cuba semula |
| Error (mod edit: 404) | Mesej "Soalan tidak dijumpai." + butang "Kembali ke Bank Soalan" |
| Error (mod edit: rangkaian) | Mesej "Gagal memuatkan soalan." + butang cuba semula |
| Error (serahan: rangkaian) | Mesej merah di bawah butang simpan |
| Error (serahan: 409) | Mesej khusus tentang had 10 soalan aktif |
| Error (serahan: 422) | Ralat field-level dari pelayan dipapar di medan berkaitan |

---

## Struktur Skema Zod Penuh

```ts
import { z } from "zod";

const skemaAsas = z.object({
  topic_id: z.number().int().positive("Pilih topik."),
  tahap_kesukaran: z.enum(["mudah", "sederhana", "sukar"], {
    message: "Pilih tahap kesukaran.",
  }),
  jenis_soalan: z.enum(["aneka_pilihan", "isi_tempat_kosong", "betul_salah", "padanan"], {
    message: "Pilih jenis soalan.",
  }),
  teks_soalan: z.string()
    .min(5, "Teks soalan mesti sekurang-kurangnya 5 aksara.")
    .max(500, "Teks soalan maksimum 500 aksara.")
    .refine(v => v.trim().length > 0, "Teks soalan tidak boleh kosong."),
  status: z.enum(["aktif", "tidak_aktif"]).default("aktif"),
});

// Skema spesifik jenis digabung dengan skema asas melalui discriminatedUnion
const skemaAnekaPilihan = skemaAsas.extend({
  jenis_soalan: z.literal("aneka_pilihan"),
  pilihan: z.object({
    A: z.string().min(1, "Pilihan A tidak boleh kosong."),
    B: z.string().min(1, "Pilihan B tidak boleh kosong."),
    C: z.string().min(1, "Pilihan C tidak boleh kosong."),
    D: z.string().min(1, "Pilihan D tidak boleh kosong."),
  }),
  jawapan_betul: z.object({
    pilihan: z.enum(["A", "B", "C", "D"], { message: "Pilih jawapan betul." }),
  }),
});

const skemaIsiTempatKosong = skemaAsas.extend({
  jenis_soalan: z.literal("isi_tempat_kosong"),
  pilihan: z.null(),
  teks_soalan: z.string()
    .min(5).max(500)
    .refine(v => v.trim().length > 0, "Teks soalan tidak boleh kosong.")
    .refine(v => v.includes("______"), "Teks soalan mesti mengandungi '______'."),
  jawapan_betul: z.object({
    jawapan_diterima: z.array(
      z.string().min(1).max(100)
    ).min(1).max(10).refine(arr => {
      const n = arr.map(s => s.trim().toLowerCase());
      return new Set(n).size === n.length;
    }, "Jawapan diterima tidak boleh sama."),
  }),
});

const skemaBetulSalah = skemaAsas.extend({
  jenis_soalan: z.literal("betul_salah"),
  pilihan: z.null(),
  jawapan_betul: z.object({
    nilai: z.boolean({ message: "Pilih jawapan betul." }),
  }),
});

const skemaPadanan = skemaAsas.extend({
  jenis_soalan: z.literal("padanan"),
  pilihan: z.null(),
  jawapan_betul: z.object({
    pasangan: z.array(
      z.object({
        kiri: z.string().min(1, "Item kiri tidak boleh kosong."),
        kanan: z.string().min(1, "Item kanan tidak boleh kosong."),
      })
    ).min(2, "Sekurang-kurangnya 2 pasangan.").max(6, "Maksimum 6 pasangan.")
      .refine(arr => new Set(arr.map(p => p.kiri.trim())).size === arr.length,
        "Item kiri tidak boleh sama.")
      .refine(arr => new Set(arr.map(p => p.kanan.trim())).size === arr.length,
        "Item kanan tidak boleh sama."),
  }),
});

const skemaBorangSoalan = z.discriminatedUnion("jenis_soalan", [
  skemaAnekaPilihan,
  skemaIsiTempatKosong,
  skemaBetulSalah,
  skemaPadanan,
]);
```

---

## Nota Pelaksanaan

- Guna `react-hook-form` dengan `@hookform/resolvers/zod` untuk pengurusan borang dan validasi.
- `watch("jenis_soalan")` untuk penukaran sub-borang dinamik.
- `reset(dataDariApi)` untuk pra-isi borang mod edit.
- `formState.isDirty` untuk pengesanan dirty state.
- `formState.isSubmitting` untuk melumpuhkan butang semasa serahan.
- Gunakan `useMutation` (TanStack Query) untuk POST dan PUT.
- Gunakan `useQuery` untuk GET data rujukan dengan `staleTime: Infinity`.

## Responsif

- Desktop: borang lebar maksimum 720px, dipusatkan.
- Tablet: lebar penuh dengan padding 16px.
- Dua lajur untuk sub-borang padanan mungkin bertukar ke satu lajur pada skrin kecil.
