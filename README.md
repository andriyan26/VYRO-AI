# VYRO AI — Create. Share. Connect. Experience.

VYRO AI adalah platform media sosial video vertikal modern dengan integrasi Artificial Intelligence menyeluruh, editor video berbasis browser dengan engine FFmpeg, interaksi sosial realtime via WebSocket, dan konsep autentikasi interaktif **"Lumen Pull-Cord Lamp"**.

---

## 🌟 Fitur Utama

1. **Sistem Autentikasi Interaktif (100% Mengacu pada Video `KONSEP LOGIN.mp4`):**
   * Saklar lampu gantung interaktif dengan tarikan berbasis fisika elastis (*pull cord drag & release*).
   * Efek suara saklar klik prosedural & getaran filamen hangat via Web Audio API tanpa dependensi file eksternal.
   * Transisi dari karakter lampu tidur (`- -` dan `z Z z`) menjadi karakter ceria tersenyum merona (`^ ‿ ^`).
   * Pendaran cahaya amber-gold radial dan partikel debu cahaya melayang (*ambient dust motes*).
   * Kartu formulir *dark glassmorphism* untuk Login, Register, Forgot Password, dan Reset Password.
   * Tombol "sound on / sound off" di pojok kanan bawah.

2. **Core Social Video Feed (Format Vertikal 9:16):**
   * Snap scrolling vertikal mulus (*For You*, *Following*, dan *Trending*).
   * Like dengan animasi burst hati dan efek audio pop.
   * Drawer komentar real-time yang membedakan komentar manusia dan komentar AI berpenanda khusus.
   * Bookmark, Follow kreator, share link instan, serta piringan audio berputar (*spinning vinyl disk*).

3. **AI Social Interaction Engine:**
   * 7 Karakter AI transparan dengan kepribadian unik: **Sparky (Humorous)**, **Amara (Friendly)**, **Zephyr (Enthusiastic)**, **Kaelen (Curious)**, **Sophia (Informative)**, **Nova (Supportive)**, dan **Vance (Critical Reviewer)**.
   * Analisis visual video otomatis (suasana, kategori, mood, dan tagar rekomendasi).
   * Tombol "Ask AI Persona" untuk memicu komentar kontekstual langsung di kolom komentar.

4. **Professional Browser Video Editor:**
   * Timeline multi-track (Video, Audio, Text Overlay).
   * Real-time trimming (slider durasi awal dan akhir).
   * Filter gradasi warna: Warm Gold ✨, Cinematic Drama, Cyberpunk Neon, dan Noir B&W.
   * Kontrol kecepatan video (0.5x, 1x, 1.5x, 2x).
   * Pengatur posisi teks judul di atas kanvas.
   * **Ekspor Nyata**: Menggunakan FFmpeg backend untuk memotong dan me-render file MP4 sesungguhnya.

5. **Creator Studio & Analytics:**
   * Statistik performa video (Views, Likes, Comments, Engagement Rate).
   * Manajemen konten dan penyimpanan draft editor.
   * AI Creator Assistant untuk membuat judul, caption, dan tagar otomatis.

6. **Admin Dashboard (Futuristic SciFI Theme):**
   * Kendali penuh Role-Based Access Control (RBAC: USER, CREATOR, ADMIN).
   * Moderasi konten video dan penghapusan video bermasalah.
   * Konfigurasi sistem AI (toggle on/off, delay, karakter aktif).

7. **Komunikasi Realtime:**
   * Direct Messages personal realtime bertenaga Socket.IO.
   * Pusat notifikasi aktivitas like, follow, dan respon AI.

---

## 🚀 Cara Menjalankan

Lihat panduan lengkap di [`docs/SETUP.md`](docs/SETUP.md).

```bash
# 1. Jalankan Backend Server
cd "c:\laragon\www\VRYO AI\server"
node dist/index.js

# 2. Jalankan Frontend Client
cd "c:\laragon\www\VRYO AI\client"
npm run dev -- --host
```

Akses browser di: **`http://localhost:5173/`**
Akun Admin Siap Pakai: `admin@vyro.ai` / `Admin123!`

