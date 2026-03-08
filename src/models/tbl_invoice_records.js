const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const InvoiceRecords = sequelize.define('tbl_invoice_records', {
    ir_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    ir_i_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_invoice_master',
        key: 'i_id'
      }
    },
    ir_c_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_class_master',
        key: 'c_id'
      }
    },
    ir_si_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_student_info',
        key: 'si_id'
      }
    },
    ir_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    ir_total: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    ir_payment: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    ir_status: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    ir_method: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    ir_create_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    ir_create_dt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    ir_update_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    ir_update_dt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tbl_invoice_records',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tbl_invoice_records_pkey",
        unique: true,
        fields: [
          { name: "ir_id" },
        ]
      },
    ]
  });

  return InvoiceRecords;
};
