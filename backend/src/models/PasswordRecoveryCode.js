const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PasswordRecoveryCode = sequelize.define(
    'PasswordRecoveryCode',
    {
      id: {
        type: DataTypes.STRING(36),
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      used: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: 'password_recovery_codes',
      underscored: true,
    }
  );

  return PasswordRecoveryCode;
};
