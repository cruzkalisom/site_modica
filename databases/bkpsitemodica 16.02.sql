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

-- Copiando dados para a tabela test.address: ~0 rows (aproximadamente)
INSERT INTO `address` (`user_id`, `street`, `number`, `complement`, `district`, `cep`, `city`, `state`) VALUES
	(1, 'Maranhão', 423, 'Próximo ao Posto 93', 'Mimoso 1', 47850200, 'Luís Eduardo Magalhães', 'BA'),
	(2, 'RUA PAULO AFONSO', 1465, '', 'SANTA CRUZ', 47850000, 'LUIS EDUARDO MAGALHAES', 'BA');

-- Copiando estrutura para tabela test.permissions
CREATE TABLE IF NOT EXISTS `permissions` (
  `name` varchar(30) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Copiando dados para a tabela test.permissions: ~2 rows (aproximadamente)
INSERT INTO `permissions` (`name`, `user_id`) VALUES
	('admin', 1),
	('admin', 2);

-- Copiando estrutura para tabela test.reservations
CREATE TABLE IF NOT EXISTS `reservations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `auth` int(11) NOT NULL,
  `timepag` int(11) NOT NULL,
  `dateres` int(11) NOT NULL,
  `datef` int(11) NOT NULL,
  `datereq` int(11) NOT NULL,
  `description` varchar(1000) NOT NULL,
  `rate` int(11) NOT NULL DEFAULT 0,
  `discounts` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Copiando dados para a tabela test.reservations: ~3 rows (aproximadamente)
INSERT INTO `reservations` (`id`, `type`, `user_id`, `auth`, `timepag`, `dateres`, `datef`, `datereq`, `description`, `rate`, `discounts`) VALUES
	(17, 1, 1, 3, 16765484, 16768512, 16771968, 16764620, '', 0, 0),
	(18, 1, 1, 3, 16765493, 16768512, 16771968, 16764629, '', 0, 0),
	(19, 1, 1, 3, 16765493, 16768512, 16771968, 16764629, '', 0, 0);

-- Copiando estrutura para tabela test.session
CREATE TABLE IF NOT EXISTS `session` (
  `user_id` int(11) NOT NULL,
  `voucher` int(11) NOT NULL AUTO_INCREMENT,
  `date` int(11) NOT NULL,
  PRIMARY KEY (`voucher`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Copiando dados para a tabela test.session: ~1 rows (aproximadamente)
INSERT INTO `session` (`user_id`, `voucher`, `date`) VALUES
	(1, 43, 16766551);

-- Copiando estrutura para tabela test.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `contact` varchar(30) NOT NULL,
  `firstname` varchar(100) NOT NULL,
  `cpf` varchar(30) NOT NULL,
  `rg` varchar(30) NOT NULL,
  `age` int(11) NOT NULL,
  `genre` enum('M','F') NOT NULL,
  `nationality` varchar(20) DEFAULT 'Brasil',
  `marital` varchar(20) NOT NULL,
  `user` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Copiando dados para a tabela test.users: ~1 rows (aproximadamente)
INSERT INTO `users` (`id`, `name`, `contact`, `firstname`, `cpf`, `rg`, `age`, `genre`, `nationality`, `marital`, `user`, `password`) VALUES
	(1, 'Kalisom', '', 'Cruz', '', '', 0, 'M', 'Brasil', '', 'kalisom.cruz@vumer.com.br', 'kalisomsoares003');

-- Copiando estrutura para tabela test.values_reserve
CREATE TABLE IF NOT EXISTS `values_reserve` (
  `monday` int(11) NOT NULL,
  `tuesday` int(11) NOT NULL,
  `wednesday` int(11) NOT NULL,
  `thursday` int(11) NOT NULL,
  `friday` int(11) NOT NULL,
  `saturday` int(11) NOT NULL,
  `sunday` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Copiando dados para a tabela test.values_reserve: ~0 rows (aproximadamente)
INSERT INTO `values_reserve` (`monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`, `sunday`) VALUES
	(10000, 10000, 10000, 10000, 10000, 10000, 10000);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
