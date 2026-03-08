const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const Notice = sequelize.define('tbl_notice', {
    n_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    n_sc_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_school',
        key: 'sc_id'
      }
    },
    n_title: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    n_description: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    n_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    n_create_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    n_create_dt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    n_update_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    n_update_dt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    n_nt_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_notice_type',
        key: 'nt_id'
      }
    }
  }, {
    sequelize,
    tableName: 'tbl_notice',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tbl_notice_pkey",
        unique: true,
        fields: [
          { name: "n_id" },
        ]
      },
    ]
  });

  return Notice;
};
