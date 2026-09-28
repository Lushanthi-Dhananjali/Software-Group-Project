-- LMS Portal MySQL Database Schema
-- Compatible with cPanel Shared Hosting (MySQL 5.7+ / MariaDB 10+)
-- Location: /public/schema.sql

-- Set character set to fully support multi-language unicode (Sinhala, Tamil, English, Emojis)
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------
-- 1. Table Structure for Table: `users`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `data` LONGTEXT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 2. Table Structure for Table: `classes`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `classes` (
  `id` VARCHAR(255) NOT NULL,
  `data` LONGTEXT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 3. Table Structure for Table: `recordings`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `recordings` (
  `id` VARCHAR(255) NOT NULL,
  `data` LONGTEXT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 4. Table Structure for Table: `materials`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `materials` (
  `id` VARCHAR(255) NOT NULL,
  `data` LONGTEXT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 5. Table Structure for Table: `exams`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `exams` (
  `id` VARCHAR(255) NOT NULL,
  `data` LONGTEXT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 6. Table Structure for Table: `attempts`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `attempts` (
  `id` VARCHAR(255) NOT NULL,
  `student_id` VARCHAR(255) NOT NULL,
  `data` LONGTEXT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_student_id` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 7. Table Structure for Table: `forums`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `forums` (
  `id` VARCHAR(255) NOT NULL,
  `data` LONGTEXT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 8. Table Structure for Table: `slips`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `slips` (
  `id` VARCHAR(255) NOT NULL,
  `student_id` VARCHAR(255) NOT NULL,
  `data` LONGTEXT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_student_id` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 9. Table Structure for Table: `announcements`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `announcements` (
  `id` VARCHAR(255) NOT NULL,
  `data` LONGTEXT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 10. Table Structure for Table: `chats`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `chats` (
  `id` VARCHAR(255) NOT NULL,
  `data` LONGTEXT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 11. Table Structure for Table: `feedbacks`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `feedbacks` (
  `id` VARCHAR(255) NOT NULL,
  `data` LONGTEXT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 12. Table Structure for Table: `settings`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `settings` (
  `id` VARCHAR(255) NOT NULL,
  `data` LONGTEXT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Seeding Initial Settings Data (Homepage Structure & Custom Sinhalese/English Copy)
-- --------------------------------------------------------
INSERT INTO `settings` (`id`, `data`) VALUES
('home_sections', '{"id":"home_sections","hero":true,"classes":true,"timeline":true,"announcements":true,"contact":true}'),
('home_content', '{"id":"home_content","heroTitleEn":"Master A/L Physics with Precision","heroTitleSi":"නිරවද්‍යතාවයෙන් භෞතික විද්‍යාව ජය ගන්න","heroSubtitleEn":"Sri Lanka\'s premium educational portal led by expert pedagogy, offering theory modules, revision clinics, and live paper grading.","heroSubtitleSi":"සිද්ධාන්ත, පුනරීක්ෂණ සහ ප්‍රශ්න පත්‍ර පන්ති සජීවීව මෙහෙයවන ශ්‍රී ලංකාවේ ප්‍රමුඛතම භෞතික විද්‍යාව අධ්‍යාපන පද්ධතිය.","heroVideoUrl":"https://www.youtube.com/embed/dQw4w9WgXcQ","milestones":[{"phase":"Phase 01","titleEn":"Classical Newtonian Mechanics","titleSi":"යාන්ත්‍ර විද්‍යාව මූලික සිද්ධාන්ත","months":"June - Sept","topics":"Vectors, Circular Motion, Friction Equilibrium, Energy laws"},{"phase":"Phase 02","titleEn":"Oscillations & Waves Resonance","titleSi":"තරංග සහ කම්පන විශ්ලේෂණය","months":"Oct - Dec","topics":"Acoustic physics, Doppler effect, Resonance columns, Light reflection"},{"phase":"Phase 03","titleEn":"Thermal & Fields Dynamics","titleSi":"තාපය සහ ක්ෂේත්‍ර නියම","months":"Jan - April","topics":"Kinetic theory, Gas laws, Electrostatics, Gravitational grids"},{"phase":"Phase 04","titleEn":"Electronics & Revision Masterclass","titleSi":"ඉලෙක්ට්‍රොනික විද්‍යාව සහ ප්‍රශ්න පත්‍ර","months":"May - August","topics":"Logic gates, Transistors, OP-AMPS, Past 20 A/L Paper Clinics"}],"helplinePhone":"+94 11 259 8810","helplineWhatsapp":"+94 77 123 4567","helplineHours":"Every Day: 8:00 AM - 8:00 PM","centers":[{"name":"Colombo Physical Auditorium","address":"Nugegoda Hall complex, Sri Lanka"},{"name":"Gampaha Main Lecture Theater","address":"Yakkala Road physical branch"}],"bankProtocolEn":"Students depositing fees via direct physical bank cash deposits should take a clear unblurred photo of the stamped slip, register an account, and upload it inside their Payment panel to unlock.","bankProtocolSi":"සෘජුවම බැංකු තැන්පතු මඟින් ගාස්තු ගෙවන සිසුන්, එම පැහැදිලි තැන්පතු පත්‍රිකාව ඡායාරූපගත කර, ගිණුමක් සාදා, පන්ති සක්‍රීය කර ගැනීමට ඔවුන්ගේ ගෙවීම් අංශය (Payment panel) තුලින් ඉදිරිපත් කළ යුතුය.","heroWelcomeTitleEn":"Sandun K. Dissanayaka","heroWelcomeTitleSi":"සඳුන් කේ. දිසානායක","heroTaglineEn":"The lovely commentator in cyberspace who teaches psychology to the heart","heroTaglineSi":"හදවතට Physics කියාදෙන cyber අවකාශයේ සොඳුරු විචාරකයා"}')
ON DUPLICATE KEY UPDATE `data` = VALUES(`data`);

SET FOREIGN_KEY_CHECKS = 1;
