const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const ExpenseRecords = sequelize.define('tbl_expense_records', {
    er_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    er_e_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_expense_master',
        key: 'e_id'
      }
    },
    er_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    er_payment: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    er_method: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    er_create_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    er_create_dt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    er_update_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    er_update_dt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    er_sc_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_school',
        key: 'sc_id'
      }
    },
    er_ay_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_academic_year',
        key: 'ay_id'
      }
    },
    er_title: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    er_description: {
      type: DataTypes.STRING(200),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tbl_expense_records',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tbl_expense_records_pkey",
        unique: true,
        fields: [
          { name: "er_id" },
        ]
      },
    ]
  });

  return ExpenseRecords;
};
