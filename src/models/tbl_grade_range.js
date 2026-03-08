const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const GradeRange = sequelize.define('tbl_grade_range', {
    gr_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    gr_eg_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_exam_grades',
        key: 'eg_id'
      }
    },
    gr_min_range: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    gr_max_range: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    gr_create_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    gr_create_dt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    gr_update_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    gr_update_dt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tbl_grade_range',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tbl_grade_range_pkey",
        unique: true,
        fields: [
          { name: "gr_id" },
        ]
      },
    ]
  });

  return GradeRange;
};
