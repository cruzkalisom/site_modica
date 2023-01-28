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

-- Copiando dados para a tabela test.address: ~2 rows (aproximadamente)
INSERT INTO `address` (`user_id`, `street`, `number`, `complement`, `district`, `cep`, `city`, `state`) VALUES
	(1, 'Maranhão', 423, 'Próximo ao Posto 93', 'Mimoso 1', 47850200, 'Luís Eduardo Magalhães', 'BA'),
	(2, 'Rua Paulo Afonso', 1465, '', 'Santa Cruz', 47850000, 'Luis Eduardo Magalhães', 'BA');

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
  `datereq` int(11) NOT NULL,
  `description` varchar(1000) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Copiando dados para a tabela test.reservations: ~0 rows (aproximadamente)
INSERT INTO `reservations` (`id`, `type`, `user_id`, `auth`, `timepag`, `dateres`, `datereq`, `description`) VALUES
	(1, 1, 1, 2, 222, 16748640, 16748233, 'Descrição do primeiro teste de descrições de reservas');

-- Copiando estrutura para tabela test.session
CREATE TABLE IF NOT EXISTS `session` (
  `user_id` int(11) NOT NULL,
  `voucher` int(11) NOT NULL AUTO_INCREMENT,
  `date` int(11) NOT NULL,
  PRIMARY KEY (`voucher`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Copiando dados para a tabela test.session: ~1 rows (aproximadamente)
INSERT INTO `session` (`user_id`, `voucher`, `date`) VALUES
	(2, 26, 16749943);

-- Copiando estrutura para tabela test.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `contact` varchar(30) NOT NULL,
  `firstname` varchar(100) NOT NULL,
  `cpf` varchar(30) DEFAULT NULL,
  `rg` varchar(30) DEFAULT NULL,
  `genre` enum('M','F') DEFAULT NULL,
  `nationality` varchar(20) DEFAULT 'Brasil',
  `marital` varchar(20) DEFAULT NULL,
  `user` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Copiando dados para a tabela test.users: ~2 rows (aproximadamente)
INSERT INTO `users` (`id`, `name`, `contact`, `firstname`, `cpf`, `rg`, `genre`, `nationality`, `marital`, `user`, `password`) VALUES
	(1, 'Kalisom', '63991112944', 'Cruz', '07695471178', '47850200', 'M', 'Brasil', 'Solteiro', 'kalisom.cruz@vumer.com.br', 'kalisomsoares003'),
	(2, 'Deisielle ', '73999130611', 'Almeida Lacerda dos Santos', '05672898505', '1618833383', 'F', 'Brasil', 'Solteiro', 'deisielle.lacerda@outlook.com', '248299');

-- Copiando estrutura para tabela test.values_reserve
CREATE TABLE IF NOT EXISTS `values_reserve` (
  `day` varchar(30) NOT NULL,
  `reserve_value` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Copiando dados para a tabela test.values_reserve: ~7 rows (aproximadamente)
INSERT INTO `values_reserve` (`day`, `reserve_value`) VALUES
	('monday', 0),
	('tuesday', 0),
	('wednesday', 0),
	('thursday', 0),
	('friday', 0),
	('saturday', 0),
	('sunday', 0);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
