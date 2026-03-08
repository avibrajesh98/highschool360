const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const ClassMaster = sequelize.define('tbl_class_master', {
    c_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    c_sc_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    c_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    c_div: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    c_create_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    c_create_dt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    c_update_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    c_update_dt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tbl_class_master',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tbl_class_master_pkey",
        unique: true,
        fields: [
          { name: "c_id" },
        ]
      },
    ]
  });

  return ClassMaster;
};
