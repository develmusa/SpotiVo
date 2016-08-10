-- phpMyAdmin SQL Dump
-- version 4.5.4.1deb2ubuntu2
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Aug 10, 2016 at 09:42 AM
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

--
-- Dumping data for table `playlist`
--

INSERT INTO `playlist` (`id`, `spotify_id`, `name`) VALUES
(1, '0ycjsbjiy26VoAKoSEgioD', 'temporary_null'),
(3, '6eJdb9MIm11K7HuGFJhyXQ', 'temporary_null');

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
(1, 1, 1),
(3, 1, 3);

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

--
-- Dumping data for table `playlist_tracks`
--

INSERT INTO `playlist_tracks` (`id`, `fs_playlist`, `spotify_id`, `name`, `artist`, `album`, `deleted`, `liked`) VALUES
(1, 1, '0sfQoW3g1Nzgi5KzYwRiPQ', 'Powerslide', 'Basement Saints', '[object Object]', 0, 0),
(2, 1, '47z1UWrhWORC9tFa1aQ8kd', 'Black Grease', 'Black Angels', '[object Object]', 0, 0),
(3, 1, '4R3i6bPqzQrOQGUmZNCgOe', 'Half Full Glass Of Wine', 'Tame Impala', '[object Object]', 0, 0),
(4, 1, '79s4MhMtQe6os40Yti6mUj', 'Golden Town', 'Brutus', '[object Object]', 0, 0),
(5, 1, '6Soku1wiB6mfcQp2s2W6a6', '20th Century Boy', 'T. Rex', '[object Object]', 0, 0),
(6, 1, '1CW1CIucafZQqlqMHvCAZa', 'What\'s in My Head?', 'Fuzz', '[object Object]', 0, 0),
(7, 1, '6JhVeeiFVbHFZbg3R8QKRI', 'Carrion Crawler', 'Thee Oh Sees', '[object Object]', 0, 0),
(8, 1, '5KUe1E1TpL3U3f1BBiSFJe', 'Free Souls', 'Basement Saints', '[object Object]', 0, 0),
(9, 1, '0w3DZcTOHrCEpAwn9nM5A9', 'Better Call Saul Main Title Theme (Extended)', 'Little Barrie', '[object Object]', 0, 0),
(10, 1, '0kpUik8UD6gRmPk2u9op5h', 'Imaginary Person', 'Ty Segall', '[object Object]', 0, 0),
(11, 1, '4L5btpyHA57o1ILuIFre08', 'High Tide', 'Basement Saints', '[object Object]', 0, 0),
(12, 1, '209NMuyjXMryt970O7cjg3', 'Pieces Of The People We Love', 'The Rapture', '[object Object]', 0, 0),
(13, 1, '3YStiWG2eIrJsfp2Kl0Ww5', 'Baby', 'Tomorrows Tulips', '[object Object]', 0, 0),
(14, 1, '7ckO5VCuSYBQGceDzJMd6S', 'How You Like Me Now', 'The Heavy', '[object Object]', 0, 0),
(15, 1, '0CLeZdKEUEpFgPySjDREfK', 'Astralplane', 'Blues Pills', '[object Object]', 0, 0),
(16, 1, '4PeIEk396dG60CfpmWlrCs', 'Dragonaut', 'Sleep', '[object Object]', 0, 0),
(17, 1, '0lSpF01QlNN5J2BkrMyoJi', 'Train To Nowhere', 'Savoy Brown', '[object Object]', 0, 0),
(18, 1, '2IENiPNTterTWliYOPogQS', 'Freelance Fiend', 'Leaf Hound', '[object Object]', 0, 0),
(19, 1, '3HyiHXZdB5CQTTtxIXYwJs', 'Numb', 'Gary Clark Jr.', '[object Object]', 0, 0),
(20, 1, '0iTQRy2KuwHlfU5hXFIWQN', 'Blue Mountains', 'Diamond Rugs', '[object Object]', 0, 0),
(21, 1, '5QuwldeRI8XLqDP7LPN7xJ', 'De Vida Voz', 'Allah-Las', '[object Object]', 0, 0),
(22, 1, '3kIB9guKaClVhu2FFBag4K', 'Am I In Heaven', 'King Gizzard & The Lizard Wizard', '[object Object]', 0, 0),
(23, 1, '1AWuKQ5utgc8A1TRR7MRiK', 'Sleep With the Lights On', 'The Wanton Bishops', '[object Object]', 0, 0),
(24, 1, '6ToM0uwxtPKo9CMpbPGYvM', 'Break On Through (To The Other Side)', 'The Doors', '[object Object]', 0, 0),
(25, 1, '5mglMPS52Tr5FuopEXiV6i', 'Sunday Evening', 'The Black Angels', '[object Object]', 0, 0),
(51, 3, '32W1K50AaXGXoRBn3Zyax4', 'Mathematics', 'Mos Def', '[object Object]', 0, 0),
(52, 3, '2W58HMaCbjcUfZnZaeHtcC', 'Memory Lane (Sittin\' in da Park)', 'Nas', '[object Object]', 0, 0),
(53, 3, '1AHfovSnGPVYKaahRtA0U6', 'The Message', 'Nas', '[object Object]', 0, 0),
(54, 3, '1fotoYONO343JjbC8XvPSl', 'Moment Of Truth', 'Gang Starr', '[object Object]', 0, 0),
(55, 3, '3ZXzzBuqqKNw6tdYHh6jts', 'The Ownerz', 'Gang Starr', '[object Object]', 0, 0),
(56, 3, '2FWmKZ3kNbVsKGhuNHsltW', 'Brooklyn Zoo', 'Ol\' Dirty Bastard', '[object Object]', 0, 0),
(57, 3, '1HLBN25vUhcINJ81f50ul0', 'How High', 'Redman, Method Man', '[object Object]', 0, 0),
(58, 3, '7djDOnyQLJJd2K9Yqqkvc3', 'The What', 'Method Man, The Notorious B.I.G.', '[object Object]', 0, 0),
(59, 3, '0GWE2tHjf5V0byUsSeHDN2', 'Beautiful Losers', 'Hocus Pocus, Alice Russell', '[object Object]', 0, 0),
(60, 3, '1MdrH4r4IgxmCBnqxyILux', 'J\'Attends', 'Hocus Pocus', '[object Object]', 0, 0),
(61, 3, '3n6xP5DzNoZwvQx3YbjTVC', 'Chambers (feat. Fat Jon / Nujabes)', 'Phenam, Fat Jon, Nujabes', '[object Object]', 0, 0),
(62, 3, '0RYXZvfx1cPWVVH0cZx8I6', 'Who\'s Theme', 'Nujabes', '[object Object]', 0, 0),
(63, 3, '4vmWs0Swtl5751HjIwrDV3', 'Metropolis', 'Logic', '[object Object]', 0, 0),
(64, 3, '6cjldDTVOzNmsy7tyj34jy', 'Gypsy', 'Bonobo', '[object Object]', 0, 0),
(65, 3, '5LzUdQ1YSqZaqBQ4TAZGbQ', 'Still Grimey', 'Wu-Tang Clan', '[object Object]', 0, 0),
(66, 3, '6wKIO4tGPfHG4MfO3HDOsv', 'Spin Live', 'DJ Premier', '[object Object]', 0, 0),
(67, 3, '3xTq6Q5bgWVnW3MkNXR2gE', 'PEE-AN-OH', 'DJ Premier', '[object Object]', 0, 0),
(68, 3, '5ckVDfifdJnKEabvjojde4', 'Concrete Schoolyard', 'Jurassic 5', '[object Object]', 0, 0),
(69, 3, '44DZJ5uPW13pDNH3g088dv', 'JFK 2 LAX', 'Gang Starr', '[object Object]', 0, 0),
(70, 3, '0sCoXQ8RjjeSMY7USunTsE', 'Back in the Game', 'Wu-Tang Clan, Ronald Isley', '[object Object]', 0, 0),
(71, 3, '0nwnaHLObT2ZEkrNAfryEB', 'Le Bien, Le Mal', 'Guru\'s Jazzmatazz, Guru', '[object Object]', 0, 0),
(72, 3, '3qlwWrTxktWrVXiMseo6uF', 'Twenty Fifty Three (feat. Mr. Lif)', 'L\'Orange, Kool Keith, Mr. Lif', '[object Object]', 0, 0),
(73, 3, '0HyzhcPR7HllnpHB1ZtRxw', 'Sun Burn', 'Dirty Art Club', '[object Object]', 0, 0);

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
  `fs_playlist_track` int(8) NOT NULL,
  `creation_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `type` int(8) NOT NULL COMMENT '0: Vote out | 1: Vote in again | 2: Vote to best of | 3: Vote out of best of',
  `vote_yes` int(8) NOT NULL DEFAULT '0',
  `vote_no` int(8) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `vote`
--

INSERT INTO `vote` (`id`, `fs_playlist_track`, `creation_time`, `type`, `vote_yes`, `vote_no`) VALUES
(1, 2, '2016-08-10 07:23:39', 0, 1, 0);

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
  MODIFY `id` int(8) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
--
-- AUTO_INCREMENT for table `playlist_members`
--
ALTER TABLE `playlist_members`
  MODIFY `id` int(8) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
--
-- AUTO_INCREMENT for table `playlist_tracks`
--
ALTER TABLE `playlist_tracks`
  MODIFY `id` int(8) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=74;
--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(8) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT for table `vote`
--
ALTER TABLE `vote`
  MODIFY `id` int(8) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;


--
-- Create users and grant Access to application
--
CREATE USER 'application'@'%' IDENTIFIED BY 'y7F!z6C7U#EKWsI8';
GRANT USAGE ON *.* TO 'application'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON `application`.* TO 'application'@'%';

