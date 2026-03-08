const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const SubjectMaster = sequelize.define('tbl_subject_master', {
    s_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    s_sc_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_school',
        key: 'sc_id'
      }
    },
    s_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    s_create_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    s_create_dt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    s_update_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    s_update_dt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tbl_subject_master',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tbl_subject_master_pkey",
        unique: true,
        fields: [
          { name: "s_id" },
        ]
      },
    ]
  });

  return SubjectMaster;
};
