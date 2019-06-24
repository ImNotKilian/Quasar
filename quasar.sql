DROP TABLE IF EXISTS `penguins`;
CREATE TABLE `penguins` (
    `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(12) NOT NULL,
    `password` CHAR(255) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=latin1;

LOCK TABLES `penguins` WRITE;
INSERT INTO `penguins` (`id`, `username`, `password`) VALUES (100, "Zaseth", "$2y$12$NvaKqTOgPhGhUMGmmFlvC.5NsbdLuuo58.3cn.R.fJpjc9Dw9Fpg2");
UNLOCK TABLES;
