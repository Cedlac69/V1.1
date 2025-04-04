-- ConsultFlow Database Export
-- Generated 2025-03-20T09:10:47.061Z

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- Structure de la table 'agencies'
CREATE TABLE IF NOT EXISTS `agencies` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(4) NOT NULL,
  `address` text,
  `phone` varchar(20),
  `email` varchar(255),
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Structure de la table 'roles'
CREATE TABLE IF NOT EXISTS `roles` (
  `id` varchar(36) NOT NULL,
  `qualification` varchar(255) NOT NULL,
  `acronym` varchar(10) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Structure de la table 'clients'
CREATE TABLE IF NOT EXISTS `clients` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `address` text,
  `postal_code` varchar(10),
  `city` varchar(255),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Structure de la table 'users'
CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `agency_id` varchar(36),
  `role` enum('admin','manager','user') NOT NULL DEFAULT 'user',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `last_login` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `agency_id` (`agency_id`),
  CONSTRAINT `users_agency_fk` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Structure de la table 'consultants'
CREATE TABLE IF NOT EXISTS `consultants` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `surname` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL,
  `skills` text,
  `certifications` text,
  `hourly_rate` decimal(10,2),
  `preferred_locations` text,
  `agency_code` varchar(4),
  PRIMARY KEY (`id`),
  KEY `agency_code` (`agency_code`),
  CONSTRAINT `consultants_agency_fk` FOREIGN KEY (`agency_code`) REFERENCES `agencies` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Structure de la table 'client_orders'
CREATE TABLE IF NOT EXISTS `client_orders` (
  `id` varchar(36) NOT NULL,
  `mission_number` varchar(20) NOT NULL,
  `mission_type` enum('PLA','INT','VAC') NOT NULL,
  `client_name` varchar(255) NOT NULL,
  `project_name` varchar(255),
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `required_skills` text,
  `required_certifications` text,
  `status` enum('pending','cancelled_client','cancelled_consultant','completed') NOT NULL DEFAULT 'pending',
  `assigned_consultant_id` varchar(36),
  `contract_reason` text,
  `cancellation_reason` text,
  `comments` text,
  `is_temporary` tinyint(1) NOT NULL DEFAULT '0',
  `qualification` varchar(255) NOT NULL,
  `created_by` varchar(255),
  `agency_code` varchar(4),
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `mission_number` (`mission_number`),
  KEY `assigned_consultant_id` (`assigned_consultant_id`),
  KEY `agency_code` (`agency_code`),
  CONSTRAINT `orders_consultant_fk` FOREIGN KEY (`assigned_consultant_id`) REFERENCES `consultants` (`id`) ON DELETE SET NULL,
  CONSTRAINT `orders_agency_fk` FOREIGN KEY (`agency_code`) REFERENCES `agencies` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


COMMIT;