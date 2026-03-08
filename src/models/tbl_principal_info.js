const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const PrincipalInfo = sequelize.define('tbl_principal_info', {
    pi_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    pi_sc_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    pi_first_name: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    pi_last_name: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    pi_dob: {
      type: DataTypes.DATE,
      allowNull: false
    },
    pi_email: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    pi_password_hash: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    pi_gender: {
      type: DataTypes.STRING(3),
      allowNull: false
    },
    pi_phone_number: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    pi_address: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    pi_image_url: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    pi_create_by: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    pi_create_dt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    pi_update_by: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    pi_update_dt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tbl_principal_info',
    schema: 'public',
    timestamps: false
  });

  return PrincipalInfo;
};
