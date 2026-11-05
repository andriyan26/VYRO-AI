# VYRO AI — Dokumentasi REST API

Base URL: `http://localhost:5000/api`

---

## 1. Authentication
* `POST /auth/register` — Mendaftarkan user baru (USER / CREATOR).
* `POST /auth/login` — Login user, mengembalikan JWT `accessToken` dan `refreshToken`.
* `GET /auth/me` — Mendapatkan profil user yang sedang login (Bearer token).
* `POST /auth/forgot-password` — Mengirim/membuat token reset password.
* `POST /auth/reset-password` — Mengupdate password dengan reset token.
* `POST /auth/logout` — Menghapus refresh token dari database.

---

## 2. Videos & Feed
* `GET /videos/feed?type=foryou|following|trending&page=1&limit=5` — Mengambil feed video vertikal 9:16.
* `GET /videos/:id` — Detail video dan counter view.
* `POST /videos/:id/like` — Toggle like video.
* `POST /videos/:id/bookmark` — Toggle simpan video ke koleksi.
* `POST /videos/upload` — Upload video baru (hanya CREATOR/ADMIN) menggunakan Multer.
* `DELETE /videos/:id` — Menghapus video (hanya owner atau ADMIN).

---

## 3. Comments & AI Personas
* `GET /comments/:videoId` — Mengambil daftar komentar (manusia dan karakter AI transparan).
* `POST /comments/:videoId` — Menambahkan komentar manusia.
* `POST /comments/:commentId/like` — Menyukai komentar.
* `POST /ai/comment` — Menghasilkan komentar kontekstual dari salah satu karakter AI (Sparky, Amara, Zephyr, Kaelen, Sophia, Nova, Vance).
* `POST /ai/analyze` — Analisis video otomatis (konteks, mood, tags, caption).
* `POST /ai/assistant/suggestions` — AI Creator Assistant untuk caption, hashtag, dan ide konten.

---

## 4. Video Editor (FFmpeg Engine)
* `POST /editor/export` — Render dan publikasi video hasil edit dari browser editor (trim, speed, filter warna, text overlay).
* `POST /creator/drafts` — Menyimpan status timeline editor sebagai draft.
* `GET /creator/drafts` — Mengambil daftar draft kreator.

---

## 5. Direct Messages & Sockets
* `GET /messages/conversations` — Daftar percakapan.
* `GET /messages/:conversationId` — Riwayat pesan dalam percakapan.
* `POST /messages/send` — Mengirim pesan baru ke user.
* **WebSocket Events (Socket.IO)**:
  * `join_user(userId)` — Bergabung ke channel notifikasi & DM pribadi.
  * `join_video(videoId)` — Bergabung ke room video untuk live comments.
  * `new_comment` & `comment_received` — Siaran komentar realtime.
  * `send_direct_message` & `message_received` — Siaran chat realtime.

---

## 6. Admin Panel
* `GET /admin/overview` — Statistik sistem global.
* `GET /admin/users` — Daftar seluruh user dan filter role.
* `PUT /admin/users/:userId` — Mengubah role (USER, CREATOR, ADMIN) & status verifikasi.
* `GET /admin/videos` — Moderasi seluruh konten video.
* `DELETE /admin/videos/:videoId` — Hapus video terlarang.
* `GET /ai/settings` & `PUT /ai/settings` — Pengaturan kebijakan interaksi AI.

