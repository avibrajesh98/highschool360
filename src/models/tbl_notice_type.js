const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const NoticeType = sequelize.define('tbl_notice_type', {
    nt_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    nt_title: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    nt_description: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    nt_sc_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_school',
        key: 'sc_id'
      }
    },
    nt_create_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    nt_create_dt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    nt_update_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    nt_update_dt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tbl_notice_type',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tbl_notice_type_pkey",
        unique: true,
        fields: [
          { name: "nt_id" },
        ]
      },
    ]
  });

  return NoticeType;
};
