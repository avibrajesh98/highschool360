const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const SuperAdmin = sequelize.define('tbl_super_admin', {
    su_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    su_user_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    su_password_hash: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    su_create_dt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    su_create_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    su_update_dt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    su_update_by: {
      type: DataTypes.UUID,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tbl_super_admin',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tbl_super_admin_pkey",
        unique: true,
        fields: [
          { name: "su_id" },
        ]
      },
    ]
  });

  return SuperAdmin;
};
