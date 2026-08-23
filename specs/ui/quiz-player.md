# UI: Pemain Kuiz (Quiz Player)

Sumber utama: `docs/mvp-requirements.md`, Bahagian 3, Laluan 8.
Rujukan ciri: `specs/features/quiz-taking.md`.
Rujukan API: `specs/api/quiz-attempts.md`.

---

## Matlamat

Antara muka menjawab kuiz yang menyokong panel navigasi kiri, paparan soalan kanan, navigasi bebas antara soalan, penjejakan status jawapan, penghantaran batch dengan pengesahan dua peringkat, dan paparan keputusan selepas hantar.

---

## Titik Masuk

- Dari halaman `/murid/` selepas `POST /api/v1/quiz-attempts` berjaya: navigasi ke `/murid/kuiz/{attemptId}/`.
- Dari halaman `/murid/sejarah/` klik "Sambung" pada percubaan `dalam_progres`: navigasi ke `/murid/kuiz/{attemptId}/`.

---

## Susun Atur

### Mod Menjawab

```
+----------------------------------------------------------+
| [Dashboard]       Kuiz: Nombor dan Operasi - Mudah | Ali  |
+----------------------------------------------------------+
| Panel Kiri (240px)     | Panel Kanan (baki)                |
| tetap, tidak skrol     | boleh skrol menegak              |
|                        |                                   |
| ===== Soalan =====     | Soalan 3 dari 10                  |
|                        |                                   |
| [1] ● Dijawab          | Hasil tambah 25 dan 30 ialah      |
| [2] ● Dijawab          | ______.                           |
| [3] ◯ Belum    ← aktif |                                   |
| [4] ● Dijawab          | [___________________________]      |
| [5] ◯ Belum            | Taip jawapan anda...              |
| [6] ◯ Belum            |                                   |
| [7] ◯ Belum            | [← Sebelumnya]  [Seterusnya →]    |
| [8] ◯ Belum            |                                   |
| [9] ◯ Belum            |                                   |
|[10] ◯ Belum            |                                   |
|                        |                                   |
| Dijawab: 4/10          |                                   |
| [████████░░░░] 40%     |                                   |
|                        |                                   |
| [  Hantar Semua   ]    |                                   |
| [    Jawapan      ]    |                                   |
+----------------------------------------------------------+
```

### Mod Keputusan

```
+----------------------------------------------------------+
| [Dashboard]         Keputusan Kuiz                         |
+----------------------------------------------------------+
| Panel Kiri             | Panel Kanan                       |
|                        |                                   |
| [1] ✅                 | Skor: 7/10 (70%)                  |
| [2] ✅                 | [███████████░░░░░]                |
| [3] ❌                 |                                   |
| [4] ✅                 | Soalan 3 dari 10                  |
| [5] ❌                 |                                   |
| [6] ✅                 | Hasil tambah 25 dan 30 ialah      |
| [7] ✅                 | ______.                           |
| [8] ❌                 |                                   |
| [9] ✅                 | Jawapan anda: 55                  |
|[10] ✅                 | Jawapan betul: 55, 55.0,          |
|                        |   lima puluh lima                 |
|                        |                          ❌ SALAH |
|                        |                                   |
|                        | [← Sebelumnya]  [Seterusnya →]    |
|                        |                                   |
|                        | [  Kembali ke Dashboard  ]        |
+----------------------------------------------------------+
```

---

## Pokok Komponen

```
PemainKuiz (container)
├── BarAtas (tajuk kuiz, nama murid)
├── PanelNavigasi (kiri)
│   ├── SenaraiNomborSoalan (1-10, dengan status)
│   ├── PenunjukKemajuan (X/10 dijawab)
│   └── ButangHantar (mod menjawab)
├── PaparanSoalan (kanan)
│   └── KawalanJawapan (berubah ikut jenis)
│       ├── JawapanAnekaPilihan
│       ├── JawapanIsiTempatKosong
│       ├── JawapanBetulSalah
│       └── JawapanPadanan
├── ButangNavigasi (Sebelumnya / Seterusnya)
├── DialogPeringatanBelumDijawab
├── DialogPengesahanHantar
├── ModalMenghantar (overlay semasa submit)
└── PaparanKeputusan (mod keputusan, ganti PaparanSoalan)
```

---

## State Pengurusan (useReducer)

```ts
interface JawapanDraf {
  questionId: number;
  jenis_soalan: "aneka_pilihan" | "isi_tempat_kosong" | "betul_salah" | "padanan";
  data: Record<string, unknown> | null;
}

interface StatePemainKuiz {
  mod: "memuat" | "menjawab" | "menghantar" | "keputusan";
  jawapanDrafs: Record<number, JawapanDraf>;
  soalanIndeksSemasa: number;
  dialogHantarLangkah: "tiada" | "peringatan" | "pengesahan";
  mesejRalat: string | null;
}

type TindakanPemainKuiz =
  | { type: "SET_JAWAPAN"; questionId: number; data: Record<string, unknown> }
  | { type: "NAVIGASI"; indeks: number }
  | { type: "BUKA_DIALOG_HANTAR" }
  | { type: "TUTUP_DIALOG" }
  | { type: "MULA_MENGHANTAR" }
  | { type: "RALAT_HANTAR"; mesej: string }
  | { type: "SELESAI"; keputusan: KeputusanKuiz };
```

### Mengapa useReducer

- 10 soalan dengan pelbagai jenis jawapan = terlalu banyak `useState` individu.
- Satu tempat untuk semua mutasi jawapan.
- Memudahkan pengiraan derived state (`dijawabCount`, `semuaDijawab`).
- Memudahkan transformasi ke format payload submit.

### Sandaran sessionStorage

Simpan state dalam `sessionStorage` di bawah kunci `sk_quiz_jawapan_{attemptId}` setiap kali state berubah. Pulihkan semasa mount jika wujud. Padam selepas submit berjaya.

---

## Perincian Komponen

### PemainKuiz

Komponen utama halaman. Props:

```ts
interface PemainKuizProps {
  percubaan: DataPercubaanKuiz;     // Dari POST /quiz-attempts atau GET /quiz-attempts/{id}/result
  modAwal: "menjawab" | "keputusan"; // Default "menjawab"
}
```

Tanggungjawab:
- Inisialisasi `useReducer` dengan 10 soalan
- Pulihkan state dari sessionStorage jika ada
- Render PanelNavigasi + PaparanSoalan dalam flex row
- Kendalikan aliran hantar (buka dialog → sahkan → submit)
- Tukar ke mod keputusan selepas submit berjaya

### PanelNavigasi

Props:

```ts
interface PanelNavigasiProps {
  jumlahSoalan: number;
  jawapanDrafs: Record<number, JawapanDraf>;
  indeksAktif: number;
  mod: "memuat" | "menjawab" | "menghantar" | "keputusan";
  keputusan?: ItemKeputusan[];
  onNavigasi: (indeks: number) => void;
  onHantar: () => void;
}
```

Perincian:
- Lebar tetap 240px. `position: sticky; top: 0;` dalam konteks scroll.
- Setiap butang soalan: bulatan 36px dengan nombor.
- Warna: hijau (dijawab), kelabu (belum), biru + sempadan tebal (aktif).
- Mod keputusan: ganti bulatan dengan ikon ✅ / ❌.
- Penunjuk "Dijawab: X/10" dengan bar kemajuan.
- Butang "Hantar Semua Jawapan": lebar penuh, warna hijau. Dilumpuhkan semasa `mod !== "menjawab"`.
- Pada tablet/mobile (< 768px): panel bertukar ke bar mendatar di atas, skrol mendatar.

### PaparanSoalan

Props:

```ts
interface PaparanSoalanProps {
  soalan: DataSoalanKuiz;
  jawapanDraf: JawapanDraf | null;
  mod: "menjawab" | "keputusan";
  keputusan?: ItemKeputusan;
  onJawapanBerubah: (data: Record<string, unknown>) => void;
  nomborSoalan: number;
  jumlahSoalan: number;
}
```

Perincian:
- Papar "Soalan X dari 10" di atas.
- Teks soalan penuh.
- Render sub-komponen jawapan spesifik jenis.
- Mod keputusan: tambah paparan jawapan betul + penanda betul/salah.

### Sub-Komponen Jawapan

#### JawapanAnekaPilihan

- 4 butang radio. Setiap satu: label besar (A/B/C/D) + teks pilihan.
- Guna `<input type="radio">` sebenar untuk aksesibiliti.
- Pilihan yang dipilih: latar belakang biru muda, sempadan biru.
- Mod keputusan: pilihan betul (sempadan hijau + ✅), pilihan salah (sempadan merah + ❌).

#### JawapanIsiTempatKosong

- Satu `<input type="text">` dengan placeholder "Taip jawapan anda...".
- Teks soalan dipaparkan dengan `______` diserlahkan (warna kuning muda atau bold).
- Mod keputusan: papar jawapan murid + jawapan diterima. Betul = teks hijau. Salah = teks merah.

#### JawapanBetulSalah

- Dua butang besar bersebelahan: "Betul" dan "Salah".
- Butang yang dipilih: latar biru. Tidak dipilih: latar kelabu.
- Mod keputusan: butang betul (hijau), butang salah (merah).

#### JawapanPadanan

- Senarai pasangan. Setiap baris: teks kiri (statik, dari data soalan) + `<select>` dropdown kanan.
- Dropdown mengandungi semua pilihan kanan (dari `jawapan_betul.pasangan[].kanan`, diterbalikkan oleh pelayan dan dirawakkan oleh frontend).
- Pilihan yang sudah dipilih dilumpuhkan dalam dropdown lain.
- Semua dropdown mesti dipilih baru dikira sebagai "dijawab".
- Mod keputusan: setiap baris ditanda ✅ (hijau) atau ❌ (merah). Jawapan betul dipapar untuk baris yang salah.

### Dialog

#### DialogPeringatanBelumDijawab

- Buka apabila pengguna klik "Hantar" dan terdapat soalan belum dijawab.
- Mesej: "Anda belum menjawab X soalan. Hantar juga?"
- Butang: "Hantar Juga" (hijau) dan "Kembali" (kelabu).
- Jika semua dijawab, langkau dialog ini terus ke DialogPengesahanHantar.

#### DialogPengesahanHantar

- Mesej: "Adakah anda pasti mahu menghantar jawapan? Tindakan ini tidak boleh dibatalkan."
- Butang: "Ya, Hantar" (hijau) dan "Batal" (kelabu).

#### ModalMenghantar

- Overlay skrin penuh semasa `POST /api/v1/quiz-attempts/{id}/submit` sedang diproses.
- Mesej: "Menghantar jawapan..." dengan spinner besar.
- Semua interaksi pengguna disekat.

### PaparanKeputusan

Props:

```ts
interface PaparanKeputusanProps {
  skor: number;
  jumlahSoalan: number;
  peratusan: number;
  perincian: ItemKeputusan[];
  onKembaliKeDashboard: () => void;
}
```

- Bar ringkasan: skor besar, peratusan, bar kemajuan visual.
- Panel navigasi dengan ikon ✅/❌.
- Paparan soalan yang sama seperti mod menjawab tetapi dengan `mod="keputusan"`.
- Butang "Kembali ke Dashboard" di bahagian bawah (navigasi ke `/murid/`).

---

## Navigasi dan Scroll

- Klik nombor di PanelNavigasi → kemas kini `soalanIndeksSemasa` → scroll ke soalan dalam PaparanSoalan guna `scrollIntoView({ behavior: 'smooth' })`.
- Butang "Sebelumnya" dan "Seterusnya": `soalanIndeksSemasa ± 1`. Dilumpuhkan pada hujung (soalan pertama/terakhir).
- IntersectionObserver (pilihan): auto-kemas kini `soalanIndeksSemasa` semasa skrol manual.

---

## Keadaan

| Keadaan | Paparan |
| --- | --- |
| Loading (muat kuiz) | Panel kiri: 10 skeleton bulatan. Panel kanan: skeleton teks + 4 baris |
| Error: 404 | Mesej "Kuiz tidak dijumpai." + butang "Kembali ke Dashboard" |
| Error: sudah selesai | Navigasi automatik ke mod keputusan |
| Error: rangkaian (muat) | Mesej "Gagal memuatkan soalan kuiz." + butang cuba semula |
| Error: rangkaian (hantar) | Tutup modal. Mesej "Gagal menghantar jawapan. Sila cuba lagi." dengan butang "Hantar Semula" |
| Error: 409 (sudah hantar) | Navigasi automatik ke mod keputusan |
| Edge: > 24 jam | Amaran kuning "Kuiz ini dimulakan lebih 24 jam lalu." di bawah BarAtas |
| Edge: navigasi keluar | `beforeunload` event: dialog pengesahan pelayar |

---

## Responsif

| Saiz Skrin | Tingkah Laku |
| --- | --- |
| Desktop (>=1024px) | Panel kiri 240px tetap + panel kanan fleksibel |
| Tablet (768-1023px) | Panel kiri 200px + panel kanan fleksibel. Fon lebih kecil |
| Mobile (< 768px) | Panel kiri → bar mendatar di atas (skrol X). Panel kanan lebar penuh |

---

## Nota Aksesibiliti

- Semua kawalan guna elemen HTML asli: `<input type="radio">`, `<input type="text">`, `<select>`, `<button>`.
- Panel navigasi: `role="navigation"` dengan `aria-label="Navigasi soalan"`.
- Setiap butang soalan: `aria-label="Soalan X, [dijawab/belum dijawab]"`.
- Dialog guna `<dialog>` elemen atau pattern perangkap fokus.
- Pengumuman skor: `role="status"` atau `aria-live="polite"`.
- Semua teks dalam Bahasa Malaysia.
- Fokus diuruskan: selepas navigasi, fokus ke kawalan jawapan pertama soalan aktif.
- Amaran 24 jam: `role="alert"`.
