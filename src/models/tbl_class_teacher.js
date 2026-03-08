const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
   const ClassTeacher = sequelize.define('tbl_class_teacher', {
    ct_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    ct_st_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_staff',
        key: 'st_id'
      }
    },
    ct_ay_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_academic_year',
        key: 'ay_id'
      }
    },
    ct_c_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_class_master',
        key: 'c_id'
      }
    }
  }, {
    sequelize,
    tableName: 'tbl_class_teacher',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tbl_class_teacher_pkey",
        unique: true,
        fields: [
          { name: "ct_id" },
        ]
      },
    ]
  });

  return ClassTeacher;
};
