const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.STRING(36),
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(120),
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      role: {
        type: DataTypes.ENUM('cliente', 'empleado', 'administrador'),
        allowNull: false,
        defaultValue: 'cliente',
      },
    },
    {
      tableName: 'users',
      underscored: true,
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        },
      },
    }
  );

  User.prototype.comparePassword = function (plainPassword) {
    return bcrypt.compare(plainPassword, this.password);
  };

  User.associate = (db) => {
    User.hasMany(db.Reservation, { foreignKey: 'cliente_id' });
    User.hasMany(db.Sale, { foreignKey: 'empleado_id' });
    User.hasMany(db.Review, { foreignKey: 'user_id' });
    User.hasMany(db.BorrowedProduct, { foreignKey: 'empleado_id' });
    User.hasMany(db.EmployeeAttendance, { foreignKey: 'empleado_id' });
  };

  return User;
};
