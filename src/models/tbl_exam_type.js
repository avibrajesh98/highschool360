const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const ExamType = sequelize.define('tbl_exam_type', {
    et_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    et_sc_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_school',
        key: 'sc_id'
      }
    },
    et_type: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    et_create_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    et_create_dt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    et_update_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    et_update_dt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tbl_exam_type',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tbl_exam_type_pkey",
        unique: true,
        fields: [
          { name: "et_id" },
        ]
      },
    ]
  });

  return ExamType;
};
