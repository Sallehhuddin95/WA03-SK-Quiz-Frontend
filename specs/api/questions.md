# API: Soalan (Questions)

Sumber utama: `docs/mvp-requirements.md`, Bahagian 4, Endpoint 4-9.
Rujukan kontrak: `docs/shared/api-contract.md`.

---

## Gambaran Keseluruhan

Endpoint CRUD untuk pengurusan soalan bank kuiz. Semua endpoint guna prefix `/api/v1/`. Semua ID integer. Respons berjaya dibalut dalam `{ "data": ... }`. Respons ralat dalam `{ "detail": { "mesej": "...", "kod": "...", "butiran": ... } }`. Senarai termasuk metadata paginasi `{ "data": [...], "meta": { "page", "page_size", "total_items", "total_pages" } }`.

Enam endpoint: GET list, GET by id, POST create, PUT update, DELETE, PATCH status.

---

## 1. GET /api/v1/questions

Dapatkan senarai soalan dengan penapisan dan paginasi.

### Query Parameters

| Parameter | Jenis | Wajib | Default | Keterangan |
| --- | --- | --- | --- | --- |
| topic_id | integer | Tidak | null | Tapis mengikut topik |
| difficulty | string | Tidak | null | `mudah`, `sederhana`, `sukar` |
| question_type | string | Tidak | null | `aneka_pilihan`, `isi_tempat_kosong`, `betul_salah`, `padanan` |
| status | string | Tidak | null | `aktif`, `tidak_aktif` |
| page | integer | Tidak | 1 | Nombor halaman (min 1) |
| page_size | integer | Tidak | 10 | Bilangan item per halaman (min 1, max 100) |

### Response (200)

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

### Peraturan Perniagaan

- Semua parameter penapis pilihan. Digabung dengan AND.
- Isih: `ORDER BY id ASC` (susunan tetap).
- `topic_nama` dari JOIN ke `topics`.
- **Nota keselamatan**: endpoint ini memulangkan `jawapan_betul` kerana untuk Admin sahaja.

### Senario Ralat

| Kod | Situasi | Badan Ralat |
| --- | --- | --- |
| 400 | page/page_size luar julat | `{"detail": {"mesej": "Parameter halaman tidak sah.", "kod": "PARAMETER_TIDAK_SAH"}}` |
| 422 | Parameter query tidak sah | Standard FastAPI 422 |

### Operasi Pangkalan Data

```sql
SELECT q.*, t.nama AS topic_nama FROM questions q
JOIN topics t ON q.topic_id = t.id
-- + WHERE clauses untuk setiap penapis (AND)
-- + COUNT(*) untuk total_items
-- + LIMIT {page_size} OFFSET {(page-1)*page_size}
ORDER BY q.id ASC
```

---

## 2. GET /api/v1/questions/{id}

Dapatkan perincian satu soalan.

### Path Parameters

| Parameter | Jenis |
| --- | --- |
| id | integer |

### Response (200)

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

### Senario Ralat

| Kod | Situasi |
| --- | --- |
| 404 | Soalan tidak dijumpai: `{"detail": {"mesej": "Soalan tidak dijumpai.", "kod": "SUMBER_TIDAK_DIJUMPAI"}}` |

### Operasi Pangkalan Data

```sql
SELECT q.*, t.nama AS topic_nama FROM questions q
JOIN topics t ON q.topic_id = t.id WHERE q.id = {id}
```

---

## 3. POST /api/v1/questions

Cipta soalan baharu.

### Request Body (Content-Type: application/json)

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

### Medan

| Medan | Jenis | Wajib | Default | Keterangan |
| --- | --- | --- | --- | --- |
| topic_id | integer | Ya | - | Mesti wujud |
| jenis_soalan | enum | Ya | - | `aneka_pilihan`, `isi_tempat_kosong`, `betul_salah`, `padanan` |
| tahap_kesukaran | enum | Ya | - | `mudah`, `sederhana`, `sukar` |
| status | enum | Tidak | `aktif` | `aktif`, `tidak_aktif` |
| teks_soalan | string | Ya | - | 5-500 aksara, bukan whitespace sahaja |
| pilihan | JSONB | Bersyarat | null | Wajib untuk aneka_pilihan. null untuk lain |
| jawapan_betul | JSONB | Ya | - | Struktur ikut jenis_soalan |

### Skema Validasi Spesifik Jenis

**Aneka Pilihan:**
- `pilihan`: wajib, objek dengan kunci "A", "B", "C", "D". Setiap nilai string tidak kosong.
- `jawapan_betul`: `{"pilihan": "A"}`. Nilai mesti dalam {A, B, C, D}.

**Isi Tempat Kosong:**
- `pilihan`: null/tiada.
- `jawapan_betul`: `{"jawapan_diterima": ["45", "45.0"]}`. Array 1-10 item, setiap string tidak kosong.
- `teks_soalan`: mesti mengandungi `______`.

**Betul/Salah:**
- `pilihan`: null/tiada.
- `jawapan_betul`: `{"nilai": true}` atau `{"nilai": false}`.

**Padanan:**
- `pilihan`: null/tiada.
- `jawapan_betul`: `{"pasangan": [{"kiri": "A", "kanan": "X"}, {"kiri": "B", "kanan": "Y"}]}`. Array 2-6 item. Semua `kiri` unik, semua `kanan` unik, setiap tidak kosong.

### Response (201)

Sama bentuk seperti GET /api/v1/questions/{id} dengan data yang baru dicipta.

### Peraturan Perniagaan

1. Topik mesti wujud (semak `topic_id`). Jika tidak: 404.
2. Had 10 soalan aktif: jika `status == "aktif"`, semak kiraan soalan sedia ada dengan `topic_id + jenis_soalan + tahap_kesukaran + status == "aktif"` yang sama. Jika >= 10: 409.
3. `jawapan_betul` mesti sepadan struktur mengikut `jenis_soalan`.
4. Aneka pilihan: `jawapan_betul.pilihan` mesti wujud dalam `pilihan`.

### Senario Ralat

| Kod | Situasi | Kod Ralat |
| --- | --- | --- |
| 404 | Topik tidak wujud | `SUMBER_TIDAK_DIJUMPAI` |
| 409 | Had 10 aktif dicapai | `HAD_SOALAN_DICAPAI` |
| 400 | isi_tempat_kosong tiada ______ | `PENANDA_TEMPAT_KOSONG_TIADA` |
| 422 | Validasi Pydantic gagal | Standard FastAPI |

### Operasi Pangkalan Data

```sql
-- 1. Semak topik
SELECT id FROM topics WHERE id = {topic_id};
-- 2. Jika status == "aktif": semak had
SELECT COUNT(*) FROM questions
WHERE topic_id = {topic_id} AND jenis_soalan = '{jenis_soalan}'
  AND tahap_kesukaran = '{tahap_kesukaran}' AND status = 'aktif';
-- Jika >= 10: 409
-- 3. INSERT + RETURNING *
INSERT INTO questions (topic_id, jenis_soalan, tahap_kesukaran, status,
  teks_soalan, pilihan, jawapan_betul, created_at, updated_at)
VALUES ({topic_id}, '{jenis_soalan}', '{tahap_kesukaran}', '{status}',
  '{teks_soalan}', '{pilihan_json}', '{jawapan_betul_json}', NOW(), NOW())
RETURNING *;
-- 4. JOIN topics untuk topic_nama
```

---

## 4. PUT /api/v1/questions/{id}

Kemas kini soalan. `jenis_soalan` dalam body diabaikan (guna nilai pangkalan data).

### Path: `id` (integer)

### Request Body

Sama seperti POST. Medan `jenis_soalan` diabaikan.

### Response (200)

Sama seperti GET /api/v1/questions/{id}.

### Peraturan Perniagaan

1. Soalan mesti wujud (404 jika tidak).
2. `jenis_soalan` tidak boleh ditukar. Pelayan guna nilai sedia ada.
3. Had 10 aktif: jika status berubah dari `tidak_aktif` ke `aktif`, semak had.
4. Semua validasi spesifik jenis sama seperti POST.

### Senario Ralat

| Kod | Situasi | Kod Ralat |
| --- | --- | --- |
| 404 | Soalan tidak wujud | `SUMBER_TIDAK_DIJUMPAI` |
| 409 | Had 10 aktif | `HAD_SOALAN_DICAPAI` |
| 400 | isi_tempat_kosong tiada ______ | `PENANDA_TEMPAT_KOSONG_TIADA` |
| 422 | Validasi gagal | Standard FastAPI |

### Operasi Pangkalan Data

```sql
-- 1. Semak soalan wujud
SELECT * FROM questions WHERE id = {id};
-- 2. Jika status baru == "aktif" dan status lama != "aktif":
--    Semak had (tolak soalan semasa dari kiraan)
SELECT COUNT(*) FROM questions
WHERE topic_id = {topic_id} AND jenis_soalan = '{jenis_soalan}'
  AND tahap_kesukaran = '{tahap_kesukaran}' AND status = 'aktif'
  AND id != {id};
-- Jika >= 10: 409
-- 3. UPDATE (kecuali jenis_soalan). KEMASKINI updated_at = NOW()
UPDATE questions SET topic_id = {topic_id}, tahap_kesukaran = '{tahap}',
  status = '{status}', teks_soalan = '{teks}', pilihan = '{pilihan_json}',
  jawapan_betul = '{jawapan_json}', updated_at = NOW()
WHERE id = {id} RETURNING *;
-- 4. JOIN topics untuk topic_nama
```

---

## 5. DELETE /api/v1/questions/{id}

Padam soalan (hard delete).

### Path: `id` (integer)

### Response (200)

```json
{
  "data": {
    "mesej": "Soalan berjaya dipadam."
  }
}
```

### Peraturan Perniagaan

- Padam kekal.
- Jika soalan dirujuk oleh QuizAnswer (sejarah): benarkan padam. QuizAnswer simpan `question_id` dan `data_jawapan`. Rekod sejarah tidak hilang tetapi rujukan soalan jadi dangling. MVP terima ini.

### Senario Ralat

| Kod | Situasi |
| --- | --- |
| 404 | Soalan tidak dijumpai |

### Operasi Pangkalan Data

```sql
-- 1. Semak wujud
SELECT id FROM questions WHERE id = {id};
-- 2. DELETE
DELETE FROM questions WHERE id = {id};
```

---

## 6. PATCH /api/v1/questions/{id}/status

Togol status aktif/tidak aktif.

### Path: `id` (integer)

### Request Body

```json
{
  "status": "tidak_aktif"
}
```

### Validasi: `status` mesti `"aktif"` atau `"tidak_aktif"`.

### Response (200)

```json
{
  "data": {
    "id": 1,
    "status": "tidak_aktif",
    "topic_id": 1,
    "topic_nama": "Nombor dan Operasi",
    "jenis_soalan": "aneka_pilihan",
    "tahap_kesukaran": "mudah",
    "teks_soalan": "...",
    "pilihan": {...},
    "jawapan_betul": {...},
    "created_at": "2026-08-01T10:00:00+08:00",
    "updated_at": "2026-08-09T14:30:00+08:00"
  }
}
```

### Peraturan Perniagaan

- `tidak_aktif` ke `aktif`: semak had 10. Jika >= 10: 409.
- `aktif` ke `tidak_aktif`: sentiasa dibenarkan.

### Senario Ralat

| Kod | Situasi | Kod Ralat |
| --- | --- | --- |
| 404 | Soalan tidak wujud | `SUMBER_TIDAK_DIJUMPAI` |
| 409 | Had 10 aktif | `HAD_SOALAN_DICAPAI` |
| 422 | Status tidak sah | Standard FastAPI |

### Operasi Pangkalan Data

```sql
-- 1. Semak wujud + dapatkan status lama
SELECT id, topic_id, jenis_soalan, tahap_kesukaran, status
FROM questions WHERE id = {id};
-- 2. Jika status baru == "aktif" dan status lama != "aktif": semak had
-- 3. UPDATE
UPDATE questions SET status = '{status_baru}', updated_at = NOW()
WHERE id = {id} RETURNING *;
-- 4. JOIN topics
```

---

## Ringkasan Kod Ralat

| Kod Ralat | Maksud |
| --- | --- |
| `SUMBER_TIDAK_DIJUMPAI` | Soalan/topik tidak wujud |
| `HAD_SOALAN_DICAPAI` | Had 10 soalan aktif untuk kombinasi dicapai |
| `PENANDA_TEMPAT_KOSONG_TIADA` | Teks soalan isi_tempat_kosong tiada ______ |
| `PARAMETER_TIDAK_SAH` | page/page_size tidak sah |
