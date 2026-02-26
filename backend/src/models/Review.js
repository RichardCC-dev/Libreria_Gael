const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Review = sequelize.define(
    'Review',
    {
      id: {
        type: DataTypes.STRING(36),
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      user_id: {
        type: DataTypes.STRING(36),
        allowNull: false,
      },
      comentario: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      calificacion: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: 'reviews',
      underscored: true,
    }
  );

  Review.associate = (db) => {
    Review.belongsTo(db.User, { foreignKey: 'user_id' });
  };

  return Review;
};
