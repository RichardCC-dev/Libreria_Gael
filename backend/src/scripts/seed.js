/**
 * Inserta datos iniciales (admin, empleado, cliente de prueba)
 *
 * Uso: npm run db:seed
 */

require('dotenv').config();
const db = require('../models');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    console.log('Conectando a MySQL...');
    await db.sequelize.authenticate();

    const userCount = await db.User.count();
    if (userCount > 0) {
      console.log('Ya existen usuarios. ¿Deseas agregar datos de prueba? (ejecuta con --force para sobrescribir)');
      process.exit(0);
      return;
    }

    const hashedAdmin = await bcrypt.hash('admin123', 10);
    const hashedEmpleado = await bcrypt.hash('empleado123', 10);
    const hashedCliente = await bcrypt.hash('cliente123', 10);

    await db.User.bulkCreate([
      {
        id: 'admin_1',
        email: 'admin@test.com',
        password: hashedAdmin,
        name: 'Administrador',
        role: 'administrador',
      },
      {
        id: 'empleado_1',
        email: 'empleado@test.com',
        password: hashedEmpleado,
        name: 'Empleado',
        role: 'empleado',
      },
      {
        id: 'cliente_1',
        email: 'cliente@test.com',
        password: hashedCliente,
        name: 'Cliente',
        role: 'cliente',
      },
    ]);

    console.log('Usuarios de prueba creados:');
    console.log('  - admin@test.com / admin123 (Administrador)');
    console.log('  - empleado@test.com / empleado123 (Empleado)');
    console.log('  - cliente@test.com / cliente123 (Cliente)');

    console.log('Seed completado.');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await db.sequelize.close();
    process.exit(0);
  }
}

seed();
