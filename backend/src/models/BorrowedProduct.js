const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BorrowedProduct = sequelize.define(
    'BorrowedProduct',
    {
      id: {
        type: DataTypes.STRING(36),
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      product_id: {
        type: DataTypes.STRING(36),
        allowNull: true,
      },
      nombre: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      codigo_tienda: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      fecha_prestamo: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      estado: {
        type: DataTypes.ENUM('pendiente', 'cancelado'),
        allowNull: false,
        defaultValue: 'pendiente',
      },
      empleado_id: {
        type: DataTypes.STRING(36),
        allowNull: false,
      },
    },
    {
      tableName: 'borrowed_products',
      underscored: true,
    }
  );

  BorrowedProduct.associate = (db) => {
    BorrowedProduct.belongsTo(db.User, { foreignKey: 'empleado_id' });
  };

  return BorrowedProduct;
};
