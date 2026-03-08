const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const StaffAttendance = sequelize.define('tbl_staff_attendance', {
    satt_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    satt_sc_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'tbl_school',
        key: 'sc_id'
      }
    },
    satt_st_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'tbl_staff',
        key: 'st_id'
      }
    },
    satt_attendance_status: {
      type: DataTypes.STRING(5),
      allowNull: false
    },
    satt_created_dt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    satt_update_dt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    satt_date: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tbl_staff_attendance',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tbl_staff_attendance_pkey",
        unique: true,
        fields: [
          { name: "satt_id" },
        ]
      },
    ]
  });

  return StaffAttendance;
};
