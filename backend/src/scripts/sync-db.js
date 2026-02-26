/**
 * Sincroniza los modelos con MySQL localhost
 * Crea las tablas según el modelo de datos
 *
 * Uso: npm run db:sync
 * Ejecuta primero: npm run db:create (crea la BD si no existe)
 */

require('dotenv').config();
const { sequelize } = require('../models');

async function syncDatabase() {
  try {
    const dbName = process.env.MYSQLDATABASE || process.env.DB_NAME || 'libreria_gael';
    console.log(`Conectando a MySQL (base de datos: ${dbName})...`);

    await sequelize.authenticate();
    console.log('✓ Conexión exitosa.');

    console.log('Sincronizando modelos (creando/actualizando tablas)...');
    await sequelize.sync({ alter: true });
    console.log('✓ Tablas sincronizadas correctamente.');
  } catch (error) {
    console.error('✗ Error:', error.message);
    if (error.original) {
      console.error('  Detalle:', error.original.message);
    }
    if (error.original?.code === 'ER_BAD_DB_ERROR') {
      console.error('\n  La base de datos no existe. Ejecuta: npm run db:create');
    } else if (error.original?.code === 'ECONNREFUSED') {
      console.error('\n  MySQL no está corriendo o el host/puerto es incorrecto.');
    } else if (error.original?.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n  Usuario o contraseña incorrectos. Revisa tu archivo .env');
    }
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

syncDatabase();
