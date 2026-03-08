module.exports = (sequelize, DataTypes) => {
  const Student = sequelize.define('Student', {
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
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    enrollmentNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      validate: {
        is: /^[0-9-+().\s]+$/
      }
    },
    address: {
      type: DataTypes.TEXT
    },
    guardianName: {
      type: DataTypes.STRING
    },
    guardianPhone: {
      type: DataTypes.STRING,
      validate: {
        is: /^[0-9-+().\s]+$/
      }
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'active',
        validate: {
            isIn: [['active', 'inactive', 'graduated', 'suspended']]
        }
    },
    classId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'classes',
        key: 'id'
      }
    }
  }, {
    tableName: 'students',
    timestamps: true
  });

  return Student;
};