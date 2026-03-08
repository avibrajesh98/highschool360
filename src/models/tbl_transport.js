const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const Transport = sequelize.define('tbl_transport', {
    tr_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    tr_sc_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_school',
        key: 'sc_id'
      }
    },
    tr_route: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    tr_vehicle: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    tr_description: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    tr_fare: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    tr_create_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    tr_create_dt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    tr_update_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    tr_update_dt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tbl_transport',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tbl_transport_pkey",
        unique: true,
        fields: [
          { name: "tr_id" },
        ]
      },
    ]
  });

  return Transport;
};
