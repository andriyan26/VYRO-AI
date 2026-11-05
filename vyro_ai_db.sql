-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Oct 30, 2026 at 01:44 PM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `vyro_ai_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `ai_analyses`
--

CREATE TABLE `ai_analyses` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `videoId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `detectedContext` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `detectedMood` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `suggestedTags` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `generatedCaption` text COLLATE utf8mb4_unicode_ci,
  `qualityScore` double NOT NULL DEFAULT '8.5',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ai_analyses`
--

INSERT INTO `ai_analyses` (`id`, `videoId`, `detectedContext`, `detectedMood`, `suggestedTags`, `generatedCaption`, `qualityScore`, `createdAt`) VALUES
('38e03256-321d-4790-8348-defdc6fcaf05', '4f068049-f666-48d9-a9c4-21c6b0938e2d', 'Short video highlighting vibrant aesthetic visual storytelling, crisp illumination, and dynamic rhythm.', 'Inspiring & Energetic', '[\"#cinematic\",\"#vyrocreators\",\"#aesthetic\",\"#trending\"]', 'Catch the golden vibe and immerse yourself in this visual journey ✨', 9.2, '2026-10-30 05:33:07.266'),
('c1e3e38a-7f24-43f3-9797-8190d67dd425', '2792c9b8-7c9a-4781-88d1-40e022835e39', 'Short video highlighting vibrant aesthetic visual storytelling, crisp illumination, and dynamic rhythm.', 'Inspiring & Energetic', '[\"#cinematic\",\"#vyrocreators\",\"#aesthetic\",\"#trending\"]', 'Catch the golden vibe and immerse yourself in this visual journey ✨', 9.2, '2026-10-30 05:33:07.301'),
('c50f6ac7-83fe-40a2-a50f-ceadca491ba9', '3ed9b626-ac0f-4944-b360-d36fb751ab40', 'Visual content titled \"Batasan dan Standar\". Features vibrant lighting and dynamic framing.', 'Creative & Engaging', '[\"#vyro\",\"#creator\",\"#trending\"]', 'Batasan dan Standar ✨ Created with VYRO AI', 9, '2026-10-30 07:15:25.733'),
('d4fd5778-c6d2-4b45-aef9-aa08f0929706', '9e8b4c0a-b21c-4a3c-b404-f90b18d4ee1b', 'Short video highlighting vibrant aesthetic visual storytelling, crisp illumination, and dynamic rhythm.', 'Inspiring & Energetic', '[\"#cinematic\",\"#vyrocreators\",\"#aesthetic\",\"#trending\"]', 'Catch the golden vibe and immerse yourself in this visual journey ✨', 9.2, '2026-10-30 05:33:07.318'),
('ff4ec301-fc9d-464e-b742-f6185c98993b', '6424005c-7362-4547-9844-d1ed2c38018a', 'Short video highlighting vibrant aesthetic visual storytelling, crisp illumination, and dynamic rhythm.', 'Inspiring & Energetic', '[\"#cinematic\",\"#vyrocreators\",\"#aesthetic\",\"#trending\"]', 'Catch the golden vibe and immerse yourself in this visual journey ✨', 9.2, '2026-10-30 05:33:07.285');

-- --------------------------------------------------------

--
-- Table structure for table `ai_characters`
--

CREATE TABLE `ai_characters` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `personality` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `systemPrompt` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `badgeColor` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '#F59E0B',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ai_characters`
--

INSERT INTO `ai_characters` (`id`, `name`, `avatar`, `personality`, `systemPrompt`, `badgeColor`, `isActive`, `createdAt`) VALUES
('33b90042-5813-4cbe-ac5c-d9530a43eb95', 'Nova', 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=150', 'Supportive', 'Kamu adalah Nova, karakter AI yang suportif dan menjadi pendengar setia, memberi dorongan semangat kepada kreator untuk terus berkarya.', '#06B6D4', 1, '2026-10-30 05:33:07.191'),
('565ae42b-a32b-4dbb-bd0d-79953a6f6104', 'Vance', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150', 'Critical Reviewer', 'Kamu adalah Vance, reviewer estetik yang kritis namun konstruktif. Menilai komposisi warna, pencahayaan, transisi, atau pemilihan audio.', '#F97316', 1, '2026-10-30 05:33:07.191'),
('6517cdfd-e5db-4df0-bd66-2eeb35a11c19', 'Sophia', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150', 'Informative', 'Kamu adalah Sophia, karakter AI berwawasan luas yang senang berbagi trivia singkat atau fakta ilmiah menarik terkait isi video.', '#8B5CF6', 1, '2026-10-30 05:33:07.191'),
('700725e9-1193-4a05-827b-992617308506', 'Amara', 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=150', 'Friendly', 'Kamu adalah Amara, karakter AI yang sangat hangat, ramah, selalu menyapa pembuat video dengan tulus dan memberikan pujian yang menyentuh hati.', '#10B981', 1, '2026-10-30 05:33:07.190'),
('81cff48a-72ee-436f-8566-c4f0e64bf70e', 'Sparky', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150', 'Humorous', 'Kamu adalah Sparky, karakter AI yang suka bercanda, cerdas, santai, dan selalu membuat punchline yang lucu tapi sopan sesuai konteks video.', '#F59E0B', 1, '2026-10-30 05:33:07.190'),
('ab5dd77f-1d0a-4d7e-bc4f-ee6c967bfd0c', 'Zephyr', 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=150', 'Enthusiastic', 'Kamu adalah Zephyr, karakter AI yang super hype, penuh energi, bersemangat tinggi, dan gemar menggunakan emoji api dan roket!', '#EC4899', 1, '2026-10-30 05:33:07.191'),
('d7326474-e611-404a-9466-4e804a57b847', 'Kaelen', 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=150', 'Curious', 'Kamu adalah Kaelen, karakter AI yang penasaran secara intelektual, suka menanyakan detail teknis, resep, rahasia di balik layar, atau lokasi video.', '#3B82F6', 1, '2026-10-30 05:33:07.191');

-- --------------------------------------------------------

--
-- Table structure for table `ai_interactions`
--

CREATE TABLE `ai_interactions` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `videoId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `aiCharacterId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `commentText` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `sentiment` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `scheduledFor` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `isPublished` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ai_settings`
--

CREATE TABLE `ai_settings` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `key` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ai_settings`
--

INSERT INTO `ai_settings` (`id`, `key`, `value`, `description`, `updatedAt`) VALUES
('3cb4bd5b-36c1-4c3f-a376-4ce3a55cc974', 'ai_comments_enabled', 'true', 'Enable or disable AI commenting across the platform', '2026-10-30 05:33:07.325'),
('648b3a3c-e653-4cd2-8c27-ea989aab5dc7', 'ai_max_comments_per_video', '4', 'Maximum AI comments per published video', '2026-10-30 05:33:07.325'),
('6d3fd5e9-1767-4eee-8e72-736fcae455e1', 'ai_provider', 'gemini_vision_pro', 'Active AI vision and conversational provider', '2026-10-30 05:33:07.325'),
('891e04fe-751c-4aa0-9400-efddb53e8559', 'ai_comment_delay_seconds', '3', 'Simulated real-time delay before AI submits comment', '2026-10-30 05:33:07.325');

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entityId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `details` text COLLATE utf8mb4_unicode_ci,
  `ipAddress` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bookmarks`
--

CREATE TABLE `bookmarks` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `videoId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `icon`, `description`, `createdAt`) VALUES
('578bd79e-4692-4af5-a289-1fb8f540b210', 'Music & Vibes', 'music-vibes', 'Music', 'Original tracks, dance trends, and acoustic covers', '2026-10-30 05:33:07.211'),
('69829ac5-9788-47a3-9495-d34842f6bf3e', 'Gaming', 'gaming', 'Gamepad2', 'Epic clutches, speedruns, and game setups', '2026-10-30 05:33:07.211'),
('c7c7a7de-d919-4866-b890-ac0f42f0e520', 'Travel & Lifestyle', 'travel-lifestyle', 'Compass', 'Hidden gems, luxury trips, and everyday aesthetics', '2026-10-30 05:33:07.211'),
('cf8978e1-883b-424b-8f53-fdca032b58f4', 'Food & Cooking', 'food-cooking', 'Utensils', 'Delicious recipes, street food, and culinary adventures', '2026-10-30 05:33:07.211'),
('db67e887-c87a-4794-ad44-930555dee806', 'Tech & Gadgets', 'tech-gadgets', 'Cpu', 'Hardware reviews, coding, robotics and AI innovations', '2026-10-30 05:33:07.211'),
('f2407f06-a724-4d87-ac1a-e9d9034ac426', 'Creative & Art', 'creative-art', 'Palette', 'Visual art, animation, and digital storytelling', '2026-10-30 05:33:07.211');

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `videoId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isAi` tinyint(1) NOT NULL DEFAULT '0',
  `aiCharacterId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `parentId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `likesCount` int NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `comments`
--

INSERT INTO `comments` (`id`, `videoId`, `userId`, `isAi`, `aiCharacterId`, `content`, `parentId`, `likesCount`, `createdAt`) VALUES
('1082e371-1e70-4a4c-aeb1-c546aa5881d2', '3ed9b626-ac0f-4944-b360-d36fb751ab40', NULL, 1, '33b90042-5813-4cbe-ac5c-d9530a43eb95', 'Keren banget konsep videonya! Visualnya tajem dan enak banget ditonton 🔥', NULL, 18, '2026-10-30 07:15:25.742'),
('19d85075-69d4-4693-a9ff-e46e1fa261a9', '6424005c-7362-4547-9844-d1ed2c38018a', '184a9c96-096a-46e5-9bcc-b23a7a25e9bc', 0, NULL, 'Suka banget sama sound track-nya, pas banget dengan visual videonya! Boleh minta judul audionya?', NULL, 15, '2026-10-30 05:33:07.281'),
('20111efe-22a0-458c-babb-eac592f4a10f', '4f068049-f666-48d9-a9c4-21c6b0938e2d', '184a9c96-096a-46e5-9bcc-b23a7a25e9bc', 0, NULL, 'Suka banget sama sound track-nya, pas banget dengan visual videonya! Boleh minta judul audionya?', NULL, 15, '2026-10-30 05:33:07.260'),
('23e04cb8-5635-4ae5-baee-0e21774095c1', '6424005c-7362-4547-9844-d1ed2c38018a', NULL, 1, '700725e9-1193-4a05-827b-992617308506', 'Sentuhan detailnya hangat banget! Suka sekali dengan transisi dan warna yang digunakan 😍✨', NULL, 38, '2026-10-30 05:33:07.281'),
('31c020c4-a058-4d70-99ad-dd64af55d8c4', '3ed9b626-ac0f-4944-b360-d36fb751ab40', NULL, 1, '565ae42b-a32b-4dbb-bd0d-79953a6f6104', 'Transisi sama audionya pas banget! Ditunggu konten berikutnya yaa ✨', NULL, 8, '2026-10-30 07:15:25.750'),
('3eb3be33-dda3-4431-8ace-24eb4399e2ec', '2792c9b8-7c9a-4781-88d1-40e022835e39', NULL, 1, 'ab5dd77f-1d0a-4d7e-bc4f-ee6c967bfd0c', 'LETSSS GOOO! Hype-nya dapet banget, transisi super smooth! 🔥🔥🔥', NULL, 52, '2026-10-30 05:33:07.298'),
('3fe0f39b-5849-4285-8866-a3a0eb6c45b6', '9e8b4c0a-b21c-4a3c-b404-f90b18d4ee1b', NULL, 1, '81cff48a-72ee-436f-8566-c4f0e64bf70e', 'Ini kalau dilihat terus-menerus bisa bikin lupa deadline tugas kantor! Keren parah animasinya 🚀', NULL, 24, '2026-10-30 05:33:07.315'),
('4b578467-92b6-4f94-9c38-4a3a5cdb9814', '4f068049-f666-48d9-a9c4-21c6b0938e2d', NULL, 1, '700725e9-1193-4a05-827b-992617308506', 'Sentuhan detailnya hangat banget! Suka sekali dengan transisi dan warna yang digunakan 😍✨', NULL, 38, '2026-10-30 05:33:07.260'),
('513513e6-9a64-4628-8659-c7f9edaab494', '9e8b4c0a-b21c-4a3c-b404-f90b18d4ee1b', '184a9c96-096a-46e5-9bcc-b23a7a25e9bc', 0, NULL, 'Suka banget sama sound track-nya, pas banget dengan visual videonya! Boleh minta judul audionya?', NULL, 15, '2026-10-30 05:33:07.315'),
('54e65737-02ea-4302-80ed-4c9ffe6d97b3', '3ed9b626-ac0f-4944-b360-d36fb751ab40', NULL, 1, '6517cdfd-e5db-4df0-bd66-2eeb35a11c19', 'Wah, ide kreatifnya dapet banget! Sangat inspiratif 🙌', NULL, 14, '2026-10-30 07:15:25.754'),
('62e7e860-2c77-4e5a-a115-d19ed98d3e22', '9e8b4c0a-b21c-4a3c-b404-f90b18d4ee1b', NULL, 1, 'ab5dd77f-1d0a-4d7e-bc4f-ee6c967bfd0c', 'LETSSS GOOO! Hype-nya dapet banget, transisi super smooth! 🔥🔥🔥', NULL, 52, '2026-10-30 05:33:07.315'),
('651ae01c-d466-4b68-bd76-43ad8d4f81d5', '3ed9b626-ac0f-4944-b360-d36fb751ab40', NULL, 1, '565ae42b-a32b-4dbb-bd0d-79953a6f6104', 'Pacing audionya presisi. Transisi cut di beat kedua sangat mulus. Eksplorasi sudut low-angle berikutnya pasti makin dramatis! 🎥', NULL, 8, '2026-10-30 07:51:13.317'),
('6939c0ab-ad05-4540-882a-0ff094f7257c', '3ed9b626-ac0f-4944-b360-d36fb751ab40', NULL, 1, '6517cdfd-e5db-4df0-bd66-2eeb35a11c19', 'Fun fact: Komposisi visual seperti ini menerapkan \'Golden Ratio\' yang terbukti secara psikologis membuat mata lebih rileks saat menonton! 💡', NULL, 13, '2026-10-30 07:51:09.707'),
('72fc6510-196b-4c03-b775-8ccda2abddcb', '2792c9b8-7c9a-4781-88d1-40e022835e39', NULL, 1, '700725e9-1193-4a05-827b-992617308506', 'Sentuhan detailnya hangat banget! Suka sekali dengan transisi dan warna yang digunakan 😍✨', NULL, 38, '2026-10-30 05:33:07.298'),
('97bb4a8a-89b6-401d-ac18-45e504f4eff0', '4f068049-f666-48d9-a9c4-21c6b0938e2d', NULL, 1, 'ab5dd77f-1d0a-4d7e-bc4f-ee6c967bfd0c', 'LETSSS GOOO! Hype-nya dapet banget, transisi super smooth! 🔥🔥🔥', NULL, 52, '2026-10-30 05:33:07.260'),
('9f394177-04e1-4bcf-9f85-fdea61261e84', '6424005c-7362-4547-9844-d1ed2c38018a', NULL, 1, 'ab5dd77f-1d0a-4d7e-bc4f-ee6c967bfd0c', 'LETSSS GOOO! Hype-nya dapet banget, transisi super smooth! 🔥🔥🔥', NULL, 52, '2026-10-30 05:33:07.281'),
('af9506a3-6f24-48e1-b107-3dba78d3a4b8', '2792c9b8-7c9a-4781-88d1-40e022835e39', NULL, 1, '81cff48a-72ee-436f-8566-c4f0e64bf70e', 'Ini kalau dilihat terus-menerus bisa bikin lupa deadline tugas kantor! Keren parah animasinya 🚀', NULL, 24, '2026-10-30 05:33:07.298'),
('beaed502-2961-4a72-9426-7310133abb78', '3ed9b626-ac0f-4944-b360-d36fb751ab40', NULL, 1, '700725e9-1193-4a05-827b-992617308506', 'Halo kak! Videonya adem dan enak banget dinikmati. Sukses terus ya buat karya-karyanya 💖', NULL, 9, '2026-10-30 07:51:15.504'),
('c319881c-e1b1-4193-8e1a-197beb92e8a8', '9e8b4c0a-b21c-4a3c-b404-f90b18d4ee1b', NULL, 1, '700725e9-1193-4a05-827b-992617308506', 'Sentuhan detailnya hangat banget! Suka sekali dengan transisi dan warna yang digunakan 😍✨', NULL, 38, '2026-10-30 05:33:07.315'),
('c8147ff7-f012-4e5f-b023-56c0500eb3da', '2792c9b8-7c9a-4781-88d1-40e022835e39', '184a9c96-096a-46e5-9bcc-b23a7a25e9bc', 0, NULL, 'Suka banget sama sound track-nya, pas banget dengan visual videonya! Boleh minta judul audionya?', NULL, 15, '2026-10-30 05:33:07.298'),
('d4b4abec-252b-4030-bd37-610fa0809572', '6424005c-7362-4547-9844-d1ed2c38018a', NULL, 1, '81cff48a-72ee-436f-8566-c4f0e64bf70e', 'Ini kalau dilihat terus-menerus bisa bikin lupa deadline tugas kantor! Keren parah animasinya 🚀', NULL, 24, '2026-10-30 05:33:07.281'),
('ea59e112-409c-4e47-a38d-9c0b6bf5f962', '4f068049-f666-48d9-a9c4-21c6b0938e2d', NULL, 1, '81cff48a-72ee-436f-8566-c4f0e64bf70e', 'Ini kalau dilihat terus-menerus bisa bikin lupa deadline tugas kantor! Keren parah animasinya 🚀', NULL, 24, '2026-10-30 05:33:07.260');

-- --------------------------------------------------------

--
-- Table structure for table `conversations`
--

CREATE TABLE `conversations` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user1Id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user2Id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updatedAt` datetime(3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `follows`
--

CREATE TABLE `follows` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `followerId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `followingId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `follows`
--

INSERT INTO `follows` (`id`, `followerId`, `followingId`, `createdAt`) VALUES
('0446c7cd-646f-4725-a20c-198ad3e44961', '69e83f24-639e-480f-b284-0314e0803dca', 'aa0ab696-8d94-41fd-ab15-e876507beba5', '2026-10-30 05:33:07.321'),
('c96f9031-93d9-48e0-99fe-7b1e238f0f3b', '184a9c96-096a-46e5-9bcc-b23a7a25e9bc', 'aa0ab696-8d94-41fd-ab15-e876507beba5', '2026-10-30 05:33:07.321'),
('e80d60b0-3305-411d-8b1b-5bb5c4e95986', '3e8b555c-56ce-446a-83c9-89bc3b991403', '2f2572bf-e28e-4784-9760-cec19f6d8879', '2026-10-30 05:33:07.321'),
('ee40e758-985d-402c-b83e-de1078f2d299', '184a9c96-096a-46e5-9bcc-b23a7a25e9bc', '2f2572bf-e28e-4784-9760-cec19f6d8879', '2026-10-30 05:33:07.321');

-- --------------------------------------------------------

--
-- Table structure for table `hashtags`
--

CREATE TABLE `hashtags` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `hashtags`
--

INSERT INTO `hashtags` (`id`, `name`, `createdAt`) VALUES
('4bb40c5a-3442-4307-97ea-5f6ccb7485c2', 'Viral', '2026-10-30 05:33:07.244'),
('5775dc51-d912-4898-82a4-ce456ea4bcc6', 'Trending', '2026-10-30 07:15:25.714'),
('7efbf7f4-ab28-4d7b-bab9-e9e1a1e31298', 'VyroAI', '2026-10-30 05:33:07.239');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `conversationId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `senderId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `mediaUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `actorId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `videoId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `userId`, `actorId`, `type`, `message`, `videoId`, `isRead`, `createdAt`) VALUES
('31ced425-71b5-478f-b3fc-a7773afaf435', '3e8b555c-56ce-446a-83c9-89bc3b991403', '69e83f24-639e-480f-b284-0314e0803dca', 'LIKE', 'liked your video: \"Cyberpunk Desk Setup 2026: Amb...\"', '9e8b4c0a-b21c-4a3c-b404-f90b18d4ee1b', 0, '2026-10-30 06:06:20.370');

-- --------------------------------------------------------

--
-- Table structure for table `refresh_tokens`
--

CREATE TABLE `refresh_tokens` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiresAt` datetime(3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `refresh_tokens`
--

INSERT INTO `refresh_tokens` (`id`, `token`, `userId`, `expiresAt`, `createdAt`) VALUES
('01718aa9-6f5b-4d33-9ac6-d48ea76a76be', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWU4M2YyNC02MzllLTQ4MGYtYjI4NC0wMzE0ZTA4MDNkY2EiLCJpYXQiOjE3OTMzMzkzMDgsImV4cCI6MTc5NTkzMTMwOH0.4wjIjoUTismby3UrlF3hmVkc40kAX-pMCiof5t0Iv6Q', '69e83f24-639e-480f-b284-0314e0803dca', '2026-11-29 05:48:28.814', '2026-10-30 05:48:28.816'),
('e231df44-11dd-4b9d-92ce-aa74618c9496', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWU4M2YyNC02MzllLTQ4MGYtYjI4NC0wMzE0ZTA4MDNkY2EiLCJpYXQiOjE3OTMzNDIxNTMsImV4cCI6MTc5NTkzNDE1M30.4iIjXpTu7tpKaM_8YTF6rrRgc1nijUIFpuM85twpkJo', '69e83f24-639e-480f-b284-0314e0803dca', '2026-11-29 06:35:53.858', '2026-10-30 06:35:53.860');

-- --------------------------------------------------------

--
-- Table structure for table `sounds`
--

CREATE TABLE `sounds` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `artist` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `audioUrl` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `coverUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration` int NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sounds`
--

INSERT INTO `sounds` (`id`, `title`, `artist`, `audioUrl`, `coverUrl`, `duration`, `createdAt`) VALUES
('6d17632a-9bbd-43dd-b9b3-aad8d1f837ba', 'Golden Sunset Chill (Vyro Edit)', 'Lofi Boy x Vyro', 'https://cdn.freesound.org/previews/612/612610_5674468-lq.mp3', 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=150', 38, '2026-10-30 05:33:07.220'),
('b20b2547-26f5-4abd-bcaa-393e46cd5156', 'Espresso Morning Acoustic', 'Acoustic Soul', 'https://cdn.freesound.org/previews/456/456965_4486188-lq.mp3', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=150', 30, '2026-10-30 05:33:07.220'),
('e41f63ff-8b6a-4fcb-a6ae-edcc33aca636', 'Cyber City Neon Horizon', 'Synthwave AI', 'https://cdn.freesound.org/previews/568/568856_11861866-lq.mp3', 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=150', 45, '2026-10-30 05:33:07.220');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fullName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `passwordHash` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('USER','CREATOR','ADMIN') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USER',
  `avatarUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` text COLLATE utf8mb4_unicode_ci,
  `isVerified` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `username`, `fullName`, `passwordHash`, `role`, `avatarUrl`, `bio`, `isVerified`, `createdAt`, `updatedAt`) VALUES
('184a9c96-096a-46e5-9bcc-b23a7a25e9bc', 'maya@vyro.ai', 'maya.wander', 'Maya Lin', '$2a$10$Xw.auT8EQ5izr0v0MW/gNeB2Liyk22CoqDfvi9Sxc7U9xrzXHRgtS', 'USER', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200', 'Exploring coffee shops and acoustic melodies ☕🎧', 0, '2026-10-30 05:33:07.185', '2026-10-30 05:33:07.185'),
('2f2572bf-e28e-4784-9760-cec19f6d8879', 'sarah@vyro.ai', 'sarah.lens', 'Sarah Jenkins', '$2a$10$Xw.auT8EQ5izr0v0MW/gNeB2Liyk22CoqDfvi9Sxc7U9xrzXHRgtS', 'CREATOR', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200', 'Visual storyteller & hyper-lapse cinematographer 🎬✨ | Jakarta', 1, '2026-10-30 05:33:07.175', '2026-10-30 05:33:07.175'),
('3e8b555c-56ce-446a-83c9-89bc3b991403', 'alex@vyro.ai', 'alex.tech', 'Alex Rivera', '$2a$10$Xw.auT8EQ5izr0v0MW/gNeB2Liyk22CoqDfvi9Sxc7U9xrzXHRgtS', 'CREATOR', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200', 'Futuristic AI, robotic gear & setup aesthetics ⚡🤖', 1, '2026-10-30 05:33:07.182', '2026-10-30 05:33:07.182'),
('69e83f24-639e-480f-b284-0314e0803dca', 'admin@vyro.ai', 'admin', 'Andrian', '$2a$10$Y7q6INlNpIsnfvN4l0qoUu0QsVKN4YFKx6I/.2fRIHADbb2sbkmI.', 'ADMIN', '/uploads/avatars/avatar-1793359227928-471920206.jpg', 'Platform Creator & System Administrator at VYRO AI.', 1, '2026-10-30 05:33:07.160', '2026-10-30 11:20:29.887'),
('aa0ab696-8d94-41fd-ab15-e876507beba5', 'marcus@vyro.ai', 'chef.marcus', 'Marcus V.', '$2a$10$Xw.auT8EQ5izr0v0MW/gNeB2Liyk22CoqDfvi9Sxc7U9xrzXHRgtS', 'CREATOR', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', 'Culinary alchemy • 30-sec secret recipes 🥘🔥', 1, '2026-10-30 05:33:07.178', '2026-10-30 05:33:07.178');

-- --------------------------------------------------------

--
-- Table structure for table `videos`
--

CREATE TABLE `videos` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `videoUrl` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `thumbnailUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration` double NOT NULL DEFAULT '0',
  `width` int NOT NULL DEFAULT '1080',
  `height` int NOT NULL DEFAULT '1920',
  `visibility` enum('PUBLIC','FOLLOWERS_ONLY','PRIVATE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PUBLIC',
  `status` enum('UPLOADING','PROCESSING','PUBLISHED','FAILED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PUBLISHED',
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `categoryId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `soundId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `viewsCount` int NOT NULL DEFAULT '0',
  `likesCount` int NOT NULL DEFAULT '0',
  `commentsCount` int NOT NULL DEFAULT '0',
  `sharesCount` int NOT NULL DEFAULT '0',
  `bookmarksCount` int NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `videos`
--

INSERT INTO `videos` (`id`, `title`, `description`, `videoUrl`, `thumbnailUrl`, `duration`, `width`, `height`, `visibility`, `status`, `userId`, `categoryId`, `soundId`, `viewsCount`, `likesCount`, `commentsCount`, `sharesCount`, `bookmarksCount`, `createdAt`, `updatedAt`) VALUES
('2792c9b8-7c9a-4781-88d1-40e022835e39', 'Wagyu A5 Steak Sizzle: Rahasia Brown Butter & Fresh Rosemary 🥩🔥', 'Tips searing wagyu A5 biar crust-nya crispy dan dagingnya super melt-in-your-mouth! Berapa tingkat kematangan favorit kalian? #Wagyu #CookingHacks #SteakLover #FoodPorn', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600', 15, 1080, 1920, 'PUBLIC', 'PUBLISHED', 'aa0ab696-8d94-41fd-ab15-e876507beba5', 'cf8978e1-883b-424b-8f53-fdca032b58f4', 'b20b2547-26f5-4abd-bcaa-393e46cd5156', 8430, 1840, 215, 0, 420, '2026-10-30 05:33:07.288', '2026-10-30 05:33:07.288'),
('3ed9b626-ac0f-4944-b360-d36fb751ab40', 'Batasan dan Standar', 'Bukan tentang merendahkan, tapi tentang fokus pada batasan diri sendiri dan melampaui ekspektasi. Tetap konsisten dan buktikan dengan karya!', '/uploads/videos/vyro-1793344525678-238285295.mp4', 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600', 15, 1080, 1920, 'PUBLIC', 'PUBLISHED', '69e83f24-639e-480f-b284-0314e0803dca', NULL, NULL, 0, 1, 3, 0, 0, '2026-10-30 07:15:25.692', '2026-10-30 07:51:15.516'),
('4f068049-f666-48d9-a9c4-21c6b0938e2d', 'Lumen Lamp Interactive Concept: The light turns on when you pull! 💡', 'Konsep autentikasi interaktif VYRO AI! Tarik talinya, hidupkan lampunya, dan rasakan magisnya animasi pencahayaan ambient warm gold ✨ #VyroAI #InteractionDesign #CreativeUI', '/uploads/videos/konsep_login.mp4', 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600', 5, 1080, 1920, 'PUBLIC', 'PUBLISHED', '69e83f24-639e-480f-b284-0314e0803dca', 'f2407f06-a724-4d87-ac1a-e9d9034ac426', 'e41f63ff-8b6a-4fcb-a6ae-edcc33aca636', 3420, 894, 142, 0, 210, '2026-10-30 05:33:07.232', '2026-10-30 05:33:07.232'),
('6424005c-7362-4547-9844-d1ed2c38018a', 'Neon Tokyo Alleyway at 2:00 AM — Shot on iPhone 16 Pro Max 🗼🌧️', 'Suasana hujan gerimis di Shibuya dengan pantulan lampu neon cyberpunk yang super estetik. Jangan lupa save buat ide b-roll kalian! #Tokyo #Cinematic #NeonVibes #VyroCreator', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600', 15, 1080, 1920, 'PUBLIC', 'PUBLISHED', '2f2572bf-e28e-4784-9760-cec19f6d8879', 'c7c7a7de-d919-4866-b890-ac0f42f0e520', '6d17632a-9bbd-43dd-b9b3-aad8d1f837ba', 12540, 2310, 318, 0, 650, '2026-10-30 05:33:07.271', '2026-10-30 05:33:07.271'),
('9e8b4c0a-b21c-4a3c-b404-f90b18d4ee1b', 'Cyberpunk Desk Setup 2026: Ambient Light + Smart Matrix Display 🖥️⚡', 'Setup workspace minimalis dengan dual monitor ultrawide dan pencahayaan cerdas yang tersinkronisasi musik. Rate 1-10 di kolom komentar! #DeskSetup #TechLife #Aesthetic #Workspace', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600', 12, 1080, 1920, 'PUBLIC', 'PUBLISHED', '3e8b555c-56ce-446a-83c9-89bc3b991403', 'db67e887-c87a-4794-ad44-930555dee806', 'e41f63ff-8b6a-4fcb-a6ae-edcc33aca636', 6200, 1291, 95, 0, 310, '2026-10-30 05:33:07.305', '2026-10-30 06:06:20.355'),
('ac7e5fdb-436d-4c8e-a85b-4e6edcfc040a', 'Pro CapCut Edit', 'Edited with VYRO AI Studio (CapCut Mode) • Filter: warm-gold • Font: Bebas Neue • BGM: None', '/uploads/videos/export-1793362687294-235437.mp4', 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600', 4.642585, 1080, 1920, 'PUBLIC', 'PUBLISHED', '69e83f24-639e-480f-b284-0314e0803dca', NULL, NULL, 0, 0, 0, 0, 0, '2026-10-30 12:18:08.594', '2026-10-30 12:18:08.594');

-- --------------------------------------------------------

--
-- Table structure for table `video_drafts`
--

CREATE TABLE `video_drafts` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `editorState` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `video_drafts`
--

INSERT INTO `video_drafts` (`id`, `userId`, `title`, `editorState`, `createdAt`, `updatedAt`) VALUES
('ad18d80a-54dc-4418-8213-16d2a6e6a4b8', '69e83f24-639e-480f-b284-0314e0803dca', 'Draft - 14.18.23', '{\"trimStart\":0,\"trimEnd\":4.642585,\"speed\":1,\"activeFilter\":\"warm-gold\",\"overlayText\":\"VYRO AI ✨\"}', '2026-10-30 07:18:23.537', '2026-10-30 07:18:23.537');

-- --------------------------------------------------------

--
-- Table structure for table `video_hashtags`
--

CREATE TABLE `video_hashtags` (
  `videoId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hashtagId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `video_hashtags`
--

INSERT INTO `video_hashtags` (`videoId`, `hashtagId`) VALUES
('2792c9b8-7c9a-4781-88d1-40e022835e39', '4bb40c5a-3442-4307-97ea-5f6ccb7485c2'),
('4f068049-f666-48d9-a9c4-21c6b0938e2d', '4bb40c5a-3442-4307-97ea-5f6ccb7485c2'),
('6424005c-7362-4547-9844-d1ed2c38018a', '4bb40c5a-3442-4307-97ea-5f6ccb7485c2'),
('9e8b4c0a-b21c-4a3c-b404-f90b18d4ee1b', '4bb40c5a-3442-4307-97ea-5f6ccb7485c2'),
('3ed9b626-ac0f-4944-b360-d36fb751ab40', '5775dc51-d912-4898-82a4-ce456ea4bcc6'),
('2792c9b8-7c9a-4781-88d1-40e022835e39', '7efbf7f4-ab28-4d7b-bab9-e9e1a1e31298'),
('3ed9b626-ac0f-4944-b360-d36fb751ab40', '7efbf7f4-ab28-4d7b-bab9-e9e1a1e31298'),
('4f068049-f666-48d9-a9c4-21c6b0938e2d', '7efbf7f4-ab28-4d7b-bab9-e9e1a1e31298'),
('6424005c-7362-4547-9844-d1ed2c38018a', '7efbf7f4-ab28-4d7b-bab9-e9e1a1e31298'),
('9e8b4c0a-b21c-4a3c-b404-f90b18d4ee1b', '7efbf7f4-ab28-4d7b-bab9-e9e1a1e31298');

-- --------------------------------------------------------

--
-- Table structure for table `video_likes`
--

CREATE TABLE `video_likes` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `videoId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `video_likes`
--

INSERT INTO `video_likes` (`id`, `videoId`, `userId`, `createdAt`) VALUES
('75793237-29b4-4023-beac-3b4259a18afe', '9e8b4c0a-b21c-4a3c-b404-f90b18d4ee1b', '69e83f24-639e-480f-b284-0314e0803dca', '2026-10-30 06:06:20.349'),
('9ac2573e-e747-49dc-b9f2-16a34aa309bb', '3ed9b626-ac0f-4944-b360-d36fb751ab40', '69e83f24-639e-480f-b284-0314e0803dca', '2026-10-30 07:17:04.591');

-- --------------------------------------------------------

--
-- Table structure for table `video_views`
--

CREATE TABLE `video_views` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `videoId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ipAddress` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ai_analyses`
--
ALTER TABLE `ai_analyses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ai_analyses_videoId_key` (`videoId`);

--
-- Indexes for table `ai_characters`
--
ALTER TABLE `ai_characters`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ai_interactions`
--
ALTER TABLE `ai_interactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ai_interactions_videoId_idx` (`videoId`),
  ADD KEY `ai_interactions_aiCharacterId_fkey` (`aiCharacterId`);

--
-- Indexes for table `ai_settings`
--
ALTER TABLE `ai_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ai_settings_key_key` (`key`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `audit_logs_userId_fkey` (`userId`);

--
-- Indexes for table `bookmarks`
--
ALTER TABLE `bookmarks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `bookmarks_videoId_userId_key` (`videoId`,`userId`),
  ADD KEY `bookmarks_userId_fkey` (`userId`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `categories_name_key` (`name`),
  ADD UNIQUE KEY `categories_slug_key` (`slug`);

--
-- Indexes for table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `comments_videoId_idx` (`videoId`),
  ADD KEY `comments_parentId_idx` (`parentId`),
  ADD KEY `comments_userId_fkey` (`userId`),
  ADD KEY `comments_aiCharacterId_fkey` (`aiCharacterId`);

--
-- Indexes for table `conversations`
--
ALTER TABLE `conversations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `conversations_user1Id_user2Id_key` (`user1Id`,`user2Id`),
  ADD KEY `conversations_user2Id_fkey` (`user2Id`);

--
-- Indexes for table `follows`
--
ALTER TABLE `follows`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `follows_followerId_followingId_key` (`followerId`,`followingId`),
  ADD KEY `follows_followingId_fkey` (`followingId`);

--
-- Indexes for table `hashtags`
--
ALTER TABLE `hashtags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `hashtags_name_key` (`name`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `messages_conversationId_idx` (`conversationId`),
  ADD KEY `messages_senderId_fkey` (`senderId`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_userId_idx` (`userId`),
  ADD KEY `notifications_actorId_fkey` (`actorId`);

--
-- Indexes for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `refresh_tokens_token_key` (`token`),
  ADD KEY `refresh_tokens_userId_idx` (`userId`);

--
-- Indexes for table `sounds`
--
ALTER TABLE `sounds`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_key` (`email`),
  ADD UNIQUE KEY `users_username_key` (`username`);

--
-- Indexes for table `videos`
--
ALTER TABLE `videos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `videos_userId_idx` (`userId`),
  ADD KEY `videos_categoryId_idx` (`categoryId`),
  ADD KEY `videos_createdAt_idx` (`createdAt`),
  ADD KEY `videos_soundId_fkey` (`soundId`);

--
-- Indexes for table `video_drafts`
--
ALTER TABLE `video_drafts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `video_hashtags`
--
ALTER TABLE `video_hashtags`
  ADD PRIMARY KEY (`videoId`,`hashtagId`),
  ADD KEY `video_hashtags_hashtagId_fkey` (`hashtagId`);

--
-- Indexes for table `video_likes`
--
ALTER TABLE `video_likes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `video_likes_videoId_userId_key` (`videoId`,`userId`),
  ADD KEY `video_likes_userId_fkey` (`userId`);

--
-- Indexes for table `video_views`
--
ALTER TABLE `video_views`
  ADD PRIMARY KEY (`id`),
  ADD KEY `video_views_videoId_idx` (`videoId`),
  ADD KEY `video_views_userId_fkey` (`userId`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `ai_analyses`
--
ALTER TABLE `ai_analyses`
  ADD CONSTRAINT `ai_analyses_videoId_fkey` FOREIGN KEY (`videoId`) REFERENCES `videos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `ai_interactions`
--
ALTER TABLE `ai_interactions`
  ADD CONSTRAINT `ai_interactions_aiCharacterId_fkey` FOREIGN KEY (`aiCharacterId`) REFERENCES `ai_characters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ai_interactions_videoId_fkey` FOREIGN KEY (`videoId`) REFERENCES `videos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `bookmarks`
--
ALTER TABLE `bookmarks`
  ADD CONSTRAINT `bookmarks_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bookmarks_videoId_fkey` FOREIGN KEY (`videoId`) REFERENCES `videos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_aiCharacterId_fkey` FOREIGN KEY (`aiCharacterId`) REFERENCES `ai_characters` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `comments_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `comments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `comments_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `comments_videoId_fkey` FOREIGN KEY (`videoId`) REFERENCES `videos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `conversations`
--
ALTER TABLE `conversations`
  ADD CONSTRAINT `conversations_user1Id_fkey` FOREIGN KEY (`user1Id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `conversations_user2Id_fkey` FOREIGN KEY (`user2Id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `follows`
--
ALTER TABLE `follows`
  ADD CONSTRAINT `follows_followerId_fkey` FOREIGN KEY (`followerId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `follows_followingId_fkey` FOREIGN KEY (`followingId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `conversations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `messages_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD CONSTRAINT `refresh_tokens_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `videos`
--
ALTER TABLE `videos`
  ADD CONSTRAINT `videos_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `videos_soundId_fkey` FOREIGN KEY (`soundId`) REFERENCES `sounds` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `videos_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `video_hashtags`
--
ALTER TABLE `video_hashtags`
  ADD CONSTRAINT `video_hashtags_hashtagId_fkey` FOREIGN KEY (`hashtagId`) REFERENCES `hashtags` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `video_hashtags_videoId_fkey` FOREIGN KEY (`videoId`) REFERENCES `videos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `video_likes`
--
ALTER TABLE `video_likes`
  ADD CONSTRAINT `video_likes_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `video_likes_videoId_fkey` FOREIGN KEY (`videoId`) REFERENCES `videos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `video_views`
--
ALTER TABLE `video_views`
  ADD CONSTRAINT `video_views_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `video_views_videoId_fkey` FOREIGN KEY (`videoId`) REFERENCES `videos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
