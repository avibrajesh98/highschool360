const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const School = sequelize.define('tbl_school', {
    sc_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    sc_name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    sc_user_name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    sc_password_hash: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    sc_email_id: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    sc_address: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    sc_phone_number_1: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    sc_phone_number_2: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    sc_create_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    sc_create_dt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    sc_update_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    sc_update_dt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    sc_su_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_super_admin',
        key: 'su_id'
      }
    }
  }, {
    sequelize,
    tableName: 'tbl_school',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tbl_school_pkey",
        unique: true,
        fields: [
          { name: "sc_id" },
        ]
      },
    ]
  });

  return School;
};
