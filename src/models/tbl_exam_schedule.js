const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const ExamSchedule = sequelize.define('tbl_exam_schedule', {
    es_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    es_et_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_exam_type',
        key: 'et_id'
      }
    },
    es_ay_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_academic_year',
        key: 'ay_id'
      }
    },
    es_c_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_class_master',
        key: 'c_id'
      }
    },
    es_create_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    es_create_dt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    es_update_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    es_update_dt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tbl_exam_schedule',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "ix_exam_schedule_year",
        fields: [
          { name: "es_ay_id" },
          { name: "es_id" },
        ]
      },
      {
        name: "tbl_exam_schedule_pkey",
        unique: true,
        fields: [
          { name: "es_id" },
        ]
      },
    ]
  });

  return ExamSchedule;
};
