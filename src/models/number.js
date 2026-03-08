const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('number', {
    n: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    }
  }, {
    sequelize,
    tableName: 'number',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "number_pkey",
        unique: true,
        fields: [
          { name: "n" },
        ]
      },
    ]
  });
};
