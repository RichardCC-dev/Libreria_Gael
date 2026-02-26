/**
 * Crea la base de datos en MySQL si no existe
 * Usa mysql2 para conectar sin especificar base de datos
 *
 * Uso: npm run db:create
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function createDatabase() {
  const dbName = process.env.DB_NAME || 'libreria_gael';
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';

  let connection;
  try {
    console.log(`Conectando a MySQL en ${host}:${port}...`);
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✓ Base de datos "${dbName}" lista.`);
  } catch (error) {
    console.error('Error al crear la base de datos:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('  Verifica que MySQL esté corriendo en localhost.');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('  Verifica usuario y contraseña en .env');
    }
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

createDatabase();
