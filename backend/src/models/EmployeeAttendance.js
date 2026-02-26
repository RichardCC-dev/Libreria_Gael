const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const EmployeeAttendance = sequelize.define(
    'EmployeeAttendance',
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
      fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      hora_entrada: {
        type: DataTypes.STRING(5),
        allowNull: true,
      },
      hora_salida: {
        type: DataTypes.STRING(5),
        allowNull: true,
      },
      registrado_por: {
        type: DataTypes.STRING(36),
        allowNull: true,
      },
    },
    {
      tableName: 'employee_attendance',
      underscored: true,
    }
  );

  EmployeeAttendance.associate = (db) => {
    EmployeeAttendance.belongsTo(db.User, { foreignKey: 'empleado_id' });
  };

  return EmployeeAttendance;
};
