const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const TimetableAssign = sequelize.define('tbl_timetable_assign', {
    ta_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    ta_ti_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_timetable',
        key: 'ti_id'
      }
    },
    ta_from: {
      type: DataTypes.STRING(5),
      allowNull: true
    },
    ta_to: {
      type: DataTypes.STRING(5),
      allowNull: true
    },
    ta_s_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    ta_st_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_staff',
        key: 'st_id'
      }
    },
    ta_day_code: {
      type: DataTypes.STRING(5),
      allowNull: true
    },
    ta_create_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    ta_create_dt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    ta_update_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    ta_update_dt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tbl_timetable_assign',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tbl_timetable_assign_pkey",
        unique: true,
        fields: [
          { name: "ta_id" },
        ]
      },
    ]
  });

  return TimetableAssign;
};
