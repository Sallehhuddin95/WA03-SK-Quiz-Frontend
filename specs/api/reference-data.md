# API: Data Rujukan (Reference Data)

Sumber utama: `docs/mvp-requirements.md`, Bahagian 4, Endpoint 1-3.

---

## Gambaran Keseluruhan

Tiga endpoint GET untuk hierarki data rujukan: Subject → Tahun → Topic. Data ini statik/seeded untuk MVP. Digunakan oleh dropdown lata dalam borang cipta soalan (Admin) dan pemilih kuiz (Murid).

---

## 1. GET /api/v1/subjects

Dapatkan senarai semua mata pelajaran.

### Query Parameters

Tiada.

### Response (200)

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

### Peraturan Perniagaan

- MVP: hanya 1 subject (Matematik). Data seeded.
- Jika senarai kosong (belum seed): array kosong `[]` dalam `data`.

### Senario Ralat

Tiada (sentiasa berjaya, walaupun tiada data).

### Operasi Pangkalan Data

```sql
SELECT id, nama FROM subjects ORDER BY id;
```

---

## 2. GET /api/v1/subjects/{id}/tahun

Dapatkan senarai tahun untuk sesuatu mata pelajaran.

### Path Parameters

| Parameter | Jenis | Keterangan |
| --- | --- | --- |
| id | integer | Subject ID |

### Response (200)

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

### Peraturan Perniagaan

- MVP: hanya Tahun 6 (1 rekod).
- Subject mesti wujud.

### Senario Ralat

| Kod | Situasi | Badan Ralat |
| --- | --- | --- |
| 404 | Subject tidak dijumpai | `{"detail": {"mesej": "Mata pelajaran tidak dijumpai.", "kod": "SUMBER_TIDAK_DIJUMPAI"}}` |

### Operasi Pangkalan Data

```sql
-- 1. Semak subject wujud
SELECT id FROM subjects WHERE id = {id};
-- Jika tiada: 404
-- 2. Dapatkan tahun
SELECT id, subject_id, nama FROM tahun WHERE subject_id = {id} ORDER BY id;
```

---

## 3. GET /api/v1/tahun/{id}/topics

Dapatkan senarai topik untuk sesuatu tahun.

### Path Parameters

| Parameter | Jenis | Keterangan |
| --- | --- | --- |
| id | integer | Tahun ID |

### Response (200)

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

### Peraturan Perniagaan

- Tiga topik tetap untuk MVP.
- Tahun mesti wujud.

### Senario Ralat

| Kod | Situasi | Badan Ralat |
| --- | --- | --- |
| 404 | Tahun tidak dijumpai | `{"detail": {"mesej": "Tahun tidak dijumpai.", "kod": "SUMBER_TIDAK_DIJUMPAI"}}` |

### Operasi Pangkalan Data

```sql
-- 1. Semak tahun wujud
SELECT id FROM tahun WHERE id = {id};
-- Jika tiada: 404
-- 2. Dapatkan topik
SELECT id, tahun_id, nama FROM topics WHERE tahun_id = {id} ORDER BY id;
```

---

## Data Seed

Data berikut mesti di-seed sebelum aplikasi berfungsi sepenuhnya:

### subjects

| id | nama |
| --- | --- |
| 1 | Matematik |

### tahun

| id | subject_id | nama |
| --- | --- | --- |
| 1 | 1 | Tahun 6 |

### topics

| id | tahun_id | nama |
| --- | --- | --- |
| 1 | 1 | Nombor dan Operasi |
| 2 | 1 | Ukuran dan Geometri |
| 3 | 1 | Pengurusan Data |

### Cara Seed

Gunakan skrip data migration Alembic (`alembic/versions/xxxx_seed_reference_data.py`) atau SQL terus:

```sql
INSERT INTO subjects (id, nama) VALUES (1, 'Matematik');
INSERT INTO tahun (id, subject_id, nama) VALUES (1, 1, 'Tahun 6');
INSERT INTO topics (id, tahun_id, nama) VALUES
  (1, 1, 'Nombor dan Operasi'),
  (2, 1, 'Ukuran dan Geometri'),
  (3, 1, 'Pengurusan Data');
```

---

## Corak Penggunaan di Frontend

### Aliran Lata

Frontend memuatkan data rujukan secara lata (cascading):

1. `GET /api/v1/subjects` → dapatkan subject_id (1 untuk MVP)
2. `GET /api/v1/subjects/1/tahun` → dapatkan tahun_id (1 untuk MVP)
3. `GET /api/v1/tahun/1/topics` → dapatkan senarai 3 topik

### Caching

Gunakan `staleTime: Infinity` pada TanStack Query kerana data rujukan tidak berubah untuk MVP.
