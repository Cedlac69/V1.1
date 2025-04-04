import mysql from 'mysql2/promise';

// Configuration de la connexion MySQL
const pool = mysql.createPool({
  host: '69.62.18.146',
  port: 3306,
  user: 'Admin',
  password: 'Capbreton69@',
  database: 'TempTracker',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Fonction pour tester la connexion
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Connexion MySQL établie avec succès!');
    connection.release();
    return true;
  } catch (error) {
    console.error('Erreur de connexion MySQL:', error);
    return false;
  }
}

// Fonction pour exécuter une requête
export async function query(sql: string, params?: any[]) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Erreur lors de l\'exécution de la requête:', error);
    throw error;
  }
}

export default pool;