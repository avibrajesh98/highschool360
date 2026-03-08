const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const Staff = sequelize.define('tbl_staff', {
    st_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    st_sc_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_school',
        key: 'sc_id'
      }
    },
    st_user_name: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    st_password_hash: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    st_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    st_dob: {
      type: DataTypes.DATE,
      allowNull: true
    },
    st_email_id: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    st_password: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    st_gender: {
      type: DataTypes.STRING(3),
      allowNull: true
    },
    st_phone_number: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    st_address: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    st_image_url: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    st_create_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    st_create_dt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    st_update_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    st_update_dt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    st_type: {
      type: DataTypes.STRING(5),
      allowNull: true
    },
    st_ay_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_academic_year',
        key: 'ay_id'
      }
    }
  }, {
    sequelize,
    tableName: 'tbl_staff',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tbl_staff_pkey",
        unique: true,
        fields: [
          { name: "st_id" },
        ]
      },
    ]
  });

  return Staff;
};
