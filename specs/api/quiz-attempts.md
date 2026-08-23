# API: Percubaan Kuiz (Quiz Attempts)

Sumber utama: `docs/mvp-requirements.md`, Bahagian 4, Endpoint 10-13.
Rujukan ADR: `docs/adr/0004-reject-client-tampering-of-protected-fields.md`.
Rujukan kontrak: `docs/shared/api-contract.md`, `docs/shared/error-handling.md`.

---

## Gambaran Keseluruhan

Empat endpoint untuk aliran kuiz penuh: mula percubaan, hantar jawapan, lihat keputusan, dan senarai percubaan.

**ADR-0004 Kuat Kuasa**: pelayan mengira ketepatan sepenuhnya. Klien tidak boleh menghantar `adalah_betul`, `skor`, atau sebarang penanda penggredan. Semua penggredan dilakukan di pelayan sahaja. Percubaan yang sudah `selesai` tidak boleh dihantar semula.

---

## 1. POST /api/v1/quiz-attempts

Mulakan percubaan kuiz baru. Pilih 10 soalan secara rawak, cipta rekod jawapan kosong.

### Request Body

```json
{
  "topic_id": 1,
  "tahap_kesukaran": "mudah",
  "nama_peserta": "Ali"
}
```

### Validasi Pydantic

| Medan | Peraturan |
| --- | --- |
| topic_id | `int > 0` |
| tahap_kesukaran | `Literal["mudah", "sederhana", "sukar"]` |
| nama_peserta | `str`, 1-50 aksara, trim whitespace, bukan whitespace sahaja |

### Response (201)

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
      }
    ]
  }
}
```

**SENARAI `soalan` mengandungi 10 item (maksimum). Susunan tetap sepanjang percubaan. `jawapan_betul` TIDAK PERNAH dikembalikan.**

Untuk jenis `betul_salah`, `pilihan` = null.
Untuk jenis `padanan`, `pilihan` = null (pasangan item kiri diambil dari `jawapan_betul.pasangan[].kiri`, diterbalikkan oleh pelayan).

### Peraturan Perniagaan

1. Topik mesti wujud.
2. Mesti ada >= 10 soalan dengan `status = aktif`, `topic_id` sepadan, dan `tahap_kesukaran` sepadan.
3. Pilih 10 soalan secara rawak (`ORDER BY RANDOM()`). Susunan dipilih tetap.
4. **ADR-0004**: jangan sesekali kembalikan `jawapan_betul`.
5. Cipta rekod `QuizAnswer` untuk setiap soalan terpilih dengan `data_jawapan = null`, `adalah_betul = null`.
6. `masa_mula` = masa semasa pelayan.
7. MVP: benarkan percubaan berganda untuk kombinasi sama.

### Senario Ralat

| Kod | Situasi | Badan Ralat |
| --- | --- | --- |
| 404 | Topik tidak wujud | `{"detail": {"mesej": "Topik tidak dijumpai.", "kod": "SUMBER_TIDAK_DIJUMPAI"}}` |
| 400 | Kurang 10 soalan layak | `{"detail": {"mesej": "Tidak cukup soalan. Hanya terdapat {n} soalan aktif untuk Topik dan Tahap ini.", "kod": "SOALAN_TIDAK_MENCUKUPI"}}` |
| 422 | Validasi gagal | Standard FastAPI |

### Operasi Pangkalan Data (Transaksi)

```sql
-- 1. Semak topik
SELECT id FROM topics WHERE id = {topic_id};
-- 2. Semak bilangan soalan layak
SELECT COUNT(*) FROM questions
WHERE topic_id = {topic_id} AND tahap_kesukaran = '{tahap}'
  AND status = 'aktif';
-- Jika < 10: 400
-- 3. Pilih 10 soalan rawak
SELECT id FROM questions
WHERE topic_id = {topic_id} AND tahap_kesukaran = '{tahap}'
  AND status = 'aktif' ORDER BY RANDOM() LIMIT 10;
-- 4. INSERT QuizAttempt
INSERT INTO quiz_attempts (topic_id, tahap_kesukaran, nama_peserta, status,
  skor, jumlah_soalan, masa_mula, masa_hantar, created_at, updated_at)
VALUES ({topic_id}, '{tahap}', '{nama}', 'dalam_progres', NULL, 10,
  NOW(), NULL, NOW(), NOW()) RETURNING id;
-- 5. Untuk setiap soalan: INSERT QuizAnswer
INSERT INTO quiz_answers (quiz_attempt_id, question_id, data_jawapan,
  adalah_betul, created_at, updated_at)
VALUES ({attempt_id}, {question_id}, NULL, NULL, NOW(), NOW());
-- (ulang 10 kali)
-- 6. Kembalikan QuizAttempt + soalan (tanpa jawapan_betul)
```

---

## 2. POST /api/v1/quiz-attempts/{id}/submit

Hantar semua jawapan. Pelayan mengira ketepatan (ADR-0004).

### Path: `id` (integer)

### Request Body

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

### Validasi Pydantic

- `jawapan`: array dengan **tepat 10 item**.
- Setiap item:
  - `question_id`: integer, mesti sepadan dengan soalan dalam percubaan ini.
  - `data_jawapan`: objek JSON. Struktur ikut jenis soalan (lihat jadual di bawah).
- Setiap `question_id` mesti unik dalam array (tiada duplikasi).
- Setiap `question_id` mesti milik percubaan ini.

### Response (200)

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
      }
    ]
  }
}
```

### Peraturan Pengiraan Ketepatan (Pelayan Sahaja)

**Aneka Pilihan:**
- `adalah_betul = (data_jawapan.pilihan === jawapan_betul.pilihan)`

**Isi Tempat Kosong:**
- Normalisasi: `trim()` + huruf kecil untuk kedua-dua belah.
- `adalah_betul =` jawapan_diterima (dinormalisasi) mengandungi `data_jawapan.teks` (dinormalisasi).
- `data_jawapan.teks` kosong atau whitespace sahaja: `adalah_betul = false`.

**Betul/Salah:**
- `adalah_betul = (data_jawapan.nilai === jawapan_betul.nilai)`

**Padanan:**
- `adalah_betul =` semua pasangan sepadan tepat (perbandingan set, tertib diabaikan).
- Set jawapan murid mesti sama dengan set jawapan betul.
- Jika bilangan pasangan berbeza atau mana-mana tidak sepadan: `false`.
- Tiada kredit separa. Strict all-or-nothing.

**Pengiraan Skor:**
- `skor = COUNT(adalah_betul = true)` dari 10 jawapan.

### Peraturan Perniagaan Tambahan

- Percubaan mesti `dalam_progres`. Jika sudah `selesai`: 409.
- Semua 10 jawapan mesti ada. Klien hantar semua, walaupun tidak dijawab (hantar jawapan kosong).
- `masa_hantar` = masa semasa pelayan.
- Simpan `data_jawapan` seperti yang dihantar klien.
- **ADR-0004**: klien tidak boleh hantar `adalah_betul` atau `skor`. Pelayan kira sepenuhnya.

### Senario Ralat

| Kod | Situasi | Kod Ralat |
| --- | --- | --- |
| 404 | Percubaan tidak wujud | `SUMBER_TIDAK_DIJUMPAI` |
| 409 | Percubaan sudah selesai | `KUIZ_TELAH_SELESAI` |
| 422 | Validasi gagal (bilangan bukan 10, question_id tidak sah, duplikasi, format data_jawapan) | Standard FastAPI |
| 400 | question_id bukan milik percubaan ini | `SOALAN_TIDAK_SAH` |

### Operasi Pangkalan Data (Transaksi)

```sql
-- 1. Semak percubaan
SELECT id, status FROM quiz_attempts WHERE id = {id};
-- Jika status == "selesai": 409.
-- 2. Dapatkan semua QuizAnswer + JOIN Question
SELECT qa.id, qa.question_id, q.jenis_soalan, q.jawapan_betul
FROM quiz_answers qa JOIN questions q ON qa.question_id = q.id
WHERE qa.quiz_attempt_id = {id};
-- 3. Untuk setiap item dalam jawapan:
--    a. Sahkan question_id dalam set (jika tidak: 400)
--    b. Kira adalah_betul berdasarkan peraturan jenis soalan
--    c. UPDATE QuizAnswer:
UPDATE quiz_answers SET data_jawapan = '{json}', adalah_betul = {bool},
  updated_at = NOW() WHERE id = {qa_id};
-- 4. Kira skor = SUM(adalah_betul = true)
-- 5. UPDATE QuizAttempt:
UPDATE quiz_attempts SET status = 'selesai', skor = {skor},
  masa_hantar = NOW(), updated_at = NOW() WHERE id = {id};
-- 6. Bina respons perincian (JOIN questions untuk teks_soalan, pilihan, jawapan_betul)
```

---

## 3. GET /api/v1/quiz-attempts/{id}/result

Dapatkan keputusan penuh percubaan yang telah selesai.

### Path: `id` (integer)

### Response (200)

Sama bentuk seperti respons POST /submit: `data` mengandungi `id`, `status`, `skor`, `jumlah_soalan`, `masa_hantar`, dan `perincian` (10 item).

### Peraturan Perniagaan

- Hanya untuk percubaan `selesai`.
- MVC: `dalam_progres` hanya dibenarkan melalui parameter `?include_questions=true` untuk sambung kuiz. Tanpa parameter, hanya `selesai` dibenarkan.
- Jika soalan telah dipadam (LEFT JOIN null): `teks_soalan = "Soalan telah dipadam"`, `jawapan_betul = null`. Jawapan murid masih dipapar dari `quiz_answers.data_jawapan`.

### Senario Ralat

| Kod | Situasi | Kod Ralat |
| --- | --- | --- |
| 404 | Percubaan tidak wujud | `SUMBER_TIDAK_DIJUMPAI` |
| 409 | Percubaan belum selesai | `KUIZ_BELUM_SELESAI` |

### Operasi Pangkalan Data

```sql
-- 1. Semak percubaan
SELECT qa_att.*, t.nama AS topic_nama
FROM quiz_attempts qa_att
JOIN topics t ON qa_att.topic_id = t.id
WHERE qa_att.id = {id};
-- 2. Jika status != "selesai" dan tiada include_questions: 409
-- 3. Dapatkan jawapan + LEFT JOIN questions
SELECT qa.*, q.teks_soalan, q.jenis_soalan, q.pilihan, q.jawapan_betul
FROM quiz_answers qa
LEFT JOIN questions q ON qa.question_id = q.id
WHERE qa.quiz_attempt_id = {id}
ORDER BY qa.id;
-- 4. Untuk setiap jawapan: bina perincian.
--    Jika q IS NULL: teks_soalan = "Soalan telah dipadam", jawapan_betul = null
```

---

## 4. GET /api/v1/quiz-attempts

Senarai percubaan kuiz dengan penapisan dan paginasi.

### Query Parameters

| Parameter | Jenis | Wajib | Default | Keterangan |
| --- | --- | --- | --- | --- |
| topic_id | integer | Tidak | null | Tapis topik |
| difficulty | string | Tidak | null | `mudah`, `sederhana`, `sukar` |
| participant_name | string | Tidak | null | Carian separa (ILIKE) |
| status | string | Tidak | null | `dalam_progres`, `selesai` |
| page | integer | Tidak | 1 | Min 1 |
| page_size | integer | Tidak | 20 | Min 1, max 100 |

### Response (200)

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

### Peraturan Perniagaan

- Semua penapis pilihan, gabung AND.
- `participant_name`: carian `ILIKE '%{nilai}%'`.
- Isih default: `ORDER BY created_at DESC`.
- Admin guna `status=selesai` untuk lihat prestasi.
- Murid guna `participant_name=X` untuk lihat sejarah sendiri.

### Senario Ralat

| Kod | Situasi |
| --- | --- |
| 400 | page/page_size luar julat |
| 422 | Parameter tidak sah |

### Operasi Pangkalan Data

```sql
SELECT qa.*, t.nama AS topic_nama FROM quiz_attempts qa
JOIN topics t ON qa.topic_id = t.id
-- + WHERE untuk setiap penapis (AND)
-- + ILIKE untuk participant_name
-- + COUNT(*) untuk total_items
-- + LIMIT/OFFSET
ORDER BY qa.created_at DESC
```

---

## Struktur data_jawapan Mengikut Jenis Soalan

| Jenis | Bentuk data_jawapan |
| --- | --- |
| aneka_pilihan | `{"pilihan": "A"}` |
| isi_tempat_kosong | `{"teks": "45"}` |
| betul_salah | `{"nilai": true}` |
| padanan | `{"pasangan": [{"kiri": "A", "kanan": "X"}, {"kiri": "B", "kanan": "Y"}]}` |

---

## Ringkasan Kod Ralat

| Kod Ralat | Maksud |
| --- | --- |
| `SUMBER_TIDAK_DIJUMPAI` | Percubaan/topik tidak wujud |
| `SOALAN_TIDAK_MENCUKUPI` | Kurang 10 soalan aktif untuk kombinasi |
| `KUIZ_TELAH_SELESAI` | Percubaan sudah dihantar |
| `KUIZ_BELUM_SELESAI` | Percubaan belum selesai (tidak boleh lihat result) |
| `SOALAN_TIDAK_SAH` | question_id bukan milik percubaan ini |
| `PARAMETER_TIDAK_SAH` | page/page_size tidak sah |
