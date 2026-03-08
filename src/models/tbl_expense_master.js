const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const ExpenseMaster = sequelize.define('tbl_expense_master', {
    e_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    e_title: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    e_description: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    e_sc_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_school',
        key: 'sc_id'
      }
    },
    e_create_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    e_create_dt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    e_update_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    e_update_dt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tbl_expense_master',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tbl_expense_master_pkey",
        unique: true,
        fields: [
          { name: "e_id" },
        ]
      },
    ]
  });

  return ExpenseMaster;
};
