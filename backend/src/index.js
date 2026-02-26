/**
 * API REST - Librería Gael
 * Backend Node.js + Express + Sequelize + MySQL localhost
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS: en producción permitir origen de la app móvil (Expo/React Native)
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? true // Permitir todos los orígenes para apps móviles
    : true,
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    message: 'API Librería Gael',
    database: 'MySQL localhost',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/borrowed-products', require('./routes/borrowedProducts'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/attendance', require('./routes/attendance'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ ok: false, message: err.message || 'Error interno' });
});

async function start() {
  try {
    await sequelize.authenticate();
    console.log('✓ MySQL conectado correctamente');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✓ API corriendo en puerto ${PORT}`);
      console.log(`  Health: /api/health`);
    });
  } catch (error) {
    console.error('✗ No se pudo conectar a MySQL:', error.message);
    console.error('  Verifica que MySQL esté corriendo y que .env tenga los datos correctos.');
    process.exit(1);
  }
}

start();
