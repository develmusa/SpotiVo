-- phpMyAdmin SQL Dump
-- version 4.5.4.1deb2ubuntu2
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Aug 12, 2016 at 09:49 PM
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
  `name` varchar(50) COLLATE latin1_german2_ci NOT NULL,
  `fs_owner` int(8) NOT NULL,
  `vote_time` int(12) NOT NULL DEFAULT '691200' COMMENT 'in seconds, default: 8 days',
  `delete_playlist_active` int(1) NOT NULL DEFAULT '0' COMMENT 'boolean',
  `delete_playlist_spotify_id` varchar(50) COLLATE latin1_german2_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_german2_ci;

--
-- Dumping data for table `playlist`
--

INSERT INTO `playlist` (`id`, `spotify_id`, `name`, `fs_owner`, `vote_time`, `delete_playlist_active`, `delete_playlist_spotify_id`) VALUES
(21, '0ycjsbjiy26VoAKoSEgioD', 'Powerslide', 19, 691200, 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `playlist_members`
--

DROP TABLE IF EXISTS `playlist_members`;
CREATE TABLE `playlist_members` (
  `id` int(8) NOT NULL,
  `fs_user` int(8) NOT NULL,
  `fs_playlist` int(8) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_german2_ci;

--
-- Dumping data for table `playlist_members`
--

INSERT INTO `playlist_members` (`id`, `fs_user`, `fs_playlist`) VALUES
(19, 1, 21);

-- --------------------------------------------------------

--
-- Table structure for table `sub_playlist`
--

DROP TABLE IF EXISTS `sub_playlist`;
CREATE TABLE `sub_playlist` (
  `id` int(8) NOT NULL,
  `name` varchar(50) COLLATE latin1_german2_ci NOT NULL,
  `spotify_id` varchar(50) COLLATE latin1_german2_ci NOT NULL,
  `fs_playlist` int(11) NOT NULL,
  `vote_time` int(12) DEFAULT NULL COMMENT 'in seconds, if null, it will take settings from playlist',
  `allow_initialize` int(1) NOT NULL DEFAULT '0' COMMENT 'boolean'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_german2_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sub_playlist_track`
--

DROP TABLE IF EXISTS `sub_playlist_track`;
CREATE TABLE `sub_playlist_track` (
  `id` int(8) NOT NULL,
  `fs_sub_playlist` int(8) NOT NULL,
  `fs_track` int(8) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `track`
--

DROP TABLE IF EXISTS `track`;
CREATE TABLE `track` (
  `id` int(8) NOT NULL,
  `fs_playlist` int(8) NOT NULL,
  `spotify_id` varchar(50) COLLATE latin1_german2_ci NOT NULL,
  `name` varchar(100) COLLATE latin1_german2_ci NOT NULL,
  `artist` varchar(100) COLLATE latin1_german2_ci NOT NULL,
  `album` varchar(100) COLLATE latin1_german2_ci NOT NULL,
  `added_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `added_by` text COLLATE latin1_german2_ci NOT NULL COMMENT 'spotify_id of user',
  `deleted` int(1) NOT NULL DEFAULT '0' COMMENT '1 or 0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_german2_ci;

--
-- Dumping data for table `track`
--

INSERT INTO `track` (`id`, `fs_playlist`, `spotify_id`, `name`, `artist`, `album`, `added_at`, `added_by`, `deleted`) VALUES
(199, 21, '0sfQoW3g1Nzgi5KzYwRiPQ', 'Powerslide', 'Basement Saints', 'Free Souls', '2016-05-23 05:54:48', 'tiborjaner', 0),
(200, 21, '2Ii6TFETemSA0mYksu3Jzz', 'We Are the 21st Century Ambassadors of Peace & Magic', 'Foxygen', 'We Are the 21st Century Ambassadors of Peace & Magic', '2016-05-23 05:55:10', 'tiborjaner', 0),
(201, 21, '47z1UWrhWORC9tFa1aQ8kd', 'Black Grease', 'Black Angels', 'Passover', '2016-05-23 06:01:13', 'tiborjaner', 0),
(202, 21, '4R3i6bPqzQrOQGUmZNCgOe', 'Half Full Glass Of Wine', 'Tame Impala', 'Tame Impala', '2016-05-23 06:01:33', 'tiborjaner', 0),
(203, 21, '79s4MhMtQe6os40Yti6mUj', 'Golden Town', 'Brutus', 'Brutus', '2016-05-24 10:48:08', 'tiborjaner', 0),
(204, 21, '6Soku1wiB6mfcQp2s2W6a6', '20th Century Boy', 'T. Rex', 'Tanx (Deluxe Edition)', '2016-05-24 04:48:21', 'tiborjaner', 0),
(205, 21, '1CW1CIucafZQqlqMHvCAZa', 'What\'s in My Head?', 'Fuzz', 'Fuzz', '2016-05-25 02:19:59', 'tiborjaner', 0),
(206, 21, '6JhVeeiFVbHFZbg3R8QKRI', 'Carrion Crawler', 'Thee Oh Sees', 'Carrion Crawler / The Dream', '2016-05-26 10:21:51', 'tiborjaner', 0),
(207, 21, '5KUe1E1TpL3U3f1BBiSFJe', 'Free Souls', 'Basement Saints', 'Free Souls', '2016-05-27 02:31:38', 'tiborjaner', 0),
(208, 21, '0w3DZcTOHrCEpAwn9nM5A9', 'Better Call Saul Main Title Theme (Extended)', 'Little Barrie', 'Better Call Saul Main Title Theme (Extended)', '2016-05-28 08:44:14', 'tiborjaner', 0),
(209, 21, '0kpUik8UD6gRmPk2u9op5h', 'Imaginary Person', 'Ty Segall', 'Melted', '2016-05-29 03:21:43', 'tiborjaner', 0),
(210, 21, '4L5btpyHA57o1ILuIFre08', 'High Tide', 'Basement Saints', 'Get Ready', '2016-05-29 03:37:53', 'tiborjaner', 0),
(211, 21, '209NMuyjXMryt970O7cjg3', 'Pieces Of The People We Love', 'The Rapture', 'Pieces Of The People We Love (EU Version)', '2016-06-05 01:06:32', 'tiborjaner', 0),
(212, 21, '3YStiWG2eIrJsfp2Kl0Ww5', 'Baby', 'Tomorrows Tulips', 'When', '2016-06-05 01:15:04', 'tiborjaner', 0),
(213, 21, '7ckO5VCuSYBQGceDzJMd6S', 'How You Like Me Now', 'The Heavy', 'The House That Dirt Built', '2016-06-12 08:57:30', 'tiborjaner', 0),
(214, 21, '0CLeZdKEUEpFgPySjDREfK', 'Astralplane', 'Blues Pills', 'Bliss', '2016-06-20 08:48:06', 'tiborjaner', 0),
(215, 21, '4PeIEk396dG60CfpmWlrCs', 'Dragonaut', 'Sleep', 'Sleeps Holy Mountain', '2016-06-22 01:38:26', 'tiborjaner', 0),
(216, 21, '0lSpF01QlNN5J2BkrMyoJi', 'Train To Nowhere', 'Savoy Brown', 'Blue Matter (2013 Re-Issue)', '2016-07-03 06:09:38', 'tiborjaner', 0),
(217, 21, '2IENiPNTterTWliYOPogQS', 'Freelance Fiend', 'Leaf Hound', 'Growers Of Mushrooms', '2016-07-03 06:15:29', 'tiborjaner', 0),
(218, 21, '3HyiHXZdB5CQTTtxIXYwJs', 'Numb', 'Gary Clark Jr.', 'Blak And Blu (Deluxe Version)', '2016-07-07 10:29:41', 'tiborjaner', 0),
(219, 21, '0iTQRy2KuwHlfU5hXFIWQN', 'Blue Mountains', 'Diamond Rugs', 'Diamond Rugs', '2016-07-07 00:12:05', 'tiborjaner', 0),
(220, 21, '5QuwldeRI8XLqDP7LPN7xJ', 'De Vida Voz', 'Allah-Las', 'Worship The Sun', '2016-07-11 10:56:08', 'tiborjaner', 0),
(221, 21, '3pLzBdp8UXo0Vv4fBH42Ok', 'Reckless Life (Remixed By Gilby Clarke Featuring Tracii Guns)', 'Hollywood Rose', 'The Roots of Guns ‘n Roses', '2016-07-25 02:46:57', 'tiborjaner', 0),
(222, 21, '3kIB9guKaClVhu2FFBag4K', 'Am I In Heaven', 'King Gizzard & The Lizard Wizard', 'I\'m In Your Mind Fuzz', '2016-07-27 01:50:18', 'tiborjaner', 0),
(223, 21, '1AWuKQ5utgc8A1TRR7MRiK', 'Sleep With the Lights On', 'The Wanton Bishops', 'Sleep With the Lights On', '2016-07-30 07:21:08', 'tiborjaner', 0),
(224, 21, '6ToM0uwxtPKo9CMpbPGYvM', 'Break On Through (To The Other Side)', 'The Doors', 'The Doors', '2016-08-03 01:10:06', 'tiborjaner', 0),
(225, 21, '5mglMPS52Tr5FuopEXiV6i', 'Sunday Evening', 'The Black Angels', 'Clear Lake Forest', '2016-08-03 08:01:29', 'tiborjaner', 0);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` int(8) NOT NULL,
  `spotify_id` varchar(255) COLLATE latin1_german2_ci NOT NULL,
  `creation_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_german2_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `spotify_id`, `creation_time`) VALUES
(1, 'tiborjaner', '2016-08-04 22:02:13');

-- --------------------------------------------------------

--
-- Table structure for table `vote`
--

DROP TABLE IF EXISTS `vote`;
CREATE TABLE `vote` (
  `id` int(8) NOT NULL,
  `fs_track` int(8) NOT NULL,
  `end_time` datetime NOT NULL,
  `type` int(8) NOT NULL COMMENT '0: Undefined | 1: Delete | 2: AddRemove | 3: move',
  `vote_yes` int(8) NOT NULL DEFAULT '0',
  `vote_no` int(8) NOT NULL DEFAULT '0',
  `sub_playlist_1` int(8) DEFAULT NULL COMMENT 'used for: type 2, 3',
  `sub_playlist_2` int(8) DEFAULT NULL COMMENT 'used for: type 3'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `vote`
--

INSERT INTO `vote` (`id`, `fs_track`, `end_time`, `type`, `vote_yes`, `vote_no`, `sub_playlist_1`, `sub_playlist_2`) VALUES
(4, 199, '2016-08-16 04:00:00', 1, 1, 0, NULL, NULL),
(5, 201, '2016-08-20 08:41:10', 1, 1, 0, NULL, NULL);

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
-- Indexes for table `sub_playlist`
--
ALTER TABLE `sub_playlist`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sub_playlist_track`
--
ALTER TABLE `sub_playlist_track`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `track`
--
ALTER TABLE `track`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `vote`
--
ALTER TABLE `vote`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `playlist`
--
ALTER TABLE `playlist`
  MODIFY `id` int(8) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;
--
-- AUTO_INCREMENT for table `playlist_members`
--
ALTER TABLE `playlist_members`
  MODIFY `id` int(8) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;
--
-- AUTO_INCREMENT for table `sub_playlist`
--
ALTER TABLE `sub_playlist`
  MODIFY `id` int(8) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `sub_playlist_track`
--
ALTER TABLE `sub_playlist_track`
  MODIFY `id` int(8) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `track`
--
ALTER TABLE `track`
  MODIFY `id` int(8) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=226;
--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(8) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT for table `vote`
--
ALTER TABLE `vote`
  MODIFY `id` int(8) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
