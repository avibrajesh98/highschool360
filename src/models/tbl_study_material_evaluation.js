const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const StudyMaterialEvaluation = sequelize.define('tbl_study_material_evaluation', {
    sme_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    sme_sm_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    sme_si_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    sme_evaluation_status: {
      type: DataTypes.STRING(5),
      allowNull: false
    },
    sme_create_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    sme_created_dt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    sme_update_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    sme_update_dt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    sat_date: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tbl_study_material_evaluation',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tbl_study_material_evaluation_pkey",
        unique: true,
        fields: [
          { name: "sme_id" },
        ]
      },
    ]
  });

  return StudyMaterialEvaluation;
};
