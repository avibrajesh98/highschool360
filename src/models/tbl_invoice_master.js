const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const InvoiceMaster = sequelize.define('tbl_invoice_master', {
    i_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    i_title: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    i_description: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    i_sc_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_school',
        key: 'sc_id'
      }
    },
    i_create_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    i_create_dt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    i_update_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    i_update_dt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tbl_invoice_master',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tbl_invoice_master_pkey",
        unique: true,
        fields: [
          { name: "i_id" },
        ]
      },
    ]
  });

  return InvoiceMaster;
};
