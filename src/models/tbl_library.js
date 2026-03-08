const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const Library = sequelize.define('tbl_library', {
    l_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    l_sc_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_school',
        key: 'sc_id'
      }
    },
    l_class: {
      type: DataTypes.STRING(3),
      allowNull: true
    },
    l_book: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    l_author: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    l_description: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    l_price: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    l_status: {
      type: DataTypes.STRING(10),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tbl_library',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tbl_library_pkey",
        unique: true,
        fields: [
          { name: "l_id" },
        ]
      },
    ]
  });

  return Library;
};
