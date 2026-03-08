// const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const AcademicYear =  sequelize.define('tbl_academic_year', {
    ay_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    ay_start_year: {
      type: DataTypes.INTEGER,
      allowNull: true
    }, 
    ay_start_month: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ay_end_year: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ay_end_month: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ay_status_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ay_sc_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_school',
        key: 'sc_id'
      }
    },
    ay_create_by: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    ay_create_dt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    ay_update_by: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    ay_update_dt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tbl_academic_year',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tbl_academic_year_pkey",
        unique: true,
        fields: [
          { name: "ay_id" },
        ]
      },
    ]
  });

  return AcademicYear;
};
