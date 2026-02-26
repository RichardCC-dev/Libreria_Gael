const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Sale = sequelize.define(
    'Sale',
    {
      id: {
        type: DataTypes.STRING(36),
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      empleado_id: {
        type: DataTypes.STRING(36),
        allowNull: false,
      },
      empleado_name: {
        type: DataTypes.STRING(120),
        allowNull: true,
      },
      reservation_id: {
        type: DataTypes.STRING(36),
        allowNull: true,
      },
      total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      descuento: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      fecha: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'sales',
      underscored: true,
    }
  );

  Sale.associate = (db) => {
    Sale.belongsTo(db.User, { foreignKey: 'empleado_id' });
    Sale.belongsTo(db.Reservation, { foreignKey: 'reservation_id' });
    Sale.hasMany(db.SaleItem, { foreignKey: 'sale_id' });
  };

  return Sale;
};
