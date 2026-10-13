# MSF - Mobile Sales Force

Aplikasi manajemen kunjungan dokter untuk Medical Representative (MR) PT Mersifarma.
Proyek ini adalah case study Software Engineer dengan tiga fitur utama: **Call List**, **Call Plan**, dan **Call Actual**, lengkap dengan approval workflow oleh atasan langsung.

> Seluruh data seed (user, dokter, alamat, telepon, produk, region) adalah **data fiktif** untuk keperluan uji dan tidak merepresentasikan orang atau lokasi nyata.

---

## Daftar Isi

1. [Tech Stack](#tech-stack)
2. [Arsitektur](#arsitektur)
3. [Struktur Repository](#struktur-repository)
4. [Cara Menjalankan di Laptop Lokal](#cara-menjalankan-di-laptop-lokal)
5. [Akun Demo](#akun-demo)
6. [Daftar Endpoint](#daftar-endpoint)
7. [Asumsi](#asumsi)
8. [Skenario Test Manual](#skenario-test-manual)
9. [Jawaban atas Tantangan](#jawaban-atas-tantangan)
10. [Refleksi dan Pemanfaatan Tools](#refleksi-dan-pemanfaatan-tools)
11. [Batasan Saat Ini](#batasan-saat-ini)

---

## Tech Stack

| Lapisan | Teknologi |
|---|---|
| Backend | PHP 8.2+ dengan Laravel (REST API) |
| Autentikasi | JWT access token (guard `api`) + refresh token di cookie HttpOnly |
| Database | MySQL |
| Frontend | React + TypeScript (Vite) |
| HTTP client | axios (instance terpusat, interceptor, service per fitur) |
| Routing | react-router |
| Pengujian API | Postman (koleksi di `docs/`) |

---

## Arsitektur

```
 Browser (React SPA, http://127.0.0.1:5173)
   |  Access token: disimpan di memory (React state)
   |  Refresh token: cookie HttpOnly (tidak terbaca JavaScript)
   v
 REST API Laravel (http://127.0.0.1:8000/api)
   Route -> Controller -> Model / Enum -> Database
```

### Backend

- **Controller** menangani request, validasi input, dan aturan bisnis; respons dibungkus `ApiResponse` dengan format seragam `{ success, message, data | errors }`.
- **Enum PHP** (`CallListStatus`, `CallPlanStatus`, `VisitType`, `RoleName`) menjadi satu definisi nilai dan tempat aturan transisi status.
- **Resource** membentuk respons JSON agar field yang dikirim terkontrol.
- **Database**: foreign key, unique constraint, dan transaksi menjaga integritas data (contoh: unique dokter + tanggal untuk mencegah double visit).

### Frontend

```
Halaman -> Hook (useFetch / useAction) -> Service -> Instance axios -> API
```

- Halaman tidak memanggil axios langsung; semua lewat service dan hook.
- `AuthProvider` menyimpan access token di **memory**, memasang interceptor untuk menyisipkan token, dan otomatis memanggil `/refresh` saat token habis (401) lalu mengulang request.
- `parseError` mengubah error API menjadi pesan yang mudah dibaca dan error per field.
- Komponen dropdown dibuat custom (bukan `<select>` native) agar tetap terlihat saat berbagi layar.

### Alur Autentikasi

1. Login: backend mengembalikan access token (1 jam) di body dan menyimpan refresh token (7 hari) di cookie HttpOnly.
2. Setiap request membawa `Authorization: Bearer <access_token>`.
3. Token habis (401): frontend memanggil `POST /api/refresh` (cookie ikut otomatis), mendapat token baru, lalu mengulang request.
4. Halaman di-reload: access token (di memory) hilang, sesi dipulihkan lewat `/refresh`.
5. Logout: refresh token dicabut di server dan cookie dihapus.

Refresh token disimpan di database sebagai **hash SHA-256** dan dirotasi pada setiap refresh.

---

## Struktur Repository

```
msf/
├── README.md
├── docs/               # koleksi Postman, screenshot/rekaman pengujian, desain acuan
├── backend/            # Laravel API (migration dan seeder data master di dalamnya)
└── frontend/           # React + TypeScript
```

---

## Cara Menjalankan di Laptop Lokal

### Prasyarat

| Kebutuhan | Versi yang disarankan |
|---|---|
| PHP | 8.2 atau lebih baru (ekstensi: mbstring, openssl, pdo, tokenizer, xml, ctype, json, serta sqlite3 atau pdo_mysql sesuai database) |
| Composer | 2.x |
| Node.js | 20 atau lebih baru (dengan npm) |
| Database | <!-- TODO: SQLite (tanpa instalasi tambahan) atau MySQL 8 --> |
| Git | terbaru |

### PENTING: gunakan host yang sama

Buka aplikasi **hanya** lewat `http://127.0.0.1:5173` dan jalankan backend di `127.0.0.1:8000`. Jangan mencampur `localhost` dan `127.0.0.1`: browser menganggapnya situs berbeda sehingga cookie refresh token tidak terkirim dan sesi tidak bisa dipulihkan.

### 1. Clone repository

```bash
git clone https://github.com/wildanardian/mobile-sales-force.git
cd msf
```

### 2. Menjalankan backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
```

Atur database di `backend/.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=msf
DB_USERNAME=root
DB_PASSWORD=
```

Buat database kosong bernama `msf` terlebih dahulu.

Pastikan variabel berikut ada di `backend/.env`:

```env
APP_URL=http://127.0.0.1:8000
APP_TIMEZONE=Asia/Jakarta
JWT_TTL=60
CORS_ALLOWED_ORIGINS=http://127.0.0.1:5173,http://localhost:5173
```

Lanjutkan:

```bash
php artisan migrate:fresh --seed
php artisan serve --host=127.0.0.1 --port=8000
```

Backend berjalan di `http://127.0.0.1:8000`. Biarkan terminal ini tetap terbuka.

### 3. Menjalankan frontend

Buka terminal baru:

```bash
cd frontend
npm install
cp .env.example .env
```

Isi `frontend/.env`:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

Jalankan:

```bash
npm run dev -- --host 127.0.0.1 --port 5173
```

Buka **http://127.0.0.1:5173** di browser.

### 4. Memeriksa bahwa aplikasi berjalan

1. Halaman login tampil.
2. Login memakai salah satu [akun demo](#akun-demo).
3. DevTools > Application > Cookies > `http://127.0.0.1:8000`: cookie `refresh_token` ada dengan flag **HttpOnly**.
4. Reload halaman: Anda tetap login (sesi dipulihkan lewat `/refresh`).

--------

### Mengulang dari data awal

```bash
cd backend
php artisan migrate:fresh --seed
```

### Pemecahan masalah

| Gejala | Penyebab dan solusi |
|---|---|
| Setelah login lalu reload, kembali ke halaman login | Frontend dan backend memakai host berbeda (`localhost` vs `127.0.0.1`). Samakan seperti bagian "gunakan host yang sama" |
| Console menampilkan error CORS | `CORS_ALLOWED_ORIGINS` di `backend/.env` belum memuat alamat frontend. Setelah mengubahnya jalankan `php artisan config:clear` |
| `401` pada `/refresh` saat pertama membuka aplikasi | Normal: belum ada sesi. Setelah login, request `/refresh` akan berstatus 200 |
| Error JWT secret atau class JWT tidak ditemukan | Jalankan `composer install` dan `php artisan jwt:secret` |
| Tanggal atau hari bergeser | Pastikan `APP_TIMEZONE=Asia/Jakarta` lalu `php artisan config:clear` |
| `unable to open database file` (SQLite) | Pastikan `backend/database/database.sqlite` ada |
| Perubahan `.env` tidak terbaca | `php artisan config:clear` |
| Port 8000 atau 5173 terpakai | Ganti port, dan sesuaikan `VITE_API_URL` serta `CORS_ALLOWED_ORIGINS` |

---

## Akun Demo

Password semua akun: `password`

<!-- TODO: verifikasi email dan password terhadap backend/database/seeders/UserSeeder.php -->

| Role | Email | Atasan langsung | Keterangan |
|---|---|---|---|
| MR | `mr@gmail.com` | DM | Membuat Call List, Call Plan, Call Actual |
| MR (kedua) | <!-- TODO: isi email MR kedua --> | DM | Untuk menguji aturan lintas user |
| DM | `dm@gmail.com` | RSM | Menyetujui Call List MR; mengajukan Call List ke RSM |
| RSM | `rsm@gmail.com` | MM | Menyetujui Call List DM; mengajukan ke MM |
| MM | `mm@gmail.com` | tidak ada | Menyetujui Call List RSM; tidak membuat Call List |

Hierarki approval: **MR -> DM -> RSM -> MM** (single-level, hanya atasan langsung).

---

## Daftar Endpoint

Semua endpoint berprefix `/api`. Selain `login`, `refresh`, dan `logout`, wajib header `Authorization: Bearer <access_token>`.

<!-- TODO: cocokkan seluruh tabel dengan `php artisan route:list --path=api` (nama endpoint dokter, edit/resubmit, nama field approve) -->

### Autentikasi

| Method | Endpoint | Fungsi |
|---|---|---|
| POST | `/login` | Login, mengembalikan access token dan menyetel cookie refresh token |
| POST | `/refresh` | Token baru memakai cookie refresh token (dengan rotasi) |
| POST | `/logout` | Mencabut refresh token dan menghapus cookie |
| GET | `/me` | Data user yang login |

### Call List

| Method | Endpoint | Fungsi |
|---|---|---|
| POST | `/call-lists` | Membuat Call List bulanan (`period` `YYYY-MM`, `doctor_ids`, `submit` opsional) |
| GET | `/call-lists` | Daftar Call List milik user login |
| GET | `/call-lists/{id}` | Detail Call List, dokter, dan status |
| PATCH | `/call-lists/{id}/submit` | Mengajukan draft ke atasan langsung (menjadi `pending_approval`) |
| GET | `/call-lists/pending-approval` | Antrean Call List bawahan yang menunggu keputusan |
| PATCH | `/call-lists/{id}/approve` | Approve atau reject oleh atasan langsung |

### Call Plan

| Method | Endpoint | Fungsi |
|---|---|---|
| POST | `/call-plans` | Membuat Call Plan dari Call List approved |
| GET | `/call-plans` | Daftar Call Plan milik user login |

### Call Actual

| Method | Endpoint | Fungsi |
|---|---|---|
| POST | `/call-actuals` | Mengirim hasil kunjungan; jenis kunjungan ditentukan backend |
| GET | `/call-actuals` | Daftar Call Actual milik user login |

### Data pendukung

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/master-customers` (atau `/doctors`) | Daftar dokter (Master Customer List) |
| GET | `/products` | Daftar produk untuk detailing |

Format respons seragam:

```json
{ "success": true, "message": "...", "data": { } }
{ "success": false, "message": "...", "errors": { "field": ["..."] } }
```

| Kode | Arti |
|---|---|
| 401 | Token tidak valid atau sesi berakhir |
| 403 | Tidak berwenang (mis. bukan atasan langsung) |
| 404 | Data tidak ditemukan |
| 409 | Konflik dengan kondisi data (duplikat, status tidak sesuai) |
| 422 | Data tidak valid atau melanggar aturan |

---

## Asumsi

| # | Asumsi |
|---|---|
| 1 | MR dan FF adalah role yang sama (`mr`). Role: mr, dm, rsm, mm |
| 2 | "Master Customer List (MCL)" = tabel `master_customers`, berisi dokter |
| 3 | Approval **single-level** oleh atasan langsung: MR oleh DM, DM oleh RSM, RSM oleh MM. Tidak berjenjang |
| 4 | MR, DM dan RSM dapat membuat Call List; MM tidak (tidak punya atasan) |
| 5 | Call List adalah satu **bulan kalender**, satu per user per bulan. Hanya bulan berjalan atau mendatang |
| 6 | `period` disimpan sebagai tanggal 1 (`YYYY-MM-01`); API menerima dan mengembalikan `YYYY-MM` |
| 7 | `submitted` adalah status transit: submit langsung menghasilkan `pending_approval` dalam satu transaksi |
| 8 | Reject mengembalikan Call List ke `draft`; alasan dan keputusan tersimpan di `call_list_approvals` |
| 9 | Call List `approved` bersifat final (tidak dapat diubah atau dibatalkan) |
| 10 | Call Plan: satu dokter satu plan per hari, **global** (tidak dibedakan per MR). Tanggal dalam bulan Call List dan tidak di masa lalu |
| 11 | Call Actual adalah laporan kunjungan yang sudah selesai, sehingga semua kunjungan berstatus selesai (tidak ada In Progress) |
| 12 | `visit_type` (planned / unplan / non_target) ditentukan backend dari data, tidak dikirim klien |
| 13 | Planned: `visit_date` harus sama dengan `plan_date`. Tanggal kunjungan tidak di masa depan dan maksimal 7 hari ke belakang |
| 14 | Satu dokter satu kunjungan per hari, global, dicek terhadap seluruh `call_actuals` |
| 15 | Plan aktif yang belum diaktualisasi memesan slot dokter + tanggal: kunjungan tanpa plan ke dokter itu ditolak |
| 16 | Upload foto dan tanda tangan di-**mock**: hanya URL (http/https) yang dikirim dan disimpan |
| 17 | Detailing dicatat sebagai daftar produk tanpa jumlah |
| 18 | `region_id` untuk pengelompokan; otorisasi memakai relasi atasan langsung |
| 19 | Zona waktu aplikasi: Asia/Jakarta |


---

## Skenario Test Manual


| # | Skenario | Hasil yang diharapkan |
|---|---|---|
| 1 | MR membuat Call List, submit, DM approve, MR membuat Call Plan, lalu Call Actual | Semua berhasil; Call Actual tercatat `planned` |
| 2 | MR membuat Call Plan dari Call List yang belum approved | Ditolak (409) |
| 3 | MR mengunjungi dokter yang sama dua kali pada hari yang sama | Ditolak (409) |
| 4 | MR submit Call Actual tanpa foto | Ditolak (422) |
| 5 | Call List milik MR di-approve oleh RSM atau MM | Ditolak (403) |

**Note**: Untuk hasil test masing-masing skenario secara manual dari web atau dari postman ada di dalam folder /docs

---

## Jawaban atas Tantangan

**1. Double visit lintas jalur**:

   **Masalah**: dokter yang sama bisa tercatat dikunjungi dua kali di hari yang sama lewat jalur berbeda (Planned, Unplan, Non Target).

   **Solusi**:
   - Backend menolak (409) jika sudah ada Call Actual untuk dokter dan tanggal yang sama.
   - Database menjaga dengan `unique(doctor_id, visit_date)`, jadi aman dari request bersamaan.
   - Call Plan yang masih terbuka memesan slot dokter+tanggal, sehingga kunjungan tanpa plan tidak bisa menyerobot.
   - Penyimpanan Call Actual dan produknya berjalan dalam satu transaksi.

   **Asumsi**: aturan berlaku global, satu dokter hanya satu kunjungan per hari di seluruh sistem.

**2. Approval macet**: 
   Menambahkan notifikasi in-app berupa badge jumlah approval tertunda di topbar sudah diimplementasikan

**3. Reject setelah Call Plan dibuat**:
   **Masalah**: jika Call List ditolak setelah Call Plan sudah dibuat dari list tersebut, plan menjadi tidak valid.
   
   **Solusi**:
   - Call Plan hanya bisa dibuat dari Call List berstatus `approved`.
   - Karena approval hanya satu level (MR→DM, DM→RSM, RSM→MM) dan `approved` bersifat final, list yang sudah memiliki plan tidak bisa ditolak lagi.
   - Reject hanya mungkin saat `pending_approval`, saat itu belum ada plan. List kembali ke `draft` dengan alasan tersimpan di riwayat approval.

   **Catatan**: jika bisnis memakai approval berantai (reject oleh level atas setelah approve level bawah), plan yang sudah ada perlu dibatalkan atau dikunci. Ini tidak dibutuhkan pada desain saat ini.


**4. Call Actual di luar periode Call List**:
   Call Actual divalidasi di backend berdasarkan tanggal kunjungan, bukan tanggal input:
   - **Planned**: `visit_date` harus sama dengan `plan_date` pada Call Plan yang dipilih.
   - **Unplan**: hanya untuk dokter yang ada di Call List berstatus `approved` pada bulan `visit_date`.
   - **Non Target**: dokter yang tidak ada di Call List approved bulan tersebut. Kunjungan tetap bisa dicatat tetapi diberi tipe berbeda, sehingga tidak dihitung sebagai pencapaian target.
   - `visit_date` tidak boleh di masa depan dan paling lama 7 hari ke belakang.

   Batas 7 hari adalah **asumsi saya sendiri**, karena dokumen kasus tidak menyebutkan batas waktu pelaporan. Alasannya, MR perlu waktu wajar untuk melaporkan kunjungan yang tertunda (mis. kendala sinyal atau kunjungan di akhir pekan).

**5. Konsistensi validasi backend dan frontend**: 
   Backend sumber kebenaran, frontend memvalidasi untuk UX. Format error seragam dan parseError menampilkan pesan dari backend.
