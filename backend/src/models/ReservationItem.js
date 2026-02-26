const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ReservationItem = sequelize.define(
    'ReservationItem',
    {
      id: {
        type: DataTypes.STRING(36),
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      reservation_id: {
        type: DataTypes.STRING(36),
        allowNull: false,
      },
      product_id: {
        type: DataTypes.STRING(36),
        allowNull: false,
      },
      product_name: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      precio_unitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      tableName: 'reservation_items',
      underscored: true,
    }
  );

  ReservationItem.associate = (db) => {
    ReservationItem.belongsTo(db.Reservation, { foreignKey: 'reservation_id' });
  };

  return ReservationItem;
};
