module.exports = (sequelize, DataTypes) => {
  const Teacher = sequelize.define('Teacher', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING,
      validate: {
        is: /^[0-9-+().\s]+$/
      }
    },
    specialization: {
      type: DataTypes.STRING
    },
    qualification: {
      type: DataTypes.STRING
    },
    experience: {
      type: DataTypes.INTEGER,
      comment: 'Years of experience'
    },
    employeeId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    joinDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    salary: {
      type: DataTypes.DECIMAL(10, 2)
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'active',
        validate: {
            isIn: [['active', 'inactive', 'on_leave']]
        }
    }
  }, {
    tableName: 'teachers',
    timestamps: true
  });

  return Teacher;
};