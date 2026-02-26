const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define(
    'Product',
    {
      id: {
        type: DataTypes.STRING(36),
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      nombre: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      categoria: {
        type: DataTypes.STRING(80),
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: '',
      },
      precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      tipo: {
        type: DataTypes.ENUM('propio', 'prestado'),
        allowNull: false,
        defaultValue: 'propio',
      },
    },
    {
      tableName: 'products',
      underscored: true,
    }
  );

  Product.associate = (db) => {
    // No FK: product_id en reservation_items/sale_items puede ser products.id o borrowed_products.id
  };

  return Product;
};
