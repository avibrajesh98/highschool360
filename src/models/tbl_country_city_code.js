const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const country_city_code = sequelize.define('tbl_country_city_code', {
    cc_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    cc_code: {
      type: DataTypes.STRING(7),
      allowNull: true
    },
    cc_type: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    cc_name: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    cc_status: {
      type: DataTypes.STRING(3),
      allowNull: true
    },
    cc_create_by: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    cc_create_dt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cc_update_by: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    cc_update_dt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tbl_country_city_code',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tbl_country_city_code_pkey",
        unique: true,
        fields: [
          { name: "cc_id" },
        ]
      },
    ]
  });

  return country_city_code;
};
