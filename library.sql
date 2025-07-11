-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : ven. 11 juil. 2025 à 16:13
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `library`
--

-- --------------------------------------------------------

--
-- Structure de la table `books`
--

CREATE TABLE `books` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `author` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `pdf_url` varchar(255) DEFAULT NULL,
  `publication_date` date DEFAULT NULL,
  `genre` varchar(255) DEFAULT NULL,
  `location_era` varchar(255) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `books`
--

INSERT INTO `books` (`id`, `title`, `author`, `description`, `image_url`, `pdf_url`, `publication_date`, `genre`, `location_era`, `quantity`) VALUES
(9, 'Les Misérables', 'Victor hugo', 'Ce chef-d\'œuvre de Victor Hugo suit la vie de Jean Valjean, un ancien bagnard qui tente de se racheter après avoir purgé 19 ans de prison pour avoir volé un morceau de pain. Libéré sous condition, il est traqué par le rigide policier Javert, qui croit en une justice inflexible.  \n\nAu fil du récit, Valjean devient un homme respectable, adoptant la jeune Cosette, une orpheline maltraitée par les Thénardier. Le roman explore aussi la misère sociale, l\'injustice, et les luttes politiques de la France post-révolutionnaire, notamment à travers la révolte de juin 1832 menée par des étudiants révolutionnaires comme  Enjolras', 'uploads\\1742556405112-383219503.jpeg', 'uploads\\1742556405128-245653801.pdf', '0000-00-00', 'Roman historique, social et philosophique', 'France, début du XIXe siècle', 1),
(10, 'La Nuit blanche de Zoé  \r\n', 'Mirela Vardi', 'Zoé et son cousin Rémi sont en vacances aux sports d\'hvr.Un soir, Zoé, vêtue entièrement de blanc, décide de descendre une piste vre.Sa tenue la rend presque invisible dans le paysage enneigé, ce qui s\'avère dangeex.Lors d\'une sortie nocturne en luge, elle chute et perd sa montre en or sous la nie.Ses amis partent alors chercher Monsieur Paul, le professeur de ski d\'Elsa, accompagné de son chien de montagne, pour l\'adr.Cette aventure nocturne mènera Zoé vers des découvertes inattendues, mêlant amour et frissons face à une avalanche imminnte', 'uploads\\1742557419829-401532319.jpeg', 'uploads\\1742557419869-612673851.pdf', '2006-02-08', 'Lecture en français facile \r\n', 'Station de sports d\'hiver, époque contemporaine', 17),
(11, 'Yehhw', '7', 'Usshshs', 'uploads\\1742815319923-12702589.jpeg', 'uploads\\1742815319926-772981884.pdf', '2002-03-24', 'Jsjshd', 'Jsjdhs', 15),
(12, '6yy', 'Gyeg la ', 'Dh5b5j', 'uploads\\1742815979515-391208128.jpeg', 'uploads\\1742815979519-320930714.pdf', '2002-12-24', 'Verheh', 'Dbtj5j5', 12),
(13, 'Ri5jtj', 'Fu4j5j', 'Fjrkt', 'uploads\\1744886212699-713309558.jpeg', 'uploads\\1744886212723-288192137.pdf', '0000-00-00', 'Dhrj4i', 'Nrjtjt2', 16);

-- --------------------------------------------------------

--
-- Structure de la table `borrows`
--

CREATE TABLE `borrows` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `status` enum('pending','approved','rejected','borrowed','returned') DEFAULT 'pending',
  `request_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `approval_date` timestamp NULL DEFAULT NULL,
  `borrow_date` timestamp NULL DEFAULT NULL,
  `return_date` timestamp NULL DEFAULT NULL,
  `admin_notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `borrows`
--

INSERT INTO `borrows` (`id`, `user_id`, `book_id`, `status`, `request_date`, `approval_date`, `borrow_date`, `return_date`, `admin_notes`) VALUES
(1, 19, 10, 'returned', '2025-03-22 11:23:37', '2025-03-22 11:50:25', '2025-03-22 12:00:02', '2025-03-22 12:48:51', 'salam demend dylk t9ablate '),
(3, 19, 9, 'returned', '2025-03-22 12:01:23', '2025-03-22 13:09:31', '2025-03-24 11:23:16', '2025-04-17 09:55:27', 'salam \nRetour confirmé'),
(4, 19, 10, 'returned', '2025-03-22 13:20:22', '2025-03-24 11:39:50', '2025-03-24 11:43:38', '2025-04-17 09:23:04', 'Ff\nRetour confirmé'),
(5, 20, 12, 'rejected', '2025-04-16 14:39:01', '2025-04-16 15:22:09', NULL, NULL, NULL),
(6, 21, 10, 'borrowed', '2025-04-17 09:56:55', '2025-04-17 09:57:33', '2025-04-17 10:44:12', NULL, NULL),
(7, 18, 9, 'borrowed', '2025-04-17 10:00:00', '2025-04-17 10:00:25', '2025-04-17 10:43:58', NULL, NULL),
(8, 21, 11, 'borrowed', '2025-04-17 10:04:20', '2025-04-17 10:09:32', '2025-04-17 10:43:44', NULL, 'D\'accord '),
(9, 21, 12, 'returned', '2025-04-17 10:04:38', '2025-04-17 10:05:12', '2025-04-17 10:11:33', '2025-04-17 10:49:20', 'Oki\nRetour confirmé'),
(13, 23, 13, 'returned', '2025-04-18 15:20:54', '2025-04-18 15:22:16', '2025-04-19 09:23:05', '2025-04-19 09:23:58', NULL),
(14, 23, 11, 'pending', '2025-04-19 09:24:04', NULL, NULL, NULL, NULL),
(15, 23, 9, 'pending', '2025-04-20 12:40:11', NULL, NULL, NULL, NULL),
(16, 26, 9, 'returned', '2025-04-20 13:11:41', '2025-04-20 13:13:18', '2025-04-20 13:14:57', '2025-04-20 13:15:58', NULL),
(17, 26, 12, 'rejected', '2025-04-20 13:11:46', '2025-04-20 13:13:22', NULL, NULL, NULL),
(18, 26, 10, 'borrowed', '2025-04-20 13:17:02', '2025-04-20 13:17:29', '2025-04-20 13:17:33', NULL, NULL),
(19, 26, 9, 'rejected', '2025-04-20 13:17:10', '2025-04-24 09:31:09', NULL, NULL, NULL),
(21, 29, 10, 'returned', '2025-04-24 09:27:09', '2025-04-24 09:30:43', '2025-04-24 09:30:59', '2025-04-24 15:58:49', 'D\'accord '),
(22, 29, 9, 'pending', '2025-04-24 15:58:27', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `role` varchar(50) DEFAULT 'user',
  `profile_image` varchar(255) DEFAULT 'https://via.placeholder.com/150'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `created_at`, `role`, `profile_image`) VALUES
(1, 'John Doe', 'johndoe@example.com', '$2b$10$My25vy4PxXoqlLhJyuI/Ne3Dv5Jw/O261LoanWO4SVXvm6vwyXJIe', '2025-03-14 16:58:28', 'user', 'https://via.placeholder.com/150'),
(2, 'John Doe', 'aa123@gmail.com', '$2b$10$PnCfLVapdbjFjvUsapmnXO88iJl.ujx3UEbTTtT2CxXLDJYT/tyT6', '2025-03-15 11:05:18', 'user', 'https://via.placeholder.com/150'),
(3, 'abdo', 'aa25@gmail.com', '$2b$10$V1fjO.MxJkCehikMj2RRsu/1lnKKrLdRxP6AcZMDiSGr4e0yY.kcC', '2025-03-15 11:15:08', 'user', 'https://via.placeholder.com/150'),
(6, 'abdo', 'a4a25@gmail.com', '$2b$10$016EasZzdYzFsvr24dwqcO5SlNmE/KD3FqiKOziJZ5PcnZh3UqjmK', '2025-03-15 11:16:31', 'user', 'https://via.placeholder.com/150'),
(7, 'abdo', 'aa124@gmail.com', '123456', '2025-03-15 11:53:30', 'admin', 'https://via.placeholder.com/150'),
(8, 'yutryugi', 'hgfghjg@gmail.com', '$2b$10$HIMTRcmRMpOrN8iYu4u6YuRVEXQ1egL3.zE4p91ZGoPa/Ki4mOJy.', '2025-03-15 11:59:21', 'user', 'https://via.placeholder.com/150'),
(9, 'abdo', 'kk123@gmail.com', '123456', '2025-03-15 13:22:57', 'user', 'https://via.placeholder.com/150'),
(10, 'oiuyt', 'uyt@gmail.com', '$2b$10$P5Q6/0qgCU0L280L3IM7jemdlJnPOPgKQ7t2HcDEX8UmlZ7IwtNBO', '2025-03-15 13:23:57', 'user', 'https://via.placeholder.com/150'),
(15, 'jhgytyfgh', 'uiykjuym@gmai.com', '$2b$10$bLXsdfkvvTa2qcxEtK6Fle/3tPLasmxlF3ApQLI7Ts.Z3nwx6x5Y6', '2025-03-15 13:26:51', 'user', 'https://via.placeholder.com/150'),
(16, 'Aymen', 'aa@gmail.com', '$2b$10$276t1FTYB4UMQP.oF62n/uHgDXxWZqRyCzKLee8y3TBG1GBaUcumG', '2025-03-16 14:17:06', 'user', 'https://via.placeholder.com/150'),
(17, 'Zenabdin', 'zz123@gmail.com', '$2b$10$LagDTOBab1y6qYFYANKP3.WlgX4iswJ0aRG30gKRy3voyDv1DFPPK', '2025-03-17 19:21:24', 'user', 'https://via.placeholder.com/150'),
(18, 'Abdo', 'aa111@gmail.com', '$2b$10$53xvvdFMkMM25gYIjgWbxuf5kv7Kcj08f0FG8MwV22qBoWDsGBGAa', '2025-03-21 12:16:26', 'admin', 'https://via.placeholder.com/150'),
(19, 'Us1', 'aa1@gmail.com', '$2b$10$xITDCAefNVNOmh/OYUtHHOjc59M.hMXqppKi36UknKpI5cFltuXAG', '2025-03-21 12:31:25', 'user', 'https://via.placeholder.com/150'),
(20, 'yuup', 'yy@gmail.com', '$2b$10$UMezkEfloJNiBXH2pCGvd.8ruJNKBHC1zepGrpg4TdprthVtUHwMa', '2025-04-16 14:37:33', 'admin', 'https://via.placeholder.com/150'),
(21, 'A', 'ss@gmail.com', '$2b$10$D/lVRcHN0IvGarj4UikwLOWfQ0tsqk5OzImws27pzWcf7q7F.FATW', '2025-04-17 09:56:27', 'user', 'https://via.placeholder.com/150'),
(22, 'Fga', '1@gmail.com', '$2b$10$yiiTuIR5R3Dx1X7naIMNiOJvhsc4xvlG8xK8GHZ.oJxSY0irK530i', '2025-04-18 13:44:29', 'user', 'https://via.placeholder.com/150'),
(23, 'Abdeljalil ', 'abdo@gmail.com', '$2b$10$hDAg4ptQWAhYFsd9hXtkg.F9NBJ7na8Z5eq9mw5ZuV2JCkNAGNiou', '2025-04-18 14:21:54', 'user', 'https://randomuser.me/api/portraits/men/19.jpg'),
(24, 'Hshsbs', 'hdhshdfhsh@gmailm.oh', '$2b$10$HncYaBNF0xz3Pg48da8/2OQeJkddEDfQ3U/EN7CE1OebCCeZg1Ub6', '2025-04-18 14:54:09', 'user', 'https://via.placeholder.com/150'),
(25, 'Sersif', 'abdosarsif28@gmail.com', '$2b$10$jVnihn/QV3BAe2xJAwRvkODIShiJ27jOzb5R2eVXhKwzT7Yqy3H7i', '2025-04-19 05:40:06', 'user', 'https://via.placeholder.com/150'),
(26, 'Abdeljalil sersif', 'sersifabdeljalil28@gmail.com', '$2b$10$l1iyri9PTmGldDrILP0SP.63p0DKoiDhjfJ8PCFVNW6oKOjq5F4qC', '2025-04-20 13:11:15', 'user', 'https://via.placeholder.com/150'),
(27, 'Toufik Mzili', 'tf@gmail.cok', '$2b$10$s35oypw02dXmbsY6IZU2EuE9U1rMN6hdpZc5FnzCxhsUaKjyFogsu', '2025-04-24 09:16:56', 'user', 'https://via.placeholder.com/150'),
(28, 'Toufik Mzili ', 'tf@gmail.com', '$2b$10$pX1QB/ECIqkbGJuo6psf0ONo9YYpT9k5VMMj.ZjKuYODdaJkVwkNq', '2025-04-24 09:18:21', 'user', 'https://via.placeholder.com/150'),
(29, 'Toufik Mzili', 'tt@gmail.com', '$2b$10$9auIxaH48mZb6Xuv3hZuxufUJH8bgO.6pU5dkG/NEbLdk.ZF3QlkW', '2025-04-24 09:25:37', 'user', 'https://via.placeholder.com/150');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `books`
--
ALTER TABLE `books`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `borrows`
--
ALTER TABLE `borrows`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `book_id` (`book_id`);

--
-- Index pour la table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `books`
--
ALTER TABLE `books`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT pour la table `borrows`
--
ALTER TABLE `borrows`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT pour la table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `borrows`
--
ALTER TABLE `borrows`
  ADD CONSTRAINT `borrows_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `borrows_ibfk_2` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD CONSTRAINT `password_reset_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
