const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SaleItem = sequelize.define(
    'SaleItem',
    {
      id: {
        type: DataTypes.STRING(36),
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      sale_id: {
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
      tableName: 'sale_items',
      underscored: true,
    }
  );

  SaleItem.associate = (db) => {
    SaleItem.belongsTo(db.Sale, { foreignKey: 'sale_id' });
  };

  return SaleItem;
};
