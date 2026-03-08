const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const StudentManage = sequelize.define('tbl_student_manage', {
    sm_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    sm_ay_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_academic_year',
        key: 'ay_id'
      }
    },
    sm_si_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_student_info',
        key: 'si_id'
      }
    }
  }, {
    sequelize,
    tableName: 'tbl_student_manage',
    schema: 'public',
    timestamps: false
  });

  return StudentManage;
};
