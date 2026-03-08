const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const RefCode = sequelize.define('tbl_ref_codes', {
    rc_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    rc_type: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    rc_code: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    rc_name: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    rc_status: {
      type: DataTypes.STRING(7),
      allowNull: true
    },
    rc_create_by: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    rc_create_dt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    rc_update_by: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    rc_update_dt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tbl_ref_codes',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tbl_ref_codes_pkey",
        unique: true,
        fields: [
          { name: "rc_id" },
        ]
      },
    ]
  });

  return RefCode;
};
