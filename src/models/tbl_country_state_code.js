const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const country_state_code = sequelize.define('tbl_country_state_code', {
    cs_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    cs_code: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    cs_type: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    cs_name: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    cs_status: {
      type: DataTypes.STRING(7),
      allowNull: true
    },
    cs_create_by: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    cs_create_dt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cs_update_by: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    cs_update_dt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tbl_country_state_code',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tbl_country_state_code_pkey",
        unique: true,
        fields: [
          { name: "cs_id" },
        ]
      },
    ]
  });

  return country_state_code;
};
