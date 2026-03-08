const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const StudyMaterial = sequelize.define('tbl_study_material', {
    sm_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    sm_c_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_class_master',
        key: 'c_id'
      }
    },
    sm_sc_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_school',
        key: 'sc_id'
      }
    },
    sm_st_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_staff',
        key: 'st_id'
      }
    },
    sm_title: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    sm_description: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    sm_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    sm_doc_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    sm_create_dt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    sm_create_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    sm_update_dt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    sm_update_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    sm_due_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    sm_marks: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    sm_type: {
      type: DataTypes.STRING(15),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tbl_study_material',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tbl_study_material_pkey",
        unique: true,
        fields: [
          { name: "sm_id" },
        ]
      },
    ]
  });

  return StudyMaterial;
};
