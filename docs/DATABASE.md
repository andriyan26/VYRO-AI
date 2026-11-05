# VYRO AI — Dokumentasi Database Schema

Database: `vyro_ai_db` (MySQL 8.0 via Prisma ORM)

---

## 1. Tabel Utama & Relasi

| Tabel | Deskripsi | Relasi Utama |
|---|---|---|
| `users` | Data akun pengguna, kredensial, role, bio | `refresh_tokens`, `videos`, `video_likes`, `comments`, `bookmarks`, `follows`, `messages` |
| `refresh_tokens` | Token refresh session untuk Remember Me aman | Relasi ke `users` (Cascade delete) |
| `categories` | Kategori video (Creative, Food, Tech, dll) | Relasi ke `videos` |
| `sounds` | Sound library dan audio track | Relasi ke `videos` |
| `videos` | Metadata video, URL streaming, counts | Relasi ke `users`, `categories`, `sounds`, `comments`, `likes`, `bookmarks` |
| `video_views` | Riwayat tayangan unik video | Relasi ke `videos`, `users` |
| `video_likes` | Rekaman like per user dan video | Unique `(videoId, userId)` |
| `bookmarks` | Video yang disimpan user | Unique `(videoId, userId)` |
| `comments` | Komentar manusia dan interaksi AI persona | Relasi ke `videos`, `users`, `ai_characters` |
| `follows` | Hubungan sosial follower/following | Unique `(followerId, followingId)` |
| `hashtags` | Entri tag unik | Relasi ke `video_hashtags` |
| `video_hashtags` | Many-to-many relasi video dan hashtag | Relasi composite `(videoId, hashtagId)` |
| `conversations` | Wadah percakapan direct message | Unique `(user1Id, user2Id)` |
| `messages` | Pesan teks dan status dibaca | Relasi ke `conversations`, `users` |
| `notifications` | Notifikasi aktivitas sosial & sistem | Relasi ke `users` |
| `ai_characters` | Karakter AI transparan dengan kepribadian | Digunakan pada `comments`, `ai_interactions` |
| `ai_interactions` | Jadwal dan riwayat interaksi AI | Relasi ke `videos`, `ai_characters` |
| `ai_analyses` | Hasil analisis konteks dan kualitas video | Relasi 1-to-1 ke `videos` |
| `ai_settings` | Konfigurasi global AI oleh Administrator | Key-value store sistem |
| `video_drafts` | Draft timeline editor sebelum render | Relasi ke `users` |
| `audit_logs` | Catatan aktivitas keamanan & administrator | Relasi ke `users` |

