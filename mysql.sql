-- phpMyAdmin SQL Dump
-- version 4.5.4.1deb2ubuntu2
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Aug 08, 2016 at 08:08 PM
-- Server version: 5.7.13-0ubuntu0.16.04.2
-- PHP Version: 7.0.8-0ubuntu0.16.04.2

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `application`
--
CREATE DATABASE IF NOT EXISTS `application` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `application`;

-- --------------------------------------------------------

--
-- Table structure for table `playlist`
--

DROP TABLE IF EXISTS `playlist`;
CREATE TABLE `playlist` (
  `id` int(8) NOT NULL,
  `spotify_id` varchar(50) COLLATE latin1_german2_ci NOT NULL,
  `name` varchar(50) COLLATE latin1_german2_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_german2_ci;

-- --------------------------------------------------------

--
-- Table structure for table `playlist_members`
--

DROP TABLE IF EXISTS `playlist_members`;
CREATE TABLE `playlist_members` (
  `id` int(8) NOT NULL,
  `fs_users` int(8) NOT NULL,
  `fs_playlist` int(8) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_german2_ci;

-- --------------------------------------------------------

--
-- Table structure for table `playlist_tracks`
--

DROP TABLE IF EXISTS `playlist_tracks`;
CREATE TABLE `playlist_tracks` (
  `id` int(8) NOT NULL,
  `fs_playlist` int(8) NOT NULL,
  `spotify_id` varchar(30) COLLATE latin1_german2_ci NOT NULL,
  `name` varchar(50) COLLATE latin1_german2_ci NOT NULL,
  `artist` varchar(50) COLLATE latin1_german2_ci NOT NULL,
  `album` varchar(50) COLLATE latin1_german2_ci NOT NULL,
  `deleted` int(1) NOT NULL COMMENT '1 or 0',
  `liked` int(1) NOT NULL COMMENT '1 or 0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_german2_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(8) NOT NULL,
  `spotify_id` varchar(255) COLLATE latin1_german2_ci NOT NULL,
  `creation_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_german2_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `spotify_id`, `creation_time`) VALUES
(1, 'tiborjaner', '2016-08-04 22:02:13');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `playlist`
--
ALTER TABLE `playlist`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `playlist_members`
--
ALTER TABLE `playlist_members`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `playlist_tracks`
--
ALTER TABLE `playlist_tracks`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `playlist`
--
ALTER TABLE `playlist`
  MODIFY `id` int(8) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `playlist_members`
--
ALTER TABLE `playlist_members`
  MODIFY `id` int(8) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `playlist_tracks`
--
ALTER TABLE `playlist_tracks`
  MODIFY `id` int(8) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(8) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

--
-- Create users and grant Access to application
--
CREATE USER 'application'@'%' IDENTIFIED BY 'y7F!z6C7U#EKWsI8';
GRANT USAGE ON *.* TO 'application'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON `application`.* TO 'application'@'%';

