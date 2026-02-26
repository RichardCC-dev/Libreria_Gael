const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool,
    define: dbConfig.define,
  }
);

const db = {
  sequelize,
  Sequelize,
  User: require('./User')(sequelize),
  Product: require('./Product')(sequelize),
  BorrowedProduct: require('./BorrowedProduct')(sequelize),
  Reservation: require('./Reservation')(sequelize),
  ReservationItem: require('./ReservationItem')(sequelize),
  Sale: require('./Sale')(sequelize),
  SaleItem: require('./SaleItem')(sequelize),
  Review: require('./Review')(sequelize),
  PasswordRecoveryCode: require('./PasswordRecoveryCode')(sequelize),
  EmployeeAttendance: require('./EmployeeAttendance')(sequelize),
};

// Asociaciones
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
