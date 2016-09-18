-- phpMyAdmin SQL Dump
-- version 4.5.4.1deb2ubuntu2
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Erstellungszeit: 18. Sep 2016 um 12:44
-- Server-Version: 5.7.15-0ubuntu0.16.04.1
-- PHP-Version: 7.0.8-0ubuntu0.16.04.2

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Datenbank: `application`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `daemon`
--

DROP TABLE IF EXISTS `daemon`;
CREATE TABLE `daemon` (
  `id` int(11) NOT NULL,
  `running` tinyint(4) NOT NULL DEFAULT '0' COMMENT '0 if daemon should stop'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Daten für Tabelle `daemon`
--

INSERT INTO `daemon` (`id`, `running`) VALUES
(1, 0);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `daemon_log`
--

DROP TABLE IF EXISTS `daemon_log`;
CREATE TABLE `daemon_log` (
  `id` int(11) NOT NULL,
  `fs_playlist` int(11) DEFAULT NULL,
  `type` tinyint(4) NOT NULL COMMENT '1: normal | 2: warning | 3: error',
  `message` varchar(300) NOT NULL,
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Daten für Tabelle `daemon_log`
--

INSERT INTO `daemon_log` (`id`, `fs_playlist`, `type`, `message`, `time`) VALUES
(106, 35, 1, 'Track Rays On Pinion was added back to spotify ', '2016-09-11 13:13:31'),
(107, 35, 1, 'Track Veni Vidi Vici was removed from the playlist', '2016-09-11 15:09:21'),
(108, 35, 1, 'Track Veni Vidi Vici was added back to spotify ', '2016-09-11 15:09:41'),
(109, 35, 1, 'Track Veni Vidi Vici was removed from the playlist', '2016-09-11 15:18:50'),
(110, 35, 1, 'Track Veni Vidi Vici was added back to spotify ', '2016-09-11 15:19:21'),
(111, 35, 3, 'Track on which the vote points does not exist! delete Vote!', '2016-09-11 16:22:11'),
(112, 35, 3, 'Track on which the vote points does not exist! delete Vote!', '2016-09-11 16:22:11'),
(113, 35, 3, 'Track on which the vote points does not exist! delete Vote!', '2016-09-11 16:22:21'),
(114, 35, 3, 'Track on which the vote points does not exist! delete Vote!', '2016-09-11 16:22:21'),
(115, 35, 3, 'Track on which the vote points does not exist! delete Vote!', '2016-09-11 16:23:21'),
(116, 35, 3, 'Track on which the vote points does not exist! delete Vote!', '2016-09-11 16:23:21'),
(117, 35, 1, 'Vote to delete track undefined was accepted!', '2016-09-11 16:24:00'),
(118, 35, 1, 'Vote to delete track undefined was accepted!', '2016-09-11 16:24:00'),
(119, 35, 1, 'Track Lake Of Fire was removed from the playlist', '2016-09-11 16:24:10'),
(120, 35, 1, 'Track I Sat By The Ocean was removed from the playlist', '2016-09-11 16:24:10'),
(121, 35, 1, 'Track Lake Of Fire was added back to spotify ', '2016-09-11 16:26:01'),
(122, 35, 1, 'Track I Sat By The Ocean was added back to spotify ', '2016-09-11 16:26:01'),
(123, 35, 1, 'Track Little Wing was added back to spotify ', '2016-09-12 10:15:11'),
(124, 35, 1, 'Track ...Like Clockwork was added back to spotify ', '2016-09-13 09:04:30'),
(125, 35, 1, 'Track Do I Wanna Know? was added back to spotify ', '2016-09-13 09:04:30'),
(126, 35, 1, 'Track The Vampyre Of Time And Memory was added back to spotify ', '2016-09-13 09:04:31'),
(127, 35, 1, 'Track Catamaran was added back to spotify ', '2016-09-13 09:04:31'),
(128, 35, 1, 'Track Catalina was added back to spotify ', '2016-09-13 09:04:31'),
(129, 35, 1, 'Track Silver spoon was added back to spotify ', '2016-09-13 09:04:31'),
(130, 35, 1, 'Track Hey Joe was added back to spotify ', '2016-09-13 09:04:31'),
(131, 35, 1, 'Track New Fang was added back to spotify ', '2016-09-13 09:04:31'),
(132, 35, 1, 'Track Hotel California was added back to spotify ', '2016-09-13 09:04:31'),
(133, 35, 1, 'Track Marker In The Sand was added back to spotify ', '2016-09-13 09:04:31'),
(134, 35, 1, 'Track I\'ll Cut You Down was added back to spotify ', '2016-09-13 09:04:31'),
(135, 35, 1, 'Track What\'s in My Head? was added back to spotify ', '2016-09-13 09:04:31'),
(136, 35, 1, 'Track Boys In The Wood was added back to spotify ', '2016-09-13 09:04:31'),
(137, 35, 1, 'Track Rays On Pinion was added back to spotify ', '2016-09-13 09:04:31'),
(138, 35, 1, 'Track Veni Vidi Vici was added back to spotify ', '2016-09-13 09:04:31'),
(139, 35, 1, 'Track Lake Of Fire was added back to spotify ', '2016-09-13 09:04:31'),
(140, 35, 1, 'Track I Sat By The Ocean was added back to spotify ', '2016-09-13 09:04:31'),
(141, 35, 1, 'Track Little Wing was added back to spotify ', '2016-09-13 09:04:31'),
(142, 35, 1, 'Track ...Like Clockwork was added back to spotify ', '2016-09-13 09:11:11'),
(143, 35, 1, 'Track Do I Wanna Know? was added back to spotify ', '2016-09-13 09:11:11'),
(144, 35, 1, 'Track Little Wing was added back to spotify ', '2016-09-13 09:11:11'),
(145, 35, 1, 'Track I\'ll Cut You Down was added back to spotify ', '2016-09-13 09:11:11'),
(146, 35, 1, 'Track Lake Of Fire was added back to spotify ', '2016-09-13 09:11:11'),
(147, 35, 1, 'Track I Sat By The Ocean was added back to spotify ', '2016-09-13 09:11:11'),
(148, 35, 1, 'Track The Vampyre Of Time And Memory was added back to spotify ', '2016-09-13 09:11:11'),
(149, 35, 1, 'Track Catamaran was added back to spotify ', '2016-09-13 09:11:11'),
(150, 35, 1, 'Track Catalina was added back to spotify ', '2016-09-13 09:11:11'),
(151, 35, 1, 'Track Silver spoon was added back to spotify ', '2016-09-13 09:11:11'),
(152, 35, 1, 'Track Hey Joe was added back to spotify ', '2016-09-13 09:11:11'),
(153, 35, 1, 'Track New Fang was added back to spotify ', '2016-09-13 09:11:12'),
(154, 35, 1, 'Track Hotel California was added back to spotify ', '2016-09-13 09:13:21'),
(155, 35, 1, 'Track Marker In The Sand was added back to spotify ', '2016-09-13 09:13:21'),
(156, 35, 1, 'Track Rays On Pinion was added back to spotify ', '2016-09-13 09:13:21'),
(157, 35, 1, 'Track What\'s in My Head? was added back to spotify ', '2016-09-13 09:13:21'),
(158, 35, 1, 'Track Boys In The Wood was added back to spotify ', '2016-09-13 09:13:21'),
(159, 35, 1, 'Track Veni Vidi Vici was added back to spotify ', '2016-09-13 09:13:21'),
(160, 35, 1, 'Track ...Like Clockwork was added back to spotify ', '2016-09-13 09:13:21'),
(161, 35, 1, 'Track Do I Wanna Know? was added back to spotify ', '2016-09-13 09:13:21'),
(162, 35, 1, 'Track Little Wing was added back to spotify ', '2016-09-13 09:13:21'),
(163, 35, 1, 'Track I\'ll Cut You Down was added back to spotify ', '2016-09-13 09:13:21'),
(164, 35, 1, 'Track Lake Of Fire was added back to spotify ', '2016-09-13 09:13:21'),
(165, 35, 1, 'Track I Sat By The Ocean was added back to spotify ', '2016-09-13 09:13:21'),
(166, 35, 1, 'Track The Vampyre Of Time And Memory was added back to spotify ', '2016-09-13 09:13:21'),
(167, 35, 1, 'Track Catamaran was added back to spotify ', '2016-09-13 09:13:21'),
(168, 35, 1, 'Track Catalina was added back to spotify ', '2016-09-13 09:13:21'),
(169, 35, 1, 'Track Silver spoon was added back to spotify ', '2016-09-13 09:13:21'),
(170, 35, 1, 'Track Hey Joe was added back to spotify ', '2016-09-13 09:13:21'),
(171, 35, 1, 'Track New Fang was added back to spotify ', '2016-09-13 09:13:21'),
(172, 35, 1, 'Track ...Like Clockwork was added back to spotify ', '2016-09-13 09:13:52'),
(173, 35, 1, 'Track Do I Wanna Know? was added back to spotify ', '2016-09-13 09:13:52'),
(174, 35, 1, 'Track Little Wing was added back to spotify ', '2016-09-13 09:13:52'),
(175, 35, 1, 'Track I\'ll Cut You Down was added back to spotify ', '2016-09-13 09:13:52'),
(176, 35, 1, 'Track Lake Of Fire was added back to spotify ', '2016-09-13 09:13:52'),
(177, 35, 1, 'Track I Sat By The Ocean was added back to spotify ', '2016-09-13 09:13:52'),
(178, 35, 1, 'Track The Vampyre Of Time And Memory was added back to spotify ', '2016-09-13 09:13:52'),
(179, 35, 1, 'Track Catamaran was added back to spotify ', '2016-09-13 09:13:52'),
(180, 35, 1, 'Track Catalina was added back to spotify ', '2016-09-13 09:13:52'),
(181, 35, 1, 'Track Silver spoon was added back to spotify ', '2016-09-13 09:13:52'),
(182, 35, 1, 'Track Hey Joe was added back to spotify ', '2016-09-13 09:13:52'),
(183, 35, 1, 'Track New Fang was added back to spotify ', '2016-09-13 09:13:52'),
(184, 35, 1, 'Track Hotel California was added back to spotify ', '2016-09-13 09:13:52'),
(185, 35, 1, 'Track Marker In The Sand was added back to spotify ', '2016-09-13 09:13:52'),
(186, 35, 1, 'Track Rays On Pinion was added back to spotify ', '2016-09-13 09:13:52'),
(187, 35, 1, 'Track What\'s in My Head? was added back to spotify ', '2016-09-13 09:13:52'),
(188, 35, 1, 'Track Boys In The Wood was added back to spotify ', '2016-09-13 09:13:52'),
(189, 35, 1, 'Track Veni Vidi Vici was added back to spotify ', '2016-09-13 09:13:52'),
(190, 35, 1, 'Track ...Like Clockwork was added back to spotify ', '2016-09-13 09:14:20'),
(191, 35, 1, 'Track Do I Wanna Know? was added back to spotify ', '2016-09-13 09:14:20'),
(192, 35, 1, 'Track Little Wing was added back to spotify ', '2016-09-13 09:14:20'),
(193, 35, 1, 'Track I\'ll Cut You Down was added back to spotify ', '2016-09-13 09:14:20'),
(194, 35, 1, 'Track Lake Of Fire was added back to spotify ', '2016-09-13 09:14:20'),
(195, 35, 1, 'Track I Sat By The Ocean was added back to spotify ', '2016-09-13 09:14:20'),
(196, 35, 1, 'Track The Vampyre Of Time And Memory was added back to spotify ', '2016-09-13 09:14:20'),
(197, 35, 1, 'Track Catamaran was added back to spotify ', '2016-09-13 09:14:20'),
(198, 35, 1, 'Track Catalina was added back to spotify ', '2016-09-13 09:14:20'),
(199, 35, 1, 'Track Silver spoon was added back to spotify ', '2016-09-13 09:14:20'),
(200, 35, 1, 'Track Hey Joe was added back to spotify ', '2016-09-13 09:14:20'),
(201, 35, 1, 'Track New Fang was added back to spotify ', '2016-09-13 09:14:20'),
(202, 35, 1, 'Track Hotel California was added back to spotify ', '2016-09-13 09:14:20'),
(203, 35, 1, 'Track Marker In The Sand was added back to spotify ', '2016-09-13 09:14:20'),
(204, 35, 1, 'Track Rays On Pinion was added back to spotify ', '2016-09-13 09:14:21'),
(205, 35, 1, 'Track What\'s in My Head? was added back to spotify ', '2016-09-13 09:14:21'),
(206, 35, 1, 'Track Boys In The Wood was added back to spotify ', '2016-09-13 09:14:21'),
(207, 35, 1, 'Track Veni Vidi Vici was added back to spotify ', '2016-09-13 09:14:21'),
(208, 35, 1, 'Track ...Like Clockwork was added back to spotify ', '2016-09-13 09:16:10'),
(209, 35, 1, 'Track Do I Wanna Know? was added back to spotify ', '2016-09-13 09:16:10'),
(210, 35, 1, 'Track Little Wing was added back to spotify ', '2016-09-13 09:16:11'),
(211, 35, 1, 'Track I\'ll Cut You Down was added back to spotify ', '2016-09-13 09:16:11'),
(212, 35, 1, 'Track Lake Of Fire was added back to spotify ', '2016-09-13 09:16:11'),
(213, 35, 1, 'Track I Sat By The Ocean was added back to spotify ', '2016-09-13 09:16:11'),
(214, 35, 1, 'Track The Vampyre Of Time And Memory was added back to spotify ', '2016-09-13 09:16:11'),
(215, 35, 1, 'Track Catamaran was added back to spotify ', '2016-09-13 09:16:11'),
(216, 35, 1, 'Track Catalina was added back to spotify ', '2016-09-13 09:16:11'),
(217, 35, 1, 'Track Silver spoon was added back to spotify ', '2016-09-13 09:16:11'),
(218, 35, 1, 'Track Hey Joe was added back to spotify ', '2016-09-13 09:16:11'),
(219, 35, 1, 'Track New Fang was added back to spotify ', '2016-09-13 09:16:11'),
(220, 35, 1, 'Track Hotel California was added back to spotify ', '2016-09-13 09:16:11'),
(221, 35, 1, 'Track Marker In The Sand was added back to spotify ', '2016-09-13 09:16:11'),
(222, 35, 1, 'Track Rays On Pinion was added back to spotify ', '2016-09-13 09:16:11'),
(223, 35, 1, 'Track What\'s in My Head? was added back to spotify ', '2016-09-13 09:16:11'),
(224, 35, 1, 'Track Boys In The Wood was added back to spotify ', '2016-09-13 09:16:11'),
(225, 35, 1, 'Track Veni Vidi Vici was added back to spotify ', '2016-09-13 09:16:11'),
(226, 35, 1, 'Track ...Like Clockwork was added back to spotify ', '2016-09-13 09:18:10'),
(227, 35, 1, 'Track Do I Wanna Know? was added back to spotify ', '2016-09-13 09:18:10'),
(228, 35, 1, 'Track Little Wing was added back to spotify ', '2016-09-13 09:18:10'),
(229, 35, 1, 'Track I\'ll Cut You Down was added back to spotify ', '2016-09-13 09:18:10'),
(230, 35, 1, 'Track Lake Of Fire was added back to spotify ', '2016-09-13 09:18:10'),
(231, 35, 1, 'Track I Sat By The Ocean was added back to spotify ', '2016-09-13 09:18:10'),
(232, 35, 1, 'Track The Vampyre Of Time And Memory was added back to spotify ', '2016-09-13 09:18:10'),
(233, 35, 1, 'Track Catamaran was added back to spotify ', '2016-09-13 09:18:10'),
(234, 35, 1, 'Track Catalina was added back to spotify ', '2016-09-13 09:18:10'),
(235, 35, 1, 'Track Silver spoon was added back to spotify ', '2016-09-13 09:18:10'),
(236, 35, 1, 'Track Hey Joe was added back to spotify ', '2016-09-13 09:18:11'),
(237, 35, 1, 'Track New Fang was added back to spotify ', '2016-09-13 09:18:11'),
(238, 35, 1, 'Track Hotel California was added back to spotify ', '2016-09-13 09:18:11'),
(239, 35, 1, 'Track Marker In The Sand was added back to spotify ', '2016-09-13 09:18:11'),
(240, 35, 1, 'Track Rays On Pinion was added back to spotify ', '2016-09-13 09:18:11'),
(241, 35, 1, 'Track What\'s in My Head? was added back to spotify ', '2016-09-13 09:18:11'),
(242, 35, 1, 'Track Boys In The Wood was added back to spotify ', '2016-09-13 09:18:11'),
(243, 35, 1, 'Track Veni Vidi Vici was added back to spotify ', '2016-09-13 09:18:11'),
(244, 35, 1, 'Track ...Like Clockwork was Added to sub Playlist: a new playlist name', '2016-09-13 10:52:02'),
(245, 35, 1, 'Track Do I Wanna Know? was Added to sub Playlist: a new playlist name', '2016-09-13 10:52:02'),
(246, 35, 1, 'Track Little Wing was Added to sub Playlist: a new playlist name', '2016-09-13 10:52:02'),
(247, 35, 1, 'Track I\'ll Cut You Down was Added to sub Playlist: a new playlist name', '2016-09-13 10:52:02'),
(248, 35, 2, 'Track Boys In The Wood was removed from sub playlist a new playlist name and a vote was created.', '2016-09-13 11:23:01'),
(249, 35, 1, 'Track Boys In The Wood was removed from sub playlist a new playlist name and a vote was created.', '2016-09-14 08:29:11'),
(250, 35, 1, 'Track Boys In The Wood was removed from sub playlist a new playlist name and a vote was created.', '2016-09-14 08:32:01'),
(251, 35, 1, 'Track Boys In The Wood was removed from sub playlist a new playlist name and a vote was created.', '2016-09-14 08:34:11'),
(252, 35, 1, 'Track Boys In The Wood was removed from sub playlist a new playlist name and a vote was created.', '2016-09-14 08:35:41'),
(253, 35, 1, 'Track Boys In The Wood was removed from sub playlist a new playlist name and a vote was created.', '2016-09-14 08:37:21'),
(254, 35, 1, 'Track Boys In The Wood was removed from sub playlist a new playlist name and a vote was created.', '2016-09-14 08:42:21'),
(255, 35, 1, 'Track Boys In The Wood was removed from sub playlist a new playlist name and a vote was created.', '2016-09-14 08:52:51'),
(256, 35, 1, 'Track Boys In The Wood was removed from sub playlist a new playlist name and a vote was created.', '2016-09-14 08:56:01'),
(257, 35, 1, 'Track Boys In The Wood was removed from sub playlist a new playlist name and a vote was created.', '2016-09-14 11:03:31'),
(258, 35, 1, 'Track Boys In The Wood was removed from sub playlist a new playlist name and a vote was created.', '2016-09-14 11:07:31'),
(259, 35, 1, 'Track Reckless Life (Remixed By Gilby Clarke Featuring Tracii Guns) was removed from sub playlist a new playlist name and a vote was created.', '2016-09-14 11:09:16'),
(260, 35, 1, 'Track Reckless Life (Remixed By Gilby Clarke Featuring Tracii Guns) was added to the Playlist', '2016-09-14 11:09:16'),
(261, 35, 1, 'Track Reckless Life (Remixed By Gilby Clarke Featuring Tracii Guns) was added back to spotify ', '2016-09-14 11:09:30'),
(262, 35, 1, 'Track Reckless Life (Remixed By Gilby Clarke Featuring Tracii Guns) was added to the Playlist', '2016-09-14 11:14:31'),
(263, 35, 1, 'Track Sunday Evening was added to the Playlist', '2016-09-14 11:15:16'),
(264, 35, 1, 'Track Sunday Evening was removed from sub playlist a new playlist name and a vote was created.', '2016-09-14 11:17:31'),
(265, 35, 1, 'Track Sunday Evening was added to the Playlist', '2016-09-14 11:17:31'),
(266, 35, 1, 'Track Sunday Evening was added back to spotify ', '2016-09-14 11:17:45'),
(267, 35, 1, 'Track Reckless Life (Remixed By Gilby Clarke Featuring Tracii Guns) was added to the Playlist', '2016-09-14 11:18:46'),
(268, 35, 1, 'Track Reckless Life (Remixed By Gilby Clarke Featuring Tracii Guns) was Added to sub playlist a new playlist name.', '2016-09-14 11:18:46'),
(269, 35, 1, 'Track Reckless Life (Remixed By Gilby Clarke Featuring Tracii Guns) was added back to spotify ', '2016-09-14 11:19:00'),
(270, 35, 1, 'Track Reckless Life (Remixed By Gilby Clarke Featuring Tracii Guns) was removed from the sub playlist true', '2016-09-14 11:39:46'),
(271, 35, 1, 'Track Reckless Life (Remixed By Gilby Clarke Featuring Tracii Guns) was Added to sub Playlist: a new playlist name', '2016-09-14 11:40:01'),
(272, 35, 1, 'Track Reckless Life (Remixed By Gilby Clarke Featuring Tracii Guns) was removed from the sub playlist a new playlist name', '2016-09-14 11:43:31'),
(273, 35, 1, 'Track Sunday Evening was removed from sub playlist a new playlist name and a vote was created.', '2016-09-14 12:11:21'),
(274, 35, 1, 'Track Sunday Evening was removed from sub playlist a new playlist name and a vote was created.', '2016-09-14 12:15:01'),
(275, 35, 1, 'Track Sunday Evening was removed from sub playlist a new playlist name and a vote was created.', '2016-09-14 12:19:31'),
(276, 35, 1, 'Track Sunday Evening was removed from sub playlist a new playlist name and a vote was created.', '2016-09-14 12:22:46'),
(277, 35, 1, 'Track Sunday Evening was removed from sub playlist a new playlist name and a vote was created.', '2016-09-14 12:23:46'),
(278, 35, 1, 'Track Sunday Evening was removed from sub playlist a new playlist name and a vote was created.', '2016-09-14 12:24:46'),
(279, 35, 1, 'Track Sunday Evening was removed from sub playlist a new playlist name and a vote was created.', '2016-09-14 12:31:31'),
(280, 35, 1, 'Track Sunday Evening was removed from sub playlist a new playlist name and a vote was created.', '2016-09-14 12:32:46'),
(281, 35, 1, 'Track Sunday Evening was removed from sub playlist a new playlist name and a vote was created.', '2016-09-14 12:34:30'),
(282, 35, 1, 'Track Sunday Evening was removed from sub playlist a new playlist name and a vote was created.', '2016-09-14 12:35:16'),
(283, 35, 1, 'Track Sunday Evening was removed from sub playlist a new playlist name and a vote was created.', '2016-09-14 12:36:31'),
(284, 35, 1, 'Track Sunday Evening was removed from sub playlist a new playlist name and a vote was created.', '2016-09-14 12:41:01'),
(285, 35, 1, 'Vote to add Track Sunday Evening to sub playlist was accepted!', '2016-09-14 12:56:45'),
(286, 35, 1, 'Track Sunday Evening was removed from sub playlist a new playlist name and a vote was created.', '2016-09-14 13:02:46'),
(287, 35, 1, 'Track Sunday Evening was removed from sub playlist a new playlist name and a vote was created.', '2016-09-14 13:08:30'),
(288, 35, 1, 'Vote to add Track Sunday Evening to sub playlist was accepted!', '2016-09-14 13:09:00'),
(289, 35, 1, 'Track Sunday Evening was Added to sub Playlist: a new playlist name', '2016-09-14 13:09:15'),
(290, 35, 1, 'Track Sunday Evening was removed from the sub playlist a new playlist name', '2016-09-14 13:16:30'),
(291, 1, 2, 'Duplicate track ...Like Clockwork was removed from the playlist.', '2016-09-14 13:18:00'),
(292, 1, 3, 'Could not add tracks to Spotify playlist. Wrong request! {"error":{"status":403,"message":"You cannot remove tracks from a playlist you don\'t own."}}', '2016-09-14 13:18:01'),
(293, 1, 2, 'Duplicate track ...Like Clockwork was removed from the playlist.', '2016-09-14 13:18:16'),
(294, 1, 3, 'Could not add tracks to Spotify playlist. Wrong request! {"error":{"status":403,"message":"You cannot remove tracks from a playlist you don\'t own."}}', '2016-09-14 13:18:16'),
(295, 1, 2, 'Duplicate track ...Like Clockwork was removed from the playlist.', '2016-09-14 13:18:30'),
(296, 1, 3, 'Could not add tracks to Spotify playlist. Wrong request! {"error":{"status":403,"message":"You cannot remove tracks from a playlist you don\'t own."}}', '2016-09-14 13:18:31'),
(297, 1, 2, 'Duplicate track ...Like Clockwork was removed from the playlist.', '2016-09-14 13:29:01'),
(298, 1, 3, 'Could not add tracks to Spotify playlist. Wrong request! {"error":{"status":403,"message":"You cannot remove tracks from a playlist you don\'t own."}}', '2016-09-14 13:29:01'),
(299, 1, 2, 'Duplicate track ...Like Clockwork was removed from the playlist.', '2016-09-14 13:32:00'),
(300, 1, 3, 'Could not add tracks to Spotify playlist. Wrong request! {"error":{"status":403,"message":"You cannot remove tracks from a playlist you don\'t own."}}', '2016-09-14 13:32:00'),
(301, 1, 2, 'Duplicate track ...Like Clockwork was removed from the playlist.', '2016-09-14 13:32:46'),
(302, 1, 3, 'Could not add tracks to Spotify playlist. Wrong request! {"error":{"status":403,"message":"You cannot remove tracks from a playlist you don\'t own."}}', '2016-09-14 13:32:46'),
(303, 1, 2, 'Duplicate track ...Like Clockwork was removed from the playlist.', '2016-09-15 08:22:46'),
(304, 1, 3, 'Could not add tracks to Spotify playlist. Wrong request! {"error":{"status":403,"message":"You cannot remove tracks from a playlist you don\'t own."}}', '2016-09-15 08:22:46'),
(305, 1, 2, 'Duplicate track ...Like Clockwork was removed from the playlist.', '2016-09-15 08:28:46'),
(306, 1, 3, 'Could not add tracks to Spotify playlist. Wrong request! {"error":{"status":403,"message":"You cannot remove tracks from a playlist you don\'t own."}}', '2016-09-15 08:28:46'),
(307, 1, 2, 'Duplicate track ...Like Clockwork was removed from the playlist.', '2016-09-15 08:38:46'),
(308, 1, 3, 'Could not add tracks to Spotify playlist. Wrong request! {"error":{"status":403,"message":"You cannot remove tracks from a playlist you don\'t own."}}', '2016-09-15 08:38:47'),
(309, 1, 2, 'Duplicate track ...Like Clockwork was removed from the playlist.', '2016-09-15 08:44:46'),
(310, 1, 3, 'Could not add tracks to Spotify playlist. Wrong request! {"error":{"status":403,"message":"You cannot remove tracks from a playlist you don\'t own."}}', '2016-09-15 08:44:47'),
(311, 1, 2, 'Duplicate track ...Like Clockwork was removed from the playlist.', '2016-09-15 08:47:31'),
(312, 1, 3, 'Could not add tracks to Spotify playlist. Wrong request! {"error":{"status":403,"message":"You cannot remove tracks from a playlist you don\'t own."}}', '2016-09-15 08:47:31'),
(313, 1, 2, 'Duplicate track ...Like Clockwork was removed from the playlist.', '2016-09-15 08:49:31'),
(314, 1, 3, 'Could not add tracks to Spotify playlist. Wrong request! {"error":{"status":403,"message":"You cannot remove tracks from a playlist you don\'t own."}}', '2016-09-15 08:49:31'),
(315, 1, 2, 'Duplicate track ...Like Clockwork was removed from the playlist.', '2016-09-15 08:51:01'),
(316, 1, 3, 'Could not add tracks to Spotify playlist. Wrong request! {"error":{"status":403,"message":"You cannot remove tracks from a playlist you don\'t own."}}', '2016-09-15 08:51:02'),
(317, 1, 2, 'Duplicate track ...Like Clockwork was removed from the playlist.', '2016-09-15 08:52:31'),
(318, 1, 3, 'Could not add tracks to Spotify playlist. Wrong request! {"error":{"status":403,"message":"You cannot remove tracks from a playlist you don\'t own."}}', '2016-09-15 08:52:32'),
(319, 1, 2, 'Duplicate track ...Like Clockwork was removed from the playlist.', '2016-09-15 08:55:46'),
(320, 1, 2, 'Duplicate track ...Like Clockwork was removed from the playlist.', '2016-09-15 08:56:01'),
(321, 1, 2, 'Duplicate track ...Like Clockwork was removed from the playlist.', '2016-09-15 08:58:01'),
(322, 1, 2, 'Duplicate track ...Like Clockwork was removed from the playlist.', '2016-09-15 09:00:01'),
(323, 1, 2, 'Duplicate track ...Like Clockwork was removed from the playlist.', '2016-09-15 09:01:16'),
(324, 1, 2, 'Duplicate track ...Like Clockwork was removed from the playlist.', '2016-09-15 09:02:46'),
(325, 1, 3, 'Could not add tracks to Spotify playlist. Wrong request! {"error":{"status":403,"message":"You cannot remove tracks from a playlist you don\'t own."}}', '2016-09-15 09:02:46'),
(326, 1, 2, 'Duplicate track ...Like Clockwork was removed from the playlist.', '2016-09-15 09:03:06'),
(327, 1, 3, 'Could not add tracks to Spotify playlist. Wrong request! {"error":{"status":403,"message":"You cannot remove tracks from a playlist you don\'t own."}}', '2016-09-15 09:03:06'),
(328, 1, 2, 'Duplicate track ...Like Clockwork was removed from the playlist.', '2016-09-15 09:03:16'),
(329, 1, 3, 'Could not add tracks to Spotify playlist. Wrong request! {"error":{"status":403,"message":"You cannot remove tracks from a playlist you don\'t own."}}', '2016-09-15 09:03:16'),
(330, 1, 2, 'Duplicate track ...Like Clockwork was removed from the playlist.', '2016-09-15 09:03:31'),
(331, 1, 3, 'Could not add tracks to Spotify playlist. Wrong request! {"error":{"status":403,"message":"You cannot remove tracks from a playlist you don\'t own."}}', '2016-09-15 09:03:31'),
(332, 1, 2, 'Duplicate track ...Like Clockwork was removed from the playlist.', '2016-09-15 09:03:46'),
(333, 1, 3, 'Could not add tracks to Spotify playlist. Wrong request! {"error":{"status":403,"message":"You cannot remove tracks from a playlist you don\'t own."}}', '2016-09-15 09:03:46'),
(334, 1, 2, 'Duplicate track ...Like Clockwork was removed from the playlist.', '2016-09-15 09:04:01'),
(335, 1, 3, 'Could not add tracks to Spotify playlist. Wrong request! {"error":{"status":403,"message":"You cannot remove tracks from a playlist you don\'t own."}}', '2016-09-15 09:04:01'),
(336, 1, 2, 'Duplicate track ...Like Clockwork was removed from the playlist.', '2016-09-15 09:04:16'),
(337, 1, 3, 'Could not add tracks to Spotify playlist. Wrong request! {"error":{"status":403,"message":"You cannot remove tracks from a playlist you don\'t own."}}', '2016-09-15 09:04:16'),
(338, 1, 2, 'Duplicate track ...Like Clockwork was removed from the playlist.', '2016-09-15 09:04:31'),
(339, 1, 3, 'Could not add tracks to Spotify playlist. Wrong request! {"error":{"status":403,"message":"You cannot remove tracks from a playlist you don\'t own."}}', '2016-09-15 09:04:31'),
(340, 1, 2, 'Duplicate track ...Like Clockwork was removed from the playlist.', '2016-09-15 09:04:46'),
(341, 1, 3, 'Could not add tracks to Spotify playlist. Wrong request! {"error":{"status":403,"message":"You cannot remove tracks from a playlist you don\'t own."}}', '2016-09-15 09:04:46'),
(342, 1, 2, 'Duplicate track ...Like Clockwork was removed from the playlist.', '2016-09-15 09:05:01'),
(343, 1, 3, 'Could not add tracks to Spotify playlist. Wrong request! {"error":{"status":403,"message":"You cannot remove tracks from a playlist you don\'t own."}}', '2016-09-15 09:05:01'),
(344, 1, 2, 'Duplicate track ...Like Clockwork was removed from the playlist.', '2016-09-15 09:05:16'),
(345, 1, 3, 'Could not add tracks to Spotify playlist. Wrong request! {"error":{"status":403,"message":"You cannot remove tracks from a playlist you don\'t own."}}', '2016-09-15 09:05:16'),
(346, 1, 2, 'Duplicate track ...Like Clockwork was removed from the playlist.', '2016-09-15 09:05:31'),
(347, 1, 3, 'Could not add tracks to Spotify playlist. Wrong request! {"error":{"status":403,"message":"You cannot remove tracks from a playlist you don\'t own."}}', '2016-09-15 09:05:31'),
(348, 1, 2, 'Duplicate track ...Like Clockwork was removed from the playlist.', '2016-09-15 09:05:46'),
(349, 1, 3, 'Could not add tracks to Spotify playlist. Wrong request! {"error":{"status":403,"message":"You cannot remove tracks from a playlist you don\'t own."}}', '2016-09-15 09:05:46'),
(350, 1, 2, 'Duplicate track ...Like Clockwork was removed from the playlist.', '2016-09-15 09:06:15'),
(351, 1, 2, 'Duplicate track Do I Wanna Know? was removed from the playlist.', '2016-09-15 09:08:01');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `member_vote`
--

DROP TABLE IF EXISTS `member_vote`;
CREATE TABLE `member_vote` (
  `id` int(11) NOT NULL,
  `fs_member` int(11) NOT NULL,
  `fs_vote` int(11) NOT NULL,
  `vote_yes` tinyint(4) NOT NULL COMMENT '0: Voted no | 1: Voted Yes | -1: did not vote'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Daten für Tabelle `member_vote`
--

INSERT INTO `member_vote` (`id`, `fs_member`, `fs_vote`, `vote_yes`) VALUES
(4, 34, 19, 1);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `playlist`
--

DROP TABLE IF EXISTS `playlist`;
CREATE TABLE `playlist` (
  `id` int(11) NOT NULL,
  `spotify_id` varchar(50) COLLATE latin1_german2_ci NOT NULL,
  `name` varchar(50) COLLATE latin1_german2_ci NOT NULL,
  `fs_owner` int(11) NOT NULL,
  `vote_time` int(11) NOT NULL DEFAULT '691200' COMMENT 'in seconds, default: 8 days',
  `delete_playlist_active` tinyint(4) NOT NULL DEFAULT '0' COMMENT 'boolean',
  `delete_playlist_spotify_id` varchar(50) COLLATE latin1_german2_ci DEFAULT NULL,
  `playlist_permission` tinyint(4) NOT NULL DEFAULT '0' COMMENT '0: Open for all | 1: Add and create Vote if not member | 2: delete Tracks from unauthorized Users',
  `member_policy` tinyint(4) NOT NULL DEFAULT '1' COMMENT '0: add all to member | 1: add if track was added one week earlyer | 3: manually add members'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_german2_ci;

--
-- Daten für Tabelle `playlist`
--

INSERT INTO `playlist` (`id`, `spotify_id`, `name`, `fs_owner`, `vote_time`, `delete_playlist_active`, `delete_playlist_spotify_id`, `playlist_permission`, `member_policy`) VALUES
(35, '5fI00aNUuv9s1ACQgvCAT3', 'Sex, Drugs & Rock\'n\'roll', 1, 691200, 0, NULL, 2, 2);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `playlist_members`
--

DROP TABLE IF EXISTS `playlist_members`;
CREATE TABLE `playlist_members` (
  `id` int(11) NOT NULL,
  `fs_user` int(11) NOT NULL,
  `fs_playlist` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_german2_ci;

--
-- Daten für Tabelle `playlist_members`
--

INSERT INTO `playlist_members` (`id`, `fs_user`, `fs_playlist`) VALUES
(34, 1, 35);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `sub_playlist`
--

DROP TABLE IF EXISTS `sub_playlist`;
CREATE TABLE `sub_playlist` (
  `id` int(11) NOT NULL,
  `name` varchar(50) COLLATE latin1_german2_ci NOT NULL,
  `spotify_id` varchar(50) COLLATE latin1_german2_ci NOT NULL,
  `fs_playlist` int(11) NOT NULL,
  `vote_time` int(11) DEFAULT NULL COMMENT 'in seconds, if null, it will take settings from playlist',
  `allow_add` tinyint(4) NOT NULL DEFAULT '0' COMMENT 'boolean'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_german2_ci;

--
-- Daten für Tabelle `sub_playlist`
--

INSERT INTO `sub_playlist` (`id`, `name`, `spotify_id`, `fs_playlist`, `vote_time`, `allow_add`) VALUES
(1, 'a new playlist name', '74kZyhDVjlvifSVzCynbjv', 35, NULL, 0);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `sub_playlist_track`
--

DROP TABLE IF EXISTS `sub_playlist_track`;
CREATE TABLE `sub_playlist_track` (
  `id` int(11) NOT NULL,
  `fs_sub_playlist` int(11) NOT NULL,
  `fs_track` int(11) NOT NULL,
  `deleted` tinyint(4) NOT NULL DEFAULT '0',
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Daten für Tabelle `sub_playlist_track`
--

INSERT INTO `sub_playlist_track` (`id`, `fs_sub_playlist`, `fs_track`, `deleted`, `deleted_at`) VALUES
(1, 1, 456, 0, NULL),
(2, 1, 460, 0, NULL),
(3, 1, 462, 0, NULL),
(4, 1, 467, 0, NULL),
(9, 1, 476, 1, '2016-09-14 15:15:20');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `track`
--

DROP TABLE IF EXISTS `track`;
CREATE TABLE `track` (
  `id` int(11) NOT NULL,
  `fs_playlist` int(11) NOT NULL,
  `spotify_id` varchar(50) COLLATE latin1_german2_ci NOT NULL,
  `name` varchar(100) COLLATE latin1_german2_ci NOT NULL,
  `artist` varchar(100) COLLATE latin1_german2_ci NOT NULL,
  `album` varchar(100) COLLATE latin1_german2_ci NOT NULL,
  `added_at` datetime NOT NULL,
  `added_by` text COLLATE latin1_german2_ci NOT NULL COMMENT 'spotify_id of user',
  `deleted` tinyint(4) NOT NULL DEFAULT '0' COMMENT '1 or 0',
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_german2_ci;

--
-- Daten für Tabelle `track`
--

INSERT INTO `track` (`id`, `fs_playlist`, `spotify_id`, `name`, `artist`, `album`, `added_at`, `added_by`, `deleted`, `deleted_at`) VALUES
(454, 35, '3aKJVWH2QOsaMtiCLxYHZX', 'Lake Of Fire', 'Nirvana', 'MTV Unplugged In New York', '2016-09-13 11:18:10', 'tiborjaner', 0, NULL),
(455, 35, '7oXRMDUzBPekkLRTJhSGvC', 'I Sat By The Ocean', 'Queens of the Stone Age', '...Like Clockwork', '2016-09-13 11:18:10', 'tiborjaner', 0, NULL),
(456, 35, '2v8sPwkqVDgWprsmGIis25', '...Like Clockwork', 'Queens of the Stone Age', '...Like Clockwork', '2016-09-13 11:18:10', 'tiborjaner', 0, NULL),
(457, 35, '5q453TyHMg7pxYdNG9nufn', 'The Vampyre Of Time And Memory', 'Queens of the Stone Age', '...Like Clockwork', '2016-09-13 11:18:10', 'tiborjaner', 0, NULL),
(458, 35, '36HX9lygdofc2nUOB3okMN', 'Catamaran', 'Allah-Las', 'Allah-Las', '2016-09-13 11:18:10', 'tiborjaner', 0, NULL),
(459, 35, '1gWYNWAhAqyfnYLCXVcc82', 'Catalina', 'Allah-Las', 'Allah-Las', '2016-09-13 11:18:10', 'tiborjaner', 0, NULL),
(460, 35, '3jfr0TF6DQcOLat8gGn7E2', 'Do I Wanna Know?', 'Arctic Monkeys', 'AM', '2016-09-13 11:18:10', 'tiborjaner', 0, NULL),
(461, 35, '0HeWUiIx8o1ekaLIbzMtkK', 'Silver spoon', 'Eric Bibb', 'Blues people', '2016-09-13 11:18:10', 'tiborjaner', 0, NULL),
(462, 35, '1Eolhana7nKHYpcYpdVcT5', 'Little Wing', 'Jimi Hendrix', 'Axis: Bold As Love', '2016-09-13 11:18:10', 'tiborjaner', 0, NULL),
(463, 35, '0NWPxcsf5vdjdiFUI8NgkP', 'Hey Joe', 'Jimi Hendrix', 'Are You Experienced', '2016-09-13 11:18:10', 'tiborjaner', 0, NULL),
(464, 35, '37chc886yyUq0amK9lfwhM', 'New Fang', 'Them Crooked Vultures', 'Them Crooked Vultures', '2016-09-13 11:18:10', 'tiborjaner', 0, NULL),
(465, 35, '40riOy7x9W7GXjyGp4pjAv', 'Hotel California', 'Eagles', 'Hotel California (Remastered)', '2016-09-13 11:18:10', 'tiborjaner', 0, NULL),
(466, 35, '5yMTdC1aFsDPt1ZjBXU9lR', 'Marker In The Sand', 'Pearl Jam', 'Pearl Jam', '2016-09-13 11:18:10', 'tiborjaner', 0, NULL),
(467, 35, '3tBbcuulKDC1o2odykT18R', 'I\'ll Cut You Down', 'Uncle Acid & The Deadbeats', 'Blood Lust', '2016-09-13 11:18:10', 'tiborjaner', 0, NULL),
(468, 35, '6ouq07JR52uMIDnHhFbrQ2', 'Rays On Pinion', 'Baroness', 'The Red Album', '2016-09-13 11:18:10', 'tiborjaner', 0, NULL),
(469, 35, '1CW1CIucafZQqlqMHvCAZa', 'What\'s in My Head?', 'Fuzz', 'Fuzz', '2016-09-13 11:18:10', 'tiborjaner', 0, NULL),
(470, 35, '0qAPxT4KrKWhPeUNhJqtZS', 'Boys In The Wood', 'Black Lips', 'Underneath the Rainbow (Bonus Track Version)', '2016-09-13 11:18:10', 'tiborjaner', 0, NULL),
(472, 35, '5Z5YEyR5i8V8Ui2e5jGAAm', 'Veni Vidi Vici', 'Black Lips', 'Good Bad Not Evil', '2016-09-13 11:18:10', 'tiborjaner', 0, NULL),
(476, 35, '5mglMPS52Tr5FuopEXiV6i', 'Sunday Evening', 'The Black Angels', 'Clear Lake Forest', '2016-09-14 13:17:45', 'tiborjaner', 0, NULL),
(477, 35, '3pLzBdp8UXo0Vv4fBH42Ok', 'Reckless Life (Remixed By Gilby Clarke Featuring Tracii Guns)', 'Hollywood Rose', 'The Roots of Guns ‘n Roses', '2016-09-14 13:19:00', 'tiborjaner', 0, NULL);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `user`
--

DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `spotify_id` varchar(255) COLLATE latin1_german2_ci NOT NULL,
  `creation_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `refresh_token` varchar(300) COLLATE latin1_german2_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_german2_ci;

--
-- Daten für Tabelle `user`
--

INSERT INTO `user` (`id`, `spotify_id`, `creation_time`, `refresh_token`) VALUES
(1, 'tiborjaner', '2016-08-04 22:02:13', 'AQA21UrzldYWjaUsopwiYumtEanDe811VZ5hsx1x1ZWy65oFa20sRKK3QIlZofyFwqUgtfsp8EoGswuzBbzwhTC8DV557mQrBZDIA0gwo-m82bPw4EDptw5KgxfVmDiFygI'),
(2, 'testUser', '2016-08-21 16:04:52', NULL),
(3, 'spotivoapplication', '2016-08-25 14:22:22', 'AQBSMTGcM6-sJMK5t1yIxW5XDMPlGeZ3FExwfWkaG38mIYLum33RKqp-0ZW-9G1VKJuNbFDC88Zqo6sfniQoD8slp1ahzqotnrBU6hF39BFIiUkMKpkwriKoNBYqizHc6lE');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `vote`
--

DROP TABLE IF EXISTS `vote`;
CREATE TABLE `vote` (
  `id` int(11) NOT NULL,
  `fs_track` int(11) NOT NULL,
  `end_time` datetime NOT NULL,
  `type` tinyint(4) NOT NULL COMMENT '0: Undefined | 1: Delete | 2: AddRemove | 3: move',
  `vote_yes` int(11) NOT NULL DEFAULT '0',
  `vote_no` int(11) NOT NULL DEFAULT '0',
  `sub_playlist_1` int(11) DEFAULT NULL COMMENT 'used for: type 2, 3',
  `sub_playlist_2` int(11) DEFAULT NULL COMMENT 'used for: type 3',
  `message` varchar(300) DEFAULT NULL,
  `executed` tinyint(4) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Daten für Tabelle `vote`
--

INSERT INTO `vote` (`id`, `fs_track`, `end_time`, `type`, `vote_yes`, `vote_no`, `sub_playlist_1`, `sub_playlist_2`, `message`, `executed`) VALUES
(19, 470, '2016-09-23 14:07:17', 2, 1, 0, 1, NULL, NULL, 0);

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `daemon`
--
ALTER TABLE `daemon`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `daemon_log`
--
ALTER TABLE `daemon_log`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `member_vote`
--
ALTER TABLE `member_vote`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `playlist`
--
ALTER TABLE `playlist`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `playlist_members`
--
ALTER TABLE `playlist_members`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `sub_playlist`
--
ALTER TABLE `sub_playlist`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `sub_playlist_track`
--
ALTER TABLE `sub_playlist_track`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `track`
--
ALTER TABLE `track`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_index` (`fs_playlist`,`spotify_id`);

--
-- Indizes für die Tabelle `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `vote`
--
ALTER TABLE `vote`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `daemon`
--
ALTER TABLE `daemon`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT für Tabelle `daemon_log`
--
ALTER TABLE `daemon_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=352;
--
-- AUTO_INCREMENT für Tabelle `member_vote`
--
ALTER TABLE `member_vote`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
--
-- AUTO_INCREMENT für Tabelle `playlist`
--
ALTER TABLE `playlist`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;
--
-- AUTO_INCREMENT für Tabelle `playlist_members`
--
ALTER TABLE `playlist_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;
--
-- AUTO_INCREMENT für Tabelle `sub_playlist`
--
ALTER TABLE `sub_playlist`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT für Tabelle `sub_playlist_track`
--
ALTER TABLE `sub_playlist_track`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;
--
-- AUTO_INCREMENT für Tabelle `track`
--
ALTER TABLE `track`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=478;
--
-- AUTO_INCREMENT für Tabelle `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
--
-- AUTO_INCREMENT für Tabelle `vote`
--
ALTER TABLE `vote`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
