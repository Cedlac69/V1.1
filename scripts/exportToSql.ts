import { collection, getDocs } from 'firebase/firestore';
import { db } from '../src/firebase';
import * as fs from 'fs';

async function exportToSql() {
  let sqlContent = `-- ConsultFlow Database Export
-- Generated ${new Date().toISOString()}

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- Structure de la table 'agencies'
CREATE TABLE IF NOT EXISTS \`agencies\` (
  \`id\` varchar(36) NOT NULL,
  \`name\` varchar(255) NOT NULL,
  \`code\` varchar(4) NOT NULL,
  \`address\` text,
  \`phone\` varchar(20),
  \`email\` varchar(255),
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`code\` (\`code\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Structure de la table 'roles'
CREATE TABLE IF NOT EXISTS \`roles\` (
  \`id\` varchar(36) NOT NULL,
  \`qualification\` varchar(255) NOT NULL,
  \`acronym\` varchar(10) NOT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Structure de la table 'clients'
CREATE TABLE IF NOT EXISTS \`clients\` (
  \`id\` varchar(36) NOT NULL,
  \`name\` varchar(255) NOT NULL,
  \`address\` text,
  \`postal_code\` varchar(10),
  \`city\` varchar(255),
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Structure de la table 'users'
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` varchar(36) NOT NULL,
  \`email\` varchar(255) NOT NULL,
  \`first_name\` varchar(255) NOT NULL,
  \`last_name\` varchar(255) NOT NULL,
  \`agency_id\` varchar(36),
  \`role\` enum('admin','manager','user') NOT NULL DEFAULT 'user',
  \`active\` tinyint(1) NOT NULL DEFAULT '1',
  \`last_login\` datetime DEFAULT NULL,
  \`created_at\` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`email\` (\`email\`),
  KEY \`agency_id\` (\`agency_id\`),
  CONSTRAINT \`users_agency_fk\` FOREIGN KEY (\`agency_id\`) REFERENCES \`agencies\` (\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Structure de la table 'consultants'
CREATE TABLE IF NOT EXISTS \`consultants\` (
  \`id\` varchar(36) NOT NULL,
  \`name\` varchar(255) NOT NULL,
  \`surname\` varchar(255) NOT NULL,
  \`role\` varchar(255) NOT NULL,
  \`skills\` text,
  \`certifications\` text,
  \`hourly_rate\` decimal(10,2),
  \`preferred_locations\` text,
  \`agency_code\` varchar(4),
  PRIMARY KEY (\`id\`),
  KEY \`agency_code\` (\`agency_code\`),
  CONSTRAINT \`consultants_agency_fk\` FOREIGN KEY (\`agency_code\`) REFERENCES \`agencies\` (\`code\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Structure de la table 'client_orders'
CREATE TABLE IF NOT EXISTS \`client_orders\` (
  \`id\` varchar(36) NOT NULL,
  \`mission_number\` varchar(20) NOT NULL,
  \`mission_type\` enum('PLA','INT','VAC') NOT NULL,
  \`client_name\` varchar(255) NOT NULL,
  \`project_name\` varchar(255),
  \`start_date\` date NOT NULL,
  \`end_date\` date NOT NULL,
  \`required_skills\` text,
  \`required_certifications\` text,
  \`status\` enum('pending','cancelled_client','cancelled_consultant','completed') NOT NULL DEFAULT 'pending',
  \`assigned_consultant_id\` varchar(36),
  \`contract_reason\` text,
  \`cancellation_reason\` text,
  \`comments\` text,
  \`is_temporary\` tinyint(1) NOT NULL DEFAULT '0',
  \`qualification\` varchar(255) NOT NULL,
  \`created_by\` varchar(255),
  \`agency_code\` varchar(4),
  \`created_at\` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`mission_number\` (\`mission_number\`),
  KEY \`assigned_consultant_id\` (\`assigned_consultant_id\`),
  KEY \`agency_code\` (\`agency_code\`),
  CONSTRAINT \`orders_consultant_fk\` FOREIGN KEY (\`assigned_consultant_id\`) REFERENCES \`consultants\` (\`id\`) ON DELETE SET NULL,
  CONSTRAINT \`orders_agency_fk\` FOREIGN KEY (\`agency_code\`) REFERENCES \`agencies\` (\`code\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

`;

  // Fonction pour échapper les valeurs SQL
  const escapeSql = (str: any) => {
    if (str === null || str === undefined) return 'NULL';
    if (typeof str === 'boolean') return str ? '1' : '0';
    if (typeof str === 'number') return str;
    return `'${String(str).replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, (char) => {
      switch (char) {
        case "\0": return "\\0";
        case "\x08": return "\\b";
        case "\x09": return "\\t";
        case "\x1a": return "\\z";
        case "\n": return "\\n";
        case "\r": return "\\r";
        case "\"":
        case "'":
        case "\\":
        case "%":
          return "\\"+char;
        default: return char;
      }
    })}'`;
  };

  // Fonction pour convertir un tableau en chaîne JSON pour MySQL
  const arrayToMySqlJson = (arr: any[]) => {
    return escapeSql(JSON.stringify(arr));
  };

  // Exporter les données des agences
  const agenciesSnapshot = await getDocs(collection(db, 'agencies'));
  if (!agenciesSnapshot.empty) {
    sqlContent += "\n-- Données de la table 'agencies'\n";
    agenciesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      sqlContent += `INSERT INTO \`agencies\` (\`id\`, \`name\`, \`code\`, \`address\`, \`phone\`, \`email\`) VALUES (
        ${escapeSql(doc.id)},
        ${escapeSql(data.name)},
        ${escapeSql(data.code)},
        ${escapeSql(data.address)},
        ${escapeSql(data.phone)},
        ${escapeSql(data.email)}
      );\n`;
    });
  }

  // Exporter les données des rôles
  const rolesSnapshot = await getDocs(collection(db, 'roles'));
  if (!rolesSnapshot.empty) {
    sqlContent += "\n-- Données de la table 'roles'\n";
    rolesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      sqlContent += `INSERT INTO \`roles\` (\`id\`, \`qualification\`, \`acronym\`) VALUES (
        ${escapeSql(doc.id)},
        ${escapeSql(data.qualification)},
        ${escapeSql(data.acronym)}
      );\n`;
    });
  }

  // Exporter les données des clients
  const clientsSnapshot = await getDocs(collection(db, 'clients'));
  if (!clientsSnapshot.empty) {
    sqlContent += "\n-- Données de la table 'clients'\n";
    clientsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      sqlContent += `INSERT INTO \`clients\` (\`id\`, \`name\`, \`address\`, \`postal_code\`, \`city\`) VALUES (
        ${escapeSql(doc.id)},
        ${escapeSql(data.name)},
        ${escapeSql(data.address)},
        ${escapeSql(data.postalCode)},
        ${escapeSql(data.city)}
      );\n`;
    });
  }

  // Exporter les données des utilisateurs
  const usersSnapshot = await getDocs(collection(db, 'users'));
  if (!usersSnapshot.empty) {
    sqlContent += "\n-- Données de la table 'users'\n";
    usersSnapshot.docs.forEach(doc => {
      const data = doc.data();
      sqlContent += `INSERT INTO \`users\` (\`id\`, \`email\`, \`first_name\`, \`last_name\`, \`agency_id\`, \`role\`, \`active\`, \`last_login\`, \`created_at\`) VALUES (
        ${escapeSql(doc.id)},
        ${escapeSql(data.email)},
        ${escapeSql(data.firstName)},
        ${escapeSql(data.lastName)},
        ${escapeSql(data.agencyId)},
        ${escapeSql(data.role)},
        ${escapeSql(data.active)},
        ${data.lastLogin ? escapeSql(new Date(data.lastLogin).toISOString().slice(0, 19).replace('T', ' ')) : 'NULL'},
        ${data.createdAt ? escapeSql(new Date(data.createdAt.seconds * 1000).toISOString().slice(0, 19).replace('T', ' ')) : 'NULL'}
      );\n`;
    });
  }

  // Exporter les données des consultants
  const consultantsSnapshot = await getDocs(collection(db, 'consultants'));
  if (!consultantsSnapshot.empty) {
    sqlContent += "\n-- Données de la table 'consultants'\n";
    consultantsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      sqlContent += `INSERT INTO \`consultants\` (\`id\`, \`name\`, \`surname\`, \`role\`, \`skills\`, \`certifications\`, \`hourly_rate\`, \`preferred_locations\`, \`agency_code\`) VALUES (
        ${escapeSql(doc.id)},
        ${escapeSql(data.name)},
        ${escapeSql(data.surname)},
        ${escapeSql(data.role)},
        ${arrayToMySqlJson(data.skills)},
        ${arrayToMySqlJson(data.certifications)},
        ${escapeSql(data.hourlyRate)},
        ${arrayToMySqlJson(data.preferredLocations)},
        ${escapeSql(data.agencyCode)}
      );\n`;
    });
  }

  // Exporter les données des commandes clients
  const ordersSnapshot = await getDocs(collection(db, 'clientOrders'));
  if (!ordersSnapshot.empty) {
    sqlContent += "\n-- Données de la table 'client_orders'\n";
    ordersSnapshot.docs.forEach(doc => {
      const data = doc.data();
      sqlContent += `INSERT INTO \`client_orders\` (
        \`id\`, \`mission_number\`, \`mission_type\`, \`client_name\`, \`project_name\`, 
        \`start_date\`, \`end_date\`, \`required_skills\`, \`required_certifications\`, 
        \`status\`, \`assigned_consultant_id\`, \`contract_reason\`, \`cancellation_reason\`, 
        \`comments\`, \`is_temporary\`, \`qualification\`, \`created_by\`, \`agency_code\`, \`created_at\`
      ) VALUES (
        ${escapeSql(doc.id)},
        ${escapeSql(data.missionNumber)},
        ${escapeSql(data.missionType)},
        ${escapeSql(data.clientName)},
        ${escapeSql(data.projectName)},
        ${escapeSql(data.startDate)},
        ${escapeSql(data.endDate)},
        ${arrayToMySqlJson(data.requiredSkills)},
        ${arrayToMySqlJson(data.requiredCertifications)},
        ${escapeSql(data.status)},
        ${escapeSql(data.assignedConsultantId)},
        ${escapeSql(data.contractReason)},
        ${escapeSql(data.cancellationReason)},
        ${escapeSql(data.comments)},
        ${escapeSql(data.isTemporary)},
        ${escapeSql(data.qualification)},
        ${escapeSql(data.createdBy)},
        ${escapeSql(data.agencyCode)},
        ${data.createdAt ? escapeSql(new Date(data.createdAt.seconds * 1000).toISOString().slice(0, 19).replace('T', ' ')) : 'NULL'}
      );\n`;
    });
  }

  sqlContent += "\nCOMMIT;";

  // Écrire le fichier SQL
  fs.writeFileSync('database_export.sql', sqlContent);
  console.log('Export SQL terminé avec succès. Fichier créé : database_export.sql');
}

exportToSql().catch(console.error);