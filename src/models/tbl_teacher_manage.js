const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const TeacherManage = sequelize.define('tbl_teacher_manage', {
    tm_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    tm_ay_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_academic_year',
        key: 'ay_id'
      }
    },
    tm_st_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_staff',
        key: 'st_id'
      }
    },
    tm_s_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_subject_master',
        key: 's_id'
      }
    }
  }, {
    sequelize,
    tableName: 'tbl_teacher_manage',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tbl_teacher_manage_pkey",
        unique: true,
        fields: [
          { name: "tm_id" },
        ]
      },
    ]
  });

  return TeacherManage;
};
