CREATE TABLE `User` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` varchar(254) NOT NULL,
  `person` INT(11),
  `hash` varchar(254) NOT NULL,
  `createdOn` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `confirmationToken` varchar(254) NOT NULL,
  `active` BOOLEAN DEFAULT 0,
  `attempt` INT(5) DEFAULT 0,
  `ban` BOOLEAN NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `Person` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `firstName` varchar(254) NOT NULL,
  `lastName` varchar(254) NOT NULL,
  `orcid` varchar(254),
  PRIMARY KEY (`id`)
);

CREATE TABLE `Access` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `accessOn` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `ipv4` varchar(254) NOT NULL,
  `ipv6` varchar(254),
  `platform` varchar(254) NOT NULL,
  `valid` BOOLEAN NOT NULL,
  `revokedOn` DATETIME,
  `city` varchar(254),
  `country` varchar(254),
  `accessToken` varchar(254) NOT NULL,
  PRIMARY KEY (`id`)
);

ALTER TABLE `User` ADD CONSTRAINT `User_fk0` FOREIGN KEY (`person`) REFERENCES `Person`(`id`);

ALTER TABLE `Access` ADD CONSTRAINT `Access_fk0` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`);
