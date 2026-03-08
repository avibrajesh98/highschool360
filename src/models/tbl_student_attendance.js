const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const StudentAtendance = sequelize.define('tbl_student_attendance', {
    sat_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    sat_c_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    sat_si_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    sat_ay_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    sat_attendance_status: {
      type: DataTypes.STRING(5),
      allowNull: false
    },
    sat_create_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    sat_created_dt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    sat_update_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    sat_update_dt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    sat_date: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tbl_student_attendance',
    schema: 'public',
    timestamps: false
  });

  return StudentAtendance;
};
