# 🚀 PANDUAN LENGKAP DEPLOY VYRO AI KE HOSTINGER (SOLUSI 403 FORBIDDEN)

Jika Anda melihat halaman **403 Forbidden** di domain Anda (`vyro.tplp004.com`), itu terjadi karena sebelumnya file `index.html` berada di dalam subfolder `client/dist/` dan bukan langsung di root `public_html`.

**Paket ZIP terbaru (`VYRO_AI_HOSTINGER_DEPLOY.zip`) sudah ditata ulang secara otomatis agar saat diekstrak ke dalam `public_html`, file `index.html`, `assets/`, dan `.htaccess` langsung berada di tempat yang tepat sehingga 403 Forbidden hilang seketika!**

---

## 🔑 KREDENSIAL DATABASE ANDA:
- **Nama Database:** `u975115372_Vyroaiandri123`
- **Username MySQL:** `u975115372_Vyroaiandri123`
- **Password:** `Vyroaiandri123`
- **Host / Port:** `localhost:3306`

File `.env` di dalam paket ZIP sudah otomatis dihubungkan dengan kredensial di atas!

---

## 📦 STRUKTUR FILE SETELAH DIEKSTRAK DI `public_html`:
```text
public_html/
├── index.html              <-- Frontend UI utama (Mencegah 403 Forbidden)
├── assets/                 <-- File CSS, JS bundle Vite
├── .htaccess               <-- Konfigurasi LiteSpeed/Apache (Routing SPA & Proxy API)
├── uploads/                <-- Video MP4, musik, avatar, thumbnail
├── index.js                <-- Startup file Node.js di root public_html
├── package.json            <-- Dependencies Node.js
├── vyro_ai_database.sql    <-- Database dump (Import ke phpMyAdmin)
└── server/                 <-- Backend Express + Prisma
    ├── .env                <-- Berisi koneksi database Hostinger Anda
    ├── dist/index.js       <-- File API yang sudah di-compile
    └── prisma/
```

---

## 🛠️ LANGKAH CEPAT DEPLOY KE HOSTINGER:

### LANGKAH 1: IMPORT DATABASE (PHPMYADMIN)
1. Buka **phpMyAdmin** pada database `u975115372_Vyroaiandri123`.
2. Klik tab **Import** di atas.
3. Pilih file **`vyro_ai_database.sql`**.
4. Klik **Go / Import**. (Database langsung terisi lengkap tanpa error permission).

### LANGKAH 2: EKSTRAK FILE ZIP KE `public_html`
1. Buka **File Manager** di Hostinger hPanel.
2. Masuk ke folder **`public_html`**.
3. Jika sebelumnya ada file atau folder lama yang salah ekstrak, hapus atau kosongkan `public_html`.
4. Upload file **`VYRO_AI_HOSTINGER_DEPLOY.zip`** ke dalam `public_html`.
5. Klik kanan file ZIP > pilih **Extract** (pilih direktori ekstrak: `public_html`).
6. Pastikan file `index.html` dan folder `assets` muncul langsung di dalam `public_html`.
7. Buka browser dan buka `https://vyro.tplp004.com/` — **Tampilan VYRO AI langsung muncul dan 403 Forbidden hilang!**

### LANGKAH 3: AKTIFKAN NODE.JS APPLICATION DI HOSTINGER
1. Di hPanel Hostinger, cari dan buka menu **Node.js**.
2. Klik **Create Application**:
   - **Node.js Version:** `v18.x` atau `v20.x`
   - **Application Mode:** `Production`
   - **Application Root:** `public_html`
   - **Application Startup File:** `index.js`
3. Masuk ke tab **NPM Packages**, klik **Install** dependencies.
4. Klik **Start / Restart Application**.

---

### 🔑 AKUN LOGIN DEFAULT:
- **Superadmin:** Username: `admin` | Password: `Admin@123` *(Role: ADMIN)*
- **Creator Pro:** Username: `sarah.lens` | Password: `Creator@123` *(Role: CREATOR)*
- **User Biasa:** Username: `alex_runner` | Password: `User@123` *(Role: USER)*
