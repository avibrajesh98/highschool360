const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const TimeTable = sequelize.define('tbl_timetable', {
    ti_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    ti_sc_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_school',
        key: 'sc_id'
      }
    },
    ti_c_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    ti_ay_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    ti_create_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    ti_create_dt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    ti_update_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    ti_update_dt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tbl_timetable',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tbl_timetable_pkey",
        unique: true,
        fields: [
          { name: "ti_id" },
        ]
      },
    ]
  });

  return TimeTable;
};
