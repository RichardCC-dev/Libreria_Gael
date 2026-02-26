const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Reservation = sequelize.define(
    'Reservation',
    {
      id: {
        type: DataTypes.STRING(36),
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      cliente_id: {
        type: DataTypes.STRING(36),
        allowNull: false,
      },
      total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      estado: {
        type: DataTypes.ENUM('por_confirmar', 'pendiente', 'confirmada', 'cancelado'),
        allowNull: false,
        defaultValue: 'por_confirmar',
      },
      mensaje_empleado: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      tiempo_entrega_dias: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      empleado_confirma_id: {
        type: DataTypes.STRING(36),
        allowNull: true,
      },
    },
    {
      tableName: 'reservations',
      underscored: true,
    }
  );

  Reservation.associate = (db) => {
    Reservation.belongsTo(db.User, { foreignKey: 'cliente_id' });
    Reservation.belongsTo(db.User, { foreignKey: 'empleado_confirma_id' });
    Reservation.hasMany(db.ReservationItem, { foreignKey: 'reservation_id' });
    Reservation.hasOne(db.Sale, { foreignKey: 'reservation_id' });
  };

  return Reservation;
};
