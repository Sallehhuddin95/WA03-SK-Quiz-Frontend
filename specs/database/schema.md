# Skema Pangkalan Data

Sumber utama: `docs/mvp-requirements.md`, Bahagian 1 (Model Domain).

---

## Gambaran Keseluruhan

Enam jadual dalam PostgreSQL untuk MVP SK Quiz. Semua ID adalah integer auto-increment. Timestamp guna `TIMESTAMPTZ` (timestamp with timezone). Semua masa dalam ISO 8601 dengan timezone Malaysia (`+08:00`).

---

## Rajah Entiti-Perhubungan

```
subjects (1) ────< tahun (N) ────< topics (N) ────< questions (N)
                                                    topics (N) ────< quiz_attempts (N) ────< quiz_answers (N)
                                                    questions (N) ────────────────────< quiz_answers (N)
```

---

## 1. subjects

| Medan | Jenis | Kekangan | Penerangan |
| --- | --- | --- | --- |
| id | `SERIAL PRIMARY KEY` | NOT NULL | |
| nama | `VARCHAR(100)` | NOT NULL | Nama mata pelajaran |

### Data Seed

| id | nama |
| --- | --- |
| 1 | Matematik |

---

## 2. tahun

| Medan | Jenis | Kekangan | Penerangan |
| --- | --- | --- | --- |
| id | `SERIAL PRIMARY KEY` | NOT NULL | |
| subject_id | `INTEGER` | NOT NULL, FK → subjects(id) | |
| nama | `VARCHAR(50)` | NOT NULL | Label tahun, contoh "Tahun 6" |

### Data Seed

| id | subject_id | nama |
| --- | --- | --- |
| 1 | 1 | Tahun 6 |

### Indeks

```sql
CREATE INDEX idx_tahun_subject_id ON tahun(subject_id);
```

---

## 3. topics

| Medan | Jenis | Kekangan | Penerangan |
| --- | --- | --- | --- |
| id | `SERIAL PRIMARY KEY` | NOT NULL | |
| tahun_id | `INTEGER` | NOT NULL, FK → tahun(id) | |
| nama | `VARCHAR(100)` | NOT NULL | Nama topik |

### Data Seed

| id | tahun_id | nama |
| --- | --- | --- |
| 1 | 1 | Nombor dan Operasi |
| 2 | 1 | Ukuran dan Geometri |
| 3 | 1 | Pengurusan Data |

### Indeks

```sql
CREATE INDEX idx_topics_tahun_id ON topics(tahun_id);
```

---

## 4. questions

| Medan | Jenis | Kekangan | Penerangan |
| --- | --- | --- | --- |
| id | `SERIAL PRIMARY KEY` | NOT NULL | |
| topic_id | `INTEGER` | NOT NULL, FK → topics(id) | |
| jenis_soalan | `VARCHAR(30)` | NOT NULL | Enum lihat di bawah |
| tahap_kesukaran | `VARCHAR(15)` | NOT NULL | Enum lihat di bawah |
| status | `VARCHAR(15)` | NOT NULL, DEFAULT `'aktif'` | Enum lihat di bawah |
| teks_soalan | `TEXT` | NOT NULL | 5-500 aksara (validasi aplikasi) |
| pilihan | `JSONB` | NULL | Untuk aneka_pilihan sahaja |
| jawapan_betul | `JSONB` | NOT NULL | Struktur ikut jenis_soalan |
| created_at | `TIMESTAMPTZ` | NOT NULL, DEFAULT `NOW()` | |
| updated_at | `TIMESTAMPTZ` | NOT NULL, DEFAULT `NOW()` | |

### Jenis Enum (Aplikasi, bukan DB Enum)

**jenis_soalan**: `'aneka_pilihan'`, `'isi_tempat_kosong'`, `'betul_salah'`, `'padanan'`

**tahap_kesukaran**: `'mudah'`, `'sederhana'`, `'sukar'`

**status**: `'aktif'`, `'tidak_aktif'`

Gunakan `VARCHAR` dengan `CHECK` constraint:

```sql
ALTER TABLE questions ADD CONSTRAINT chk_jenis_soalan
  CHECK (jenis_soalan IN ('aneka_pilihan', 'isi_tempat_kosong', 'betul_salah', 'padanan'));

ALTER TABLE questions ADD CONSTRAINT chk_tahap_kesukaran
  CHECK (tahap_kesukaran IN ('mudah', 'sederhana', 'sukar'));

ALTER TABLE questions ADD CONSTRAINT chk_status
  CHECK (status IN ('aktif', 'tidak_aktif'));
```

### Indeks

```sql
CREATE INDEX idx_questions_topic_id ON questions(topic_id);
CREATE INDEX idx_questions_status ON questions(status);
-- Indeks komposit untuk semakan had 10 soalan dan pemilihan rawak
CREATE INDEX idx_questions_pemilihan ON questions(topic_id, tahap_kesukaran, jenis_soalan, status);
```

### Struktur JSONB Mengikut Jenis Soalan

**Aneka Pilihan (`aneka_pilihan`)**
```json
// pilihan:
{"A": "teks pilihan A", "B": "teks pilihan B", "C": "teks pilihan C", "D": "teks pilihan D"}
// jawapan_betul:
{"pilihan": "A"}
```

**Isi Tempat Kosong (`isi_tempat_kosong`)**
```json
// pilihan: null
// jawapan_betul:
{"jawapan_diterima": ["45", "45.0", "empat puluh lima"]}
```

**Betul/Salah (`betul_salah`)**
```json
// pilihan: null
// jawapan_betul:
{"nilai": true}
```

**Padanan (`padanan`)**
```json
// pilihan: null
// jawapan_betul:
{"pasangan": [{"kiri": "A", "kanan": "X"}, {"kiri": "B", "kanan": "Y"}]}
```

---

## 5. quiz_attempts

| Medan | Jenis | Kekangan | Penerangan |
| --- | --- | --- | --- |
| id | `SERIAL PRIMARY KEY` | NOT NULL | |
| topic_id | `INTEGER` | NOT NULL, FK → topics(id) | |
| tahap_kesukaran | `VARCHAR(15)` | NOT NULL | `'mudah'`, `'sederhana'`, `'sukar'` |
| nama_peserta | `VARCHAR(50)` | NOT NULL | 1-50 aksara |
| status | `VARCHAR(20)` | NOT NULL, DEFAULT `'dalam_progres'` | `'dalam_progres'`, `'selesai'` |
| skor | `INTEGER` | NULL | NULL sehingga submit. 0-10 selepas submit |
| jumlah_soalan | `INTEGER` | NOT NULL, DEFAULT 10 | Sentiasa 10 |
| masa_mula | `TIMESTAMPTZ` | NOT NULL | |
| masa_hantar | `TIMESTAMPTZ` | NULL | NULL sehingga submit |
| created_at | `TIMESTAMPTZ` | NOT NULL, DEFAULT `NOW()` | |
| updated_at | `TIMESTAMPTZ` | NOT NULL, DEFAULT `NOW()` | |

### CHECK Constraints

```sql
ALTER TABLE quiz_attempts ADD CONSTRAINT chk_attempt_tahap
  CHECK (tahap_kesukaran IN ('mudah', 'sederhana', 'sukar'));

ALTER TABLE quiz_attempts ADD CONSTRAINT chk_attempt_status
  CHECK (status IN ('dalam_progres', 'selesai'));

ALTER TABLE quiz_attempts ADD CONSTRAINT chk_nama_peserta
  CHECK (char_length(trim(nama_peserta)) BETWEEN 1 AND 50);
```

### Indeks

```sql
CREATE INDEX idx_attempts_topic_id ON quiz_attempts(topic_id);
CREATE INDEX idx_attempts_participant ON quiz_attempts(nama_peserta);
CREATE INDEX idx_attempts_status ON quiz_attempts(status);
CREATE INDEX idx_attempts_created ON quiz_attempts(created_at DESC);
```

---

## 6. quiz_answers

| Medan | Jenis | Kekangan | Penerangan |
| --- | --- | --- | --- |
| id | `SERIAL PRIMARY KEY` | NOT NULL | |
| quiz_attempt_id | `INTEGER` | NOT NULL, FK → quiz_attempts(id) | |
| question_id | `INTEGER` | NOT NULL, FK → questions(id) | |
| data_jawapan | `JSONB` | NULL | NULL sehingga submit. Struktur ikut jenis soalan (lihat 1.9) |
| adalah_betul | `BOOLEAN` | NULL | NULL sehingga submit. Dikira oleh pelayan |
| created_at | `TIMESTAMPTZ` | NOT NULL, DEFAULT `NOW()` | |
| updated_at | `TIMESTAMPTZ` | NOT NULL, DEFAULT `NOW()` | |

### Struktur data_jawapan Mengikut Jenis Soalan

| Jenis Soalan | Bentuk data_jawapan |
| --- | --- |
| aneka_pilihan | `{"pilihan": "A"}` |
| isi_tempat_kosong | `{"teks": "45"}` |
| betul_salah | `{"nilai": true}` |
| padanan | `{"pasangan": [{"kiri": "A", "kanan": "X"}, {"kiri": "B", "kanan": "Y"}]}` |

### Indeks

```sql
CREATE INDEX idx_answers_attempt_id ON quiz_answers(quiz_attempt_id);
CREATE INDEX idx_answers_question_id ON quiz_answers(question_id);
-- Setiap percubaan hanya ada 10 jawapan, jadi indeks komposit kurang kritikal untuk MVP
```

---

## Relationships (Foreign Keys)

```sql
ALTER TABLE tahun ADD CONSTRAINT fk_tahun_subject
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE;

ALTER TABLE topics ADD CONSTRAINT fk_topics_tahun
  FOREIGN KEY (tahun_id) REFERENCES tahun(id) ON DELETE CASCADE;

ALTER TABLE questions ADD CONSTRAINT fk_questions_topic
  FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE;

ALTER TABLE quiz_attempts ADD CONSTRAINT fk_attempts_topic
  FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE;

ALTER TABLE quiz_answers ADD CONSTRAINT fk_answers_attempt
  FOREIGN KEY (quiz_attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE;

ALTER TABLE quiz_answers ADD CONSTRAINT fk_answers_question
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE SET NULL;
```

**Nota**: `fk_answers_question` guna `ON DELETE SET NULL` supaya jika soalan dipadam, rekod jawapan sejarah kekal (dengan `question_id = NULL`). Aplikasi mengendalikan kes ini dengan memaparkan "Soalan telah dipadam."

---

## Peraturan Integriti Aplikasi

Peraturan ini dikuatkuasakan di lapisan aplikasi (bukan constraint DB):

1. **Had 10 soalan aktif**: `COUNT(*) WHERE topic_id = X AND jenis_soalan = Y AND tahap_kesukaran = Z AND status = 'aktif'` tidak boleh > 10.
2. **Percubaan aktif berganda**: untuk MVP, dibenarkan. Tiada constraint unik.
3. **Bilangan jawapan**: setiap percubaan mesti ada tepat 10 QuizAnswer (dicipta semasa POST /quiz-attempts).
4. **Penggredan**: `adalah_betul` dikira oleh pelayan, bukan klien (ADR-0004).

---

## Strategi Seed

### Data Rujukan (Wajib - seed sebelum guna)

- 1 subject (Matematik)
- 1 tahun (Tahun 6)
- 3 topik (Nombor dan Operasi, Ukuran dan Geometri, Pengurusan Data)

Gunakan migration Alembic untuk seed data rujukan.

### Soalan MVP (90 Soalan)

90 soalan = 3 topik x 3 tahap x 10 soalan. Pilihan:

1. **Seed SQL**: sediakan fail SQL dengan 90 INSERT statements. Sesuai untuk pembangunan.
2. **UI Admin**: masukkan melalui borang cipta soalan. Sesuai untuk pengeluaran.
3. **Gabungan**: seed 10-20 soalan contoh untuk pembangunan, selebihnya melalui UI.

Untuk MVP, pendekatan 1 (seed SQL) disyorkan dengan pilihan untuk memasukkan tambahan melalui UI.
