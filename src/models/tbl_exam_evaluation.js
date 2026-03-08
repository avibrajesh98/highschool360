const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const ExamEvaluation = sequelize.define('tbl_exam_evaluation', {
    ee_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    ee_esa_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_exam_schedule_assign',
        key: 'esa_id'
      }
    },
    ee_si_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_student_info',
        key: 'si_id'
      }
    },
    ee_marks: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    ee_grace_marks: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    ee_attendance_status: {
      type: DataTypes.STRING(2),
      allowNull: true
    },
    ee_create_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    ee_create_dt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    ee_update_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    ee_update_dt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tbl_exam_evaluation',
    schema: 'public',
    timestamps: false
  });

  return ExamEvaluation;
};
