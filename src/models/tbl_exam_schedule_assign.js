const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const ExamScheduleAssign = sequelize.define('tbl_exam_schedule_assign', {
    esa_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    esa_es_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_exam_schedule',
        key: 'es_id'
      }
    },
    esa_s_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_subject_master',
        key: 's_id'
      }
    },
    esa_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    esa_start_time: {
      type: DataTypes.TIME,
      allowNull: true
    },
    esa_end_time: {
      type: DataTypes.TIME,
      allowNull: true
    },
    esa_max_marks: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    esa_min_marks: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    esa_create_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    esa_create_dt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    esa_update_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    esa_update_dt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tbl_exam_schedule_assign',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tbl_exam_schedule_assign_pkey",
        unique: true,
        fields: [
          { name: "esa_id" },
        ]
      },
    ]
  });

  return ExamScheduleAssign;
};
