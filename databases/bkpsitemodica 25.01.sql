-- --------------------------------------------------------
-- Servidor:                     127.0.0.1
-- Versão do servidor:           10.4.27-MariaDB - mariadb.org binary distribution
-- OS do Servidor:               Win64
-- HeidiSQL Versão:              12.3.0.6589
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Copiando estrutura do banco de dados para test
CREATE DATABASE IF NOT EXISTS `test` /*!40100 DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci */;
USE `test`;

-- Copiando estrutura para tabela test.address
CREATE TABLE IF NOT EXISTS `address` (
  `user_id` int(11) NOT NULL,
  `street` varchar(100) NOT NULL,
  `number` int(11) NOT NULL DEFAULT 0,
  `complement` varchar(100) NOT NULL,
  `district` varchar(100) NOT NULL,
  `cep` int(11) NOT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Copiando dados para a tabela test.address: ~1 rows (aproximadamente)
INSERT INTO `address` (`user_id`, `street`, `number`, `complement`, `district`, `cep`, `city`, `state`) VALUES
	(4, 'Maranhão', 423, '', 'Mimoso 1', 47850200, 'Luís Eduardo Magalhães', 'BA');

-- Copiando estrutura para tabela test.deletes
CREATE TABLE IF NOT EXISTS `deletes` (
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Copiando dados para a tabela test.deletes: ~0 rows (aproximadamente)

-- Copiando estrutura para tabela test.permissions
CREATE TABLE IF NOT EXISTS `permissions` (
  `name` varchar(30) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Copiando dados para a tabela test.permissions: ~2 rows (aproximadamente)
INSERT INTO `permissions` (`name`, `user_id`) VALUES
	('admin', 4),
	('admin', 5);

-- Copiando estrutura para tabela test.reservations
CREATE TABLE IF NOT EXISTS `reservations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `auth` int(11) NOT NULL,
  `timepag` int(11) NOT NULL,
  `dateres` int(11) NOT NULL,
  `datereq` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Copiando dados para a tabela test.reservations: ~0 rows (aproximadamente)

-- Copiando estrutura para tabela test.session
CREATE TABLE IF NOT EXISTS `session` (
  `user_id` int(11) NOT NULL,
  `voucher` int(11) NOT NULL AUTO_INCREMENT,
  `date` int(11) NOT NULL,
  PRIMARY KEY (`voucher`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Copiando dados para a tabela test.session: ~1 rows (aproximadamente)
INSERT INTO `session` (`user_id`, `voucher`, `date`) VALUES
	(4, 23, 16747402);

-- Copiando estrutura para tabela test.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `age` int(11) DEFAULT NULL,
  `firstname` varchar(100) NOT NULL,
  `cpf` varchar(30) DEFAULT NULL,
  `rg` varchar(30) DEFAULT NULL,
  `genre` enum('M','F') DEFAULT NULL,
  `nationality` varchar(20) DEFAULT 'Brasil',
  `marital` varchar(20) DEFAULT NULL,
  `user` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Copiando dados para a tabela test.users: ~2 rows (aproximadamente)
INSERT INTO `users` (`id`, `name`, `age`, `firstname`, `cpf`, `rg`, `genre`, `nationality`, `marital`, `user`, `password`) VALUES
	(4, 'Kalisom', NULL, 'Cruz', '07695471178', '1455938', 'M', 'Brasil', 'Solteiro', 'kalisom.cruz@vumer.com.br', 'kalisomsoares003'),
	(5, 'DEISIELLE', NULL, 'LACERDA', NULL, NULL, NULL, 'Brasil', NULL, 'deisielle.lacerda@outook.com', '248299');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
