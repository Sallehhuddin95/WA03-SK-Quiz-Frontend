# API: BFF MVP Proxy

## Status

MVP - Diluluskan

## Rujukan

- `docs/frontend/FRONTEND_GUIDELINE.md` Bahagian 5 (BFF Data Flow)
- `docs/shared/api-contract.md`
- `docs/adr/0003-use-server-managed-sessions.md`
- `specs/api/reference-data.md`, `specs/api/questions.md`, `specs/api/quiz-attempts.md`

---

## Gambaran Keseluruhan

Next.js App Router bertindak sebagai Backend-for-Frontend (BFF). Route handlers di `src/app/api/v1/` menerima panggilan dari browser, kemudian meneruskan permintaan ke backend FastAPI.

Untuk MVP, BFF adalah proxy telus (transparent pass-through). Ia tidak menambah, mengubah, atau menggugurkan data. Kontrak yang diterima dan dihantar adalah sama dengan kontrak backend yang didokumenkan dalam `specs/api/*.md`.

### Seni Bina

```text
Browser (TanStack Query, api-client)
  -> Next.js BFF route handler (/api/v1/*)
    -> FastAPI backend (API_URL, default http://localhost:8000/api/v1)
```

### Kenapa BFF Wujud

- Menyembunyikan URL backend dari browser. Klien hanya tahu laluan relatif `/api/v1/*` pada Next.js sendiri.
- Membolehkan `API_URL` kekal server-side sahaja, tidak terdedah kepada JavaScript klien.
- Menyediakan titik tetap untuk auth session (ADR-0003), agregasi, dan transformasi pada masa hadapan tanpa mengubah client.

---

## Route Table

Semua laluan BFF memantulkan kontrak backend `/api/v1/*` secara 1:1.

| Laluan BFF (Next.js) | Method | Upstream (FastAPI) | Spec Rujukan |
| --- | --- | --- | --- |
| `/api/v1/subjects` | GET | `/subjects` | `reference-data.md` |
| `/api/v1/subjects/{id}/tahun` | GET | `/subjects/{id}/tahun` | `reference-data.md` |
| `/api/v1/tahun/{id}/topics` | GET | `/tahun/{id}/topics` | `reference-data.md` |
| `/api/v1/questions` | GET, POST | `/questions` | `questions.md` |
| `/api/v1/questions/{id}` | GET, PUT, DELETE | `/questions/{id}` | `questions.md` |
| `/api/v1/questions/{id}/status` | PATCH | `/questions/{id}/status` | `questions.md` |
| `/api/v1/quiz-attempts` | GET, POST | `/quiz-attempts` | `quiz-attempts.md` |
| `/api/v1/quiz-attempts/{id}/submit` | POST | `/quiz-attempts/{id}/submit` | `quiz-attempts.md` |
| `/api/v1/quiz-attempts/{id}/result` | GET | `/quiz-attempts/{id}/result` | `quiz-attempts.md` |

Kontrak request, response, validation, dan error bagi setiap laluan adalah seperti yang didokumenkan dalam spec rujukan. BFF tidak memperkenalkan kontrak baru.

---

## Peraturan Proxy (Pass-Through)

1. Method HTTP, path, query string, dan body dihantar tanpa perubahan.
2. Query string dari `request.nextUrl.search` diteruskan asal ke upstream.
3. Body JSON diteruskan sebagai teks asal. Hanya header `content-type` dipindahkan.
4. Envelope respons tidak diubah: `{ "data": ... }`, `{ "data": [...], "meta": {...} }`, dan `{ "detail": {...} }` dipassthrough.
5. Status code upstream dipelihara (200, 201, 204, 400, 404, 409, 422, dan lain-lain).
6. Fetch upstream menggunakan `cache: "no-store"`. BFF MVP tidak melakukan caching; caching kekal di TanStack Query (klien).
7. Timeout: 30 saat, sepadan dengan `TIMEOUT_MS` dalam `src/lib/api-client.ts`.

---

## Konfigurasi

| Env | Skop | Default | Keterangan |
| --- | --- | --- | --- |
| `API_URL` | Server-only (BFF) | `http://localhost:8000/api/v1` | Base URL backend FastAPI |
| `NEXT_PUBLIC_API_URL` | Client | Tiada | Override base URL api-client untuk bypass BFF. Guna hanya untuk debugging pembangunan |

### Peraturan

- `API_URL` mesti kekal server-side. Jangan tukar kepada `NEXT_PUBLIC_*`.
- `NEXT_PUBLIC_API_URL` yang diset akan mengalihkan panggilan api-client terus ke backend, memintas BFF. Ini tidak digalakkan untuk pengeluaran.
- Default api-client ialah `/api/v1` (laluan relatif ke Next.js sendiri), jadi aplikasi berfungsi tanpa konfigurasi tambahan.

---

## Error Shapes

### Backend Boleh Dicapai, Ralat Backend

Pass-through penuh. Status code dan badan ralat `{ "detail": { "mesej", "kod", "butiran" } }` dihantar asal seperti yang didokumenkan dalam spec API rujukan.

### BFF Tidak Dapat Mencapai Backend

Ralat ini dijana oleh BFF sendiri apabila fetch upstream gagal atau melebihi timeout:

| Situasi | Status | Badan Ralat |
| --- | --- | --- |
| Timeout (30 saat) | 504 | `{ "detail": { "mesej": "Permintaan mengambil masa terlalu lama. Sila cuba lagi.", "kod": "MASA_TAMAT" } }` |
| Sambungan gagal / DNS / ralat rangkaian | 502 | `{ "detail": { "mesej": "Gagal menyambung ke pelayan. Sila periksa sambungan anda.", "kod": "RALAT_RANGKAIAN" } }` |

Kedua-dua mesej sepadan dengan yang sedia dikenal oleh `src/lib/api-client.ts`, jadi pengendalian ralat UI sedia ada terus berfungsi tanpa perubahan.

---

## Keselamatan

- MVP: tiada autentikasi pada laluan BFF. Backend MVP juga tanpa auth.
- ADR-0003: apabila backend sokong session, auth dan authorization akan dikuatkuasakan di lapisan BFF.
- Jangan dedahkan `API_URL` kepada JavaScript klien.

---

## Validation

- BFF MVP tidak melakukan validasi sendiri. Validasi kekal di backend, seperti didokumenkan dalam `specs/api/*.md`.
- BFF hanya meneruskan; tiada logik perniagaan dalam route handlers.

---

## Notes

- Versioning: BFF memantulkan `/api/v1` untuk MVP supaya `specs/api/*.md` kekal sebagai satu sumber kebenaran untuk kedua-dua lapisan. Jika backend menukar kontrak, perubahan hanya perlu di `API_URL` atau mapping route di BFF.
- Agregasi (contohnya dashboard yang menggabungkan beberapa endpoint) adalah kerja masa depan di BFF, bukan skop MVP.
- Same-origin: panggilan klien ke `/api/v1/*` adalah same-origin, jadi tiada keperluan CORS.
- Fail bersama: `src/lib/bff-proxy.ts` mengandungi satu fungsi `forwardRequest` yang digunakan oleh semua route handler. Jangan ulang logik proxy dalam setiap file route.
- Route handlers tidak boleh dipanggil terus dari Server Components dengan URL relatif. Gunakan laluan mutlak atau kekalkan penggunaan di Client Components seperti sedia ada.

---

## Definition of Done

- [ ] Semua 9 laluan route handler wujud di `src/app/api/v1/` dan meneruskan permintaan dengan betul.
- [ ] `src/lib/api-client.ts` default ke `/api/v1`.
- [ ] Envelope dan error contract tidak berubah dari segi bentuk.
- [ ] `typecheck`, `lint`, dan `build` lulus.
- [ ] Tiada `API_URL` terdedah kepada client bundle.