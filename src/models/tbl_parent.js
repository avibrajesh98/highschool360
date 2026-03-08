const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const Parent = sequelize.define('tbl_parent', {
    p_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    p_sc_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_school',
        key: 'sc_id'
      }
    },
    p_si_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    p_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    p_profession: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    p_mobile_number: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    p_address: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    p_password_hash: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    p_image_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    p_email_id: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    p_parent_type: {
      type: DataTypes.STRING(5),
      allowNull: true
    },
    p_create_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    p_create_dt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    p_update_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    p_update_dt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tbl_parent',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tbl_parent_pkey",
        unique: true,
        fields: [
          { name: "p_id" },
        ]
      },
    ]
  });

  return Parent;
};
