# Ciri: Keputusan dan Sejarah Kuiz

Sumber utama: `docs/mvp-requirements.md`, Bahagian 3, Laluan 6 dan 9.
Rujukan API: `specs/api/quiz-attempts.md`.

---

## Gambaran Keseluruhan

Ciri keputusan menyediakan dua pandangan:

1. **Admin (Prestasi Murid)**: Guru melihat senarai semua percubaan kuiz yang telah selesai, ditapis mengikut topik dan tahap. Guru boleh melihat perincian keputusan setiap murid.

2. **Murid (Sejarah Kuiz)**: Murid melihat sejarah percubaan kuiz sendiri berdasarkan carian nama. Murid boleh melihat perincian keputusan dan menyambung percubaan yang belum selesai.

Kedua-dua pandangan menggunakan endpoint API yang sama tetapi dengan parameter penapisan yang berbeza.

---

## Pelakon

- **Admin (Guru)**: melihat prestasi murid melalui `/admin/prestasi/`
- **Murid**: melihat sejarah kuiz sendiri melalui `/murid/sejarah/`

---

## Prasyarat

- Pengguna telah memilih peranan di landing page
- Terdapat sekurang-kurangnya satu percubaan kuiz dalam sistem (untuk keadaan bukan empty)

---

## A. Pandangan Admin: Prestasi Murid (Laluan 6: `/admin/prestasi/`)

### Apa yang pengguna lihat dan lakukan

1. Admin tiba di halaman `/admin/prestasi/`.
2. Sistem memaparkan:
   - Tajuk: "Prestasi Murid"
   - Penapis: Dropdown "Topik" ("Semua Topik" + 3 topik) dan Dropdown "Tahap" ("Semua Tahap" + Mudah, Sederhana, Sukar)
   - Jadual senarai percubaan kuiz dengan lajur:
     - Nama Murid
     - Topik
     - Tahap
     - Skor (contoh: "7/10")
     - Peratus (contoh: "70%")
     - Tarikh (`masa_hantar`, format: "09 Ogos 2026, 10:15 PTG")
     - Tindakan: Butang "Lihat" untuk melihat perincian
   - Isih default: Tarikh paling baharu dahulu
   - Paginasi: 20 percubaan per halaman
   - Hanya percubaan berstatus `selesai` dipaparkan (tapisan `status=selesai`)

3. Admin menukar penapis: dropdown Topik dan/atau Tahap.
4. Jadual dikemas kini dengan data yang ditapis. Halaman direset ke 1.

### Tindakan: Lihat Perincian

1. Admin klik butang "Lihat" pada satu baris.
2. Sistem memanggil `GET /api/v1/quiz-attempts/{id}/result`.
3. Dialog atau drawer dibuka, memaparkan:
   - Nama murid, topik, tahap, tarikh di bahagian atas
   - Skor keseluruhan: "7/10 (70%)"
   - Senarai 10 soalan dengan perincian:
     - Nombor soalan
     - Teks soalan
     - Jenis soalan
     - Jawapan murid
     - Jawapan betul
     - Penanda betul (✅) atau salah (❌)
4. Admin boleh menutup dialog/drawer (butang "Tutup" atau klik di luar).

### Keadaan Pandangan Admin

| Keadaan | Paparan |
| --- | --- |
| Loading | Skeleton jadual (5 baris, lebar berbeza) |
| Empty (tiada percubaan) | Mesej "Belum ada percubaan kuiz." dengan ilustrasi |
| Empty (penapis aktif, tiada padanan) | Mesej "Tiada percubaan sepadan dengan penapis." |
| Error | Mesej "Gagal memuatkan prestasi." dengan butang cuba semula |
| Loading (muat perincian) | Skeleton dalam dialog/drawer |

### Kes Tepi Pandangan Admin

- Percubaan `dalam_progres` ditapis keluar dari jadual (tidak dipaparkan)
- Skor null (tidak sepatutnya berlaku untuk percubaan selesai)

### Panggilan API Pandangan Admin

- `GET /api/v1/quiz-attempts?status=selesai&topic_id=X&difficulty=Y&page=N&page_size=20` (senarai)
- `GET /api/v1/quiz-attempts/{id}/result` (perincian dalam dialog)

---

## B. Pandangan Murid: Sejarah Kuiz (Laluan 9: `/murid/sejarah/`)

### Apa yang pengguna lihat dan lakukan

1. Murid tiba di halaman `/murid/sejarah/`.
2. Sistem memaparkan:
   - Tajuk: "Sejarah Kuiz Saya"
   - Input carian nama (pra-isi dari localStorage `sk_quiz_nama_murid`, jika ada)
   - Senarai kad percubaan lepas, setiap kad menunjukkan:
     - Topik dan Tahap
     - Status: label "Belum Selesai" (jingga) jika `dalam_progres`, tiada label jika `selesai`
     - Tarikh (`masa_hantar` untuk selesai, `masa_mula` untuk dalam_progres)
     - Skor (contoh: "7/10 - 70%") untuk percubaan selesai
     - Butang "Lihat Butiran" (untuk percubaan selesai) atau "Sambung" (untuk percubaan dalam_progres)
   - Navigasi: "← Kembali ke Dashboard" → `/murid/`
3. Isih: Tarikh paling baharu dahulu
4. Maksimum paparan: 50 percubaan terkini

5. Murid mengisi nama carian. Carian menggunakan debounce 500ms atau tekan Enter.
6. Senarai kad dikemas kini dengan hasil carian.

### Tindakan: Lihat Butiran

1. Murid klik "Lihat Butiran" pada kad percubaan selesai.
2. Sistem memanggil `GET /api/v1/quiz-attempts/{id}/result`.
3. Kad mengembang (expand) atau dialog dibuka, memaparkan:
   - Skor keseluruhan: "7/10 (70%)"
   - Senarai 10 soalan dengan perincian:
     - Teks soalan
     - Jawapan murid
     - Jawapan betul (hanya jika salah)
     - Penanda betul (✅) atau salah (❌)

### Tindakan: Sambung Kuiz

1. Murid klik "Sambung" pada kad percubaan `dalam_progres`.
2. Navigasi ke `/murid/kuiz/{id}/`.

### Keadaan Pandangan Murid

| Keadaan | Paparan |
| --- | --- |
| Loading | Skeleton kad (3 kad, lebar penuh) |
| Empty (tiada sejarah langsung) | Mesej "Anda belum mempunyai sejarah kuiz." dengan butang "Mula Kuiz Pertama" → `/murid/` |
| Empty (carian tiada padanan) | Mesej "Tiada sejarah untuk nama '[nama]'. Cuba nama lain atau mula kuiz baru." |
| Error | Mesej "Gagal memuatkan sejarah kuiz." dengan butang cuba semula |
| Loading (muat perincian) | Skeleton dalam kad dikembangkan |

### Kes Tepi Pandangan Murid

- **Carian nama kosong**: query tanpa parameter `participant_name`. Kembalikan semua percubaan (MVP: mungkin tiada hasil jika tiada parameter, atau semua).
- **Nama carian berbeza dari nama tersimpan**: pengguna boleh mencari nama murid lain (carian teks bebas).
- **Percubaan dalam_progres**: paparkan dengan label "Belum Selesai" dan butang "Sambung".
- **Soalan telah dipadam**: jika soalan yang dirujuk oleh QuizAnswer telah dipadam, paparkan "Soalan telah dipadam." untuk teks soalan dan jawapan betul. Jawapan murid masih dipaparkan dari `data_jawapan`.

### Panggilan API Pandangan Murid

- `GET /api/v1/quiz-attempts?participant_name=X&page=1&page_size=50` (senarai)
- `GET /api/v1/quiz-attempts/{id}/result` (perincian)

---

## Kriteria Penerimaan

### Admin
- [ ] Admin melihat senarai percubaan selesai dengan penapis topik dan tahap
- [ ] Jadual memaparkan nama murid, topik, tahap, skor, peratus, dan tarikh
- [ ] Isih default: tarikh paling baharu dahulu
- [ ] Paginasi 20 percubaan per halaman
- [ ] Menukar penapis mereset halaman ke 1
- [ ] Admin boleh klik "Lihat" untuk melihat perincian penuh setiap percubaan
- [ ] Perincian menunjukkan semua 10 soalan dengan jawapan murid vs jawapan betul
- [ ] Semua keadaan: loading, empty (dengan/tanpa penapis), error dikendalikan

### Murid
- [ ] Murid melihat sejarah percubaan berdasarkan carian nama
- [ ] Carian nama menggunakan debounce 500ms
- [ ] Kad percubaan menunjukkan topik, tahap, tarikh, skor
- [ ] Percubaan dalam_progres dipaparkan dengan label dan butang "Sambung"
- [ ] Murid boleh klik "Lihat Butiran" untuk perincian penuh
- [ ] Murid boleh menyambung percubaan yang belum selesai
- [ ] Maksimum 50 percubaan dipaparkan
- [ ] Semua keadaan: loading, empty (tanpa carian, dengan carian), error dikendalikan

---

## Kebergantungan

### Endpoint API

| Endpoint | Kegunaan |
| --- | --- |
| `GET /api/v1/quiz-attempts` | Senarai percubaan dengan penapis + paginasi |
| `GET /api/v1/quiz-attempts/{id}/result` | Perincian keputusan satu percubaan |

### Folder Ciri

```
src/features/results/
├── components/
│   ├── SejarahSenarai.tsx
│   ├── PrestasiJadual.tsx
│   ├── PerincianKeputusan.tsx
│   └── KadPercubaan.tsx
├── hooks/
│   ├── useSejarahSenarai.ts
│   └── usePerincianKeputusan.ts
├── services/
│   └── keputusanApi.ts
├── types/
│   └── index.ts
└── index.ts
```

### Laluan Aplikasi

| Laluan | Halaman |
| --- | --- |
| `/admin/prestasi/` | Prestasi Murid (Admin) |
| `/murid/sejarah/` | Sejarah Kuiz (Murid) |

---

## Di Luar Skop

- Graf atau visualisasi prestasi
- Analisis soalan paling kerap salah
- Perbandingan antara murid
- Papan pendahulu
- Eksport data (CSV/PDF)
- Penapisan mengikut julat tarikh
