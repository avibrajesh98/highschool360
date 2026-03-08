const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const StudentInfo = sequelize.define('tbl_student_info', {
    si_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    si_sc_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_school',
        key: 'sc_id'
      }
    },
    si_first_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    si_middle_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    si_last_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    si_c_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    si_mother_tongue: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    si_blood_group: {
      type: DataTypes.STRING(5),
      allowNull: true
    },
    si_rollno: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    si_phone_number: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    si_dob: {
      type: DataTypes.DATE,
      allowNull: true
    },
    si_email_id: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    si_gender: {
      type: DataTypes.STRING(3),
      allowNull: true
    },
    si_address: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    si_religion: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    si_nationality: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    si_password_hash: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    si_image_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    si_pin_code: {
      type: DataTypes.STRING(7),
      allowNull: true
    },
    si_state: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    si_city: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    si_create_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    si_create_dt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    si_update_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    si_update_dt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    si_ay_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tbl_academic_year',
        key: 'ay_id'
      }
    },
    si_user_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tbl_student_info',
    schema: 'public',
    timestamps: false
  });

  return StudentInfo;
};
