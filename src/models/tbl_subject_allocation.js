const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const SubjectAllocation = sequelize.define('tbl_subject_allocation', {
    sa_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    sa_st_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_staff',
        key: 'st_id'
      }
    },
    sa_ay_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_academic_year',
        key: 'ay_id'
      }
    },
    sa_c_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_class_master',
        key: 'c_id'
      }
    },
    sa_s_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_subject_master',
        key: 's_id'
      }
    }
  }, {
    sequelize,
    tableName: 'tbl_subject_allocation',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tbl_subject_allocation_pkey",
        unique: true,
        fields: [
          { name: "sa_id" },
        ]
      },
    ]
  });

  return SubjectAllocation;
};
