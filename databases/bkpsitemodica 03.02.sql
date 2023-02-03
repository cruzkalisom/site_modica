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
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Copiando dados para a tabela test.reservations: ~29 rows (aproximadamente)
INSERT INTO `reservations` (`id`, `type`, `user_id`, `auth`, `timepag`, `dateres`, `datereq`, `description`) VALUES
	(3, 1, 1, 3, 16754488, 16759008, 16753624, ''),
	(4, 1, 1, 3, 16754489, 16759008, 16753625, 'Descrição de teste'),
	(5, 2, 1, 3, 222, 222222, 222222, '222222'),
	(6, 1, 1, 3, 16754510, 16764192, 16753646, 'Teste'),
	(7, 1, 1, 3, 16754512, 16765056, 16753648, 'd'),
	(8, 1, 1, 3, 16754512, 16763328, 16753648, ''),
	(9, 2, 1, 3, 16754517, 16763328, 16753653, 'Teste'),
	(10, 1, 1, 3, 16754518, 16771104, 16753654, 'Teste'),
	(11, 2, 1, 3, 16754521, 16765056, 16753657, 'Teste'),
	(12, 2, 1, 3, 16754522, 16765056, 16753658, 'Teste'),
	(13, 2, 1, 3, 16754522, 16765056, 16753658, 'Teste'),
	(14, 2, 1, 3, 16754522, 16765056, 16753658, 'Teste'),
	(15, 2, 1, 3, 16754525, 16765056, 16753661, 'Teste'),
	(16, 2, 1, 3, 16754528, 16764192, 16753664, ''),
	(17, 1, 1, 3, 16754528, 16766784, 16753664, ''),
	(18, 1, 1, 3, 16754530, 16753824, 16753666, ''),
	(19, 2, 1, 3, 16754531, 16753824, 16753667, ''),
	(20, 1, 1, 3, 16754532, 16754688, 16753668, ''),
	(21, 1, 1, 3, 16754532, 16754688, 16753668, 'Descrição de teste'),
	(22, 2, 1, 3, 16754534, 16754688, 16753670, 'Descrição de teste'),
	(23, 2, 1, 3, 16754536, 16754688, 16753672, 'Descrição de teste'),
	(24, 2, 1, 3, 16754537, 16754688, 16753673, 'Descrição de teste'),
	(25, 2, 1, 3, 16754539, 16754688, 16753675, 'Descrição de teste'),
	(26, 2, 1, 3, 16754539, 16754688, 16753675, 'Descrição de teste'),
	(27, 1, 2, 3, 16754542, 16756416, 16753678, 'ANIVERSARIO DA DIVA!'),
	(28, 2, 1, 3, 16754555, 16754688, 16753691, 'Descrição de teste'),
	(29, 2, 1, 3, 16754557, 16754688, 16753693, 'Descrição de teste'),
	(30, 2, 1, 3, 16754557, 16754688, 16753693, 'Descrição de teste'),
	(31, 2, 1, 3, 16754557, 16754688, 16753693, 'Descrição de teste'),
	(32, 2, 1, 3, 16754557, 16754688, 16753693, 'Descrição de teste'),
	(33, 1, 1, 1, 16755096, 16755552, 16754232, 'TESTE'),
	(34, 2, 1, 1, 16755289, 16756416, 16754425, 'Teste'),
	(35, 2, 1, 1, 16755294, 16756416, 16754430, 'Teste');

-- Copiando estrutura para tabela test.session
CREATE TABLE IF NOT EXISTS `session` (
  `user_id` int(11) NOT NULL,
  `voucher` int(11) NOT NULL AUTO_INCREMENT,
  `date` int(11) NOT NULL,
  PRIMARY KEY (`voucher`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Copiando dados para a tabela test.session: ~1 rows (aproximadamente)
INSERT INTO `session` (`user_id`, `voucher`, `date`) VALUES
	(1, 35, 16755309);

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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Copiando dados para a tabela test.users: ~0 rows (aproximadamente)
INSERT INTO `users` (`id`, `name`, `contact`, `firstname`, `cpf`, `rg`, `genre`, `nationality`, `marital`, `user`, `password`) VALUES
	(1, 'Kalisom', '63991112944', 'Cruz', '07695471178', '1455938', 'M', 'Brasil', 'Solteiro', 'kalisom.cruz@vumer.com.br', 'kalisomsoares003'),
	(2, 'DEISIELLE ', '73999130611', 'ALMEIDA LACERDA DOS SANTOS', '056728985058', '1618833383', 'F', 'Brasil', 'Solteiro', 'deisielle.lacerda@outlook.com', '248299'),
	(3, 'Daniel Vitor ', '', 'Nunes', NULL, NULL, NULL, 'Brasil', NULL, 'dhanyelvitor10nda@gmail.com', '102030');

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
	(5500, 10000, 5000, 6000, 7000, 8000, 9000);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
