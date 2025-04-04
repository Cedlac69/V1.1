import { createClient } from '@supabase/supabase-js';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Configuration MySQL
const mysqlConfig = {
  host: '69.62.18.146',
  port: 3306,
  user: 'Admin',
  password: 'Capbreton69@',
  database: 'TempTracker'
};

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Les variables d\'environnement Supabase sont manquantes');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateToPostgres() {
  console.log('Début de la migration vers PostgreSQL...');

  try {
    // Connexion à MySQL
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    console.log('Connecté à MySQL');

    // Migration des agences
    console.log('\nMigration des agences...');
    const [agencies] = await mysqlConnection.execute('SELECT * FROM agencies');
    for (const agency of agencies as any[]) {
      const { error } = await supabase
        .from('agencies')
        .insert({
          id: agency.id,
          name: agency.name,
          code: agency.code,
          address: agency.address,
          phone: agency.phone,
          email: agency.email
        });
      
      if (error) {
        console.error(`Erreur lors de la migration de l'agence ${agency.name}:`, error);
      }
    }
    console.log(`${agencies.length} agences migrées`);

    // Migration des rôles
    console.log('\nMigration des rôles...');
    const [roles] = await mysqlConnection.execute('SELECT * FROM roles');
    for (const role of roles as any[]) {
      const { error } = await supabase
        .from('roles')
        .insert({
          id: role.id,
          qualification: role.qualification,
          acronym: role.acronym
        });
      
      if (error) {
        console.error(`Erreur lors de la migration du rôle ${role.qualification}:`, error);
      }
    }
    console.log(`${roles.length} rôles migrés`);

    // Migration des clients
    console.log('\nMigration des clients...');
    const [clients] = await mysqlConnection.execute('SELECT * FROM clients');
    for (const client of clients as any[]) {
      const { error } = await supabase
        .from('clients')
        .insert({
          id: client.id,
          name: client.name,
          address: client.address,
          postal_code: client.postal_code,
          city: client.city
        });
      
      if (error) {
        console.error(`Erreur lors de la migration du client ${client.name}:`, error);
      }
    }
    console.log(`${clients.length} clients migrés`);

    // Migration des utilisateurs
    console.log('\nMigration des utilisateurs...');
    const [users] = await mysqlConnection.execute('SELECT * FROM users');
    for (const user of users as any[]) {
      const { error } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          agency_id: user.agency_id,
          role: user.role,
          active: user.active,
          last_login: user.last_login,
          created_at: user.created_at
        });
      
      if (error) {
        console.error(`Erreur lors de la migration de l'utilisateur ${user.email}:`, error);
      }
    }
    console.log(`${users.length} utilisateurs migrés`);

    // Migration des consultants
    console.log('\nMigration des consultants...');
    const [consultants] = await mysqlConnection.execute('SELECT * FROM consultants');
    for (const consultant of consultants as any[]) {
      const { error } = await supabase
        .from('consultants')
        .insert({
          id: consultant.id,
          name: consultant.name,
          surname: consultant.surname,
          role: consultant.role,
          skills: consultant.skills ? JSON.parse(consultant.skills) : [],
          certifications: consultant.certifications ? JSON.parse(consultant.certifications) : [],
          hourly_rate: consultant.hourly_rate,
          preferred_locations: consultant.preferred_locations ? JSON.parse(consultant.preferred_locations) : [],
          agency_code: consultant.agency_code
        });
      
      if (error) {
        console.error(`Erreur lors de la migration du consultant ${consultant.name}:`, error);
      }
    }
    console.log(`${consultants.length} consultants migrés`);

    // Migration des commandes clients
    console.log('\nMigration des commandes clients...');
    const [clientOrders] = await mysqlConnection.execute('SELECT * FROM client_orders');
    for (const order of clientOrders as any[]) {
      const { error } = await supabase
        .from('client_orders')
        .insert({
          id: order.id,
          mission_number: order.mission_number,
          mission_type: order.mission_type,
          client_name: order.client_name,
          project_name: order.project_name,
          start_date: order.start_date,
          end_date: order.end_date,
          required_skills: order.required_skills ? JSON.parse(order.required_skills) : [],
          required_certifications: order.required_certifications ? JSON.parse(order.required_certifications) : [],
          status: order.status,
          assigned_consultant_id: order.assigned_consultant_id,
          contract_reason: order.contract_reason,
          cancellation_reason: order.cancellation_reason,
          comments: order.comments,
          is_temporary: order.is_temporary,
          qualification: order.qualification,
          created_by: order.created_by,
          agency_code: order.agency_code,
          created_at: order.created_at
        });
      
      if (error) {
        console.error(`Erreur lors de la migration de la commande ${order.mission_number}:`, error);
      }
    }
    console.log(`${clientOrders.length} commandes clients migrées`);

    // Fermeture de la connexion MySQL
    await mysqlConnection.end();
    console.log('\nMigration terminée avec succès!');

  } catch (error) {
    console.error('Erreur lors de la migration:', error);
    process.exit(1);
  }
}

migrateToPostgres().catch(console.error);