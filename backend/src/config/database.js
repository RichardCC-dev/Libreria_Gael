require('dotenv').config();

// Soporta variables de Railway (MYSQL*) y locales (DB_*)
function getDbConfig() {
  const url = process.env.MYSQL_URL || process.env.DATABASE_URL;
  if (url) {
    try {
      const parsed = new URL(url);
      return {
        username: decodeURIComponent(parsed.username),
        password: decodeURIComponent(parsed.password),
        database: parsed.pathname.slice(1) || 'libreria_gael',
        host: parsed.hostname,
        port: parseInt(parsed.port || '3306', 10),
      };
    } catch (e) {
      console.warn('Error parseando MYSQL_URL:', e.message);
    }
  }
  return {
    username: process.env.MYSQLUSER || process.env.DB_USER || 'root',
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
    database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'libreria_gael',
    host: process.env.MYSQLHOST || process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.MYSQLPORT || process.env.DB_PORT || '3306', 10),
  };
}

const baseConfig = {
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: process.env.NODE_ENV === 'production' ? 10 : 5,
    min: process.env.NODE_ENV === 'production' ? 2 : 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  },
};

const dbConfig = getDbConfig();

module.exports = {
  development: {
    ...dbConfig,
    ...baseConfig,
    logging: console.log,
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
  },
  production: {
    ...dbConfig,
    ...baseConfig,
    logging: false,
    pool: { max: 10, min: 2, acquire: 30000, idle: 10000 },
  },
};
