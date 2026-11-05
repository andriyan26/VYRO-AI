# VYRO AI — Panduan Instalasi dan Pengoperasian

VYRO AI adalah platform media sosial berbasis video bertenaga Artificial Intelligence yang dilengkapi browser video editor multi-track, feed 9:16 vertikal, real-time messaging, AI interaction engine, dan sistem autentikasi interaktif "Lumen Pull-Cord Lamp".

---

## 1. Prasyarat Sistem
* **Node.js**: v18+ (Direkomendasikan v18.8.0 atau lebih baru)
* **MySQL**: 8.0+ (Tersedia default di Laragon port 3306)
* **FFmpeg**: Terintegrasi otomatis melalui `@ffmpeg-installer/ffmpeg`

---

## 2. Struktur Proyek
```
c:\laragon\www\VRYO AI\
├── client/              # React + Vite + TypeScript + Tailwind CSS + Framer Motion
├── server/              # Node.js + Express + TypeScript + Prisma + Socket.IO
├── uploads/             # Direktori penyimpanan media lokal (video, avatar, sound)
│   ├── videos/
│   ├── thumbnails/
│   ├── avatars/
│   └── sounds/
└── docs/                # Dokumentasi arsitektur, API, dan database
```

---

## 3. Database & Seeder
Database MySQL yang digunakan adalah `vyro_ai_db`.

Untuk menjalankan sinkronisasi schema dan seeder data awal:
```bash
cd "c:\laragon\www\VRYO AI\server"
npx prisma db push
npx prisma generate
npx tsx prisma/seed.ts
```

### Akun Awal yang Disediakan Seeder:
* **Administrator**:
  * Email: `admin@vyro.ai`
  * Password: `Admin123!`
  * Role: `ADMIN`
* **Creator Sarah**:
  * Email: `sarah@vyro.ai`
  * Password: `Password123!`
  * Role: `CREATOR`
* **Creator Marcus**:
  * Email: `marcus@vyro.ai`
  * Password: `Password123!`
  * Role: `CREATOR`
* **Viewer Maya**:
  * Email: `maya@vyro.ai`
  * Password: `Password123!`
  * Role: `USER`

---

## 4. Menjalankan Aplikasi

### Menjalankan Backend Server (Port 5000):
```bash
cd "c:\laragon\www\VRYO AI\server"
node dist/index.js
# Atau dalam mode development:
npm run dev
```

### Menjalankan Frontend Client (Port 5173):
```bash
cd "c:\laragon\www\VRYO AI\client"
npm run dev -- --host
```

Akses browser:
* **Desktop / Web**: `http://localhost:5173/`
* **Mobile / Smartphone (Jaringan Lokal)**: `http://192.168.1.10:5173/` (atau IP LAN yang tertera di terminal Vite)

