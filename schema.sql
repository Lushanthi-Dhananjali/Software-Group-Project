-- Physics LMS Database Schema
-- Run this script inside your MySQL server to set up all tables.
--
-- IMPORTANT NOTE FOR SERVERBYT / SHARED HOSTING (phpMyAdmin):
-- On shared hosting providers like Serverbyt, databases are usually pre-created for you
-- with a prefix (e.g., yourusername_physics_lms). 
-- If you get an "Access denied" or "Cannot create database" error when importing:
-- 1. In phpMyAdmin, click on your pre-created database name on the left sidebar first.
-- 2. Go to the "Import" tab.
-- 3. Upload this file, or copy the SQL queries starting from the "Users table" line 
--    (skipping the CREATE DATABASE and USE statements below).

-- CREATE DATABASE IF NOT EXISTS `physics_lms` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE `physics_lms`;

-- Users table
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `data` LONGTEXT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Classes table
CREATE TABLE IF NOT EXISTS `classes` (
  `id` VARCHAR(191) NOT NULL,
  `data` LONGTEXT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Recordings table
CREATE TABLE IF NOT EXISTS `recordings` (
  `id` VARCHAR(191) NOT NULL,
  `data` LONGTEXT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Materials table
CREATE TABLE IF NOT EXISTS `materials` (
  `id` VARCHAR(191) NOT NULL,
  `data` LONGTEXT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Exams table
CREATE TABLE IF NOT EXISTS `exams` (
  `id` VARCHAR(191) NOT NULL,
  `data` LONGTEXT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Attempts table
CREATE TABLE IF NOT EXISTS `attempts` (
  `id` VARCHAR(191) NOT NULL,
  `student_id` VARCHAR(191) NOT NULL,
  `data` LONGTEXT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_student_id` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Forums table
CREATE TABLE IF NOT EXISTS `forums` (
  `id` VARCHAR(191) NOT NULL,
  `data` LONGTEXT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Slips table
CREATE TABLE IF NOT EXISTS `slips` (
  `id` VARCHAR(191) NOT NULL,
  `student_id` VARCHAR(191) NOT NULL,
  `data` LONGTEXT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_student_id_slips` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Announcements table
CREATE TABLE IF NOT EXISTS `announcements` (
  `id` VARCHAR(191) NOT NULL,
  `data` LONGTEXT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Chats table
CREATE TABLE IF NOT EXISTS `chats` (
  `id` VARCHAR(191) NOT NULL,
  `data` LONGTEXT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Feedbacks table
CREATE TABLE IF NOT EXISTS `feedbacks` (
  `id` VARCHAR(191) NOT NULL,
  `data` LONGTEXT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Settings table
CREATE TABLE IF NOT EXISTS `settings` (
  `id` VARCHAR(191) NOT NULL,
  `data` LONGTEXT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
