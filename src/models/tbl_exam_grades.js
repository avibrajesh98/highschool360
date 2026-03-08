const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const ExamGrades = sequelize.define('tbl_exam_grades', {
    eg_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    eg_sc_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_school',
        key: 'sc_id'
      }
    },
    eg_name: {
      type: DataTypes.STRING(5),
      allowNull: false
    },
    eg_create_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    eg_create_dt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    eg_update_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    eg_update_dt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tbl_exam_grades',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tbl_exam_grades_pkey",
        unique: true,
        fields: [
          { name: "eg_id" },
        ]
      },
    ]
  });

  return ExamGrades;
};
