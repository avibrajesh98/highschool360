module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('Course', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    code: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    credits: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 10
      }
    },
    department: {
      type: DataTypes.STRING
    },
    semester: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1,
        max: 8
      }
    },
    teacherId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'teachers',
        key: 'id'
      }
    },
    schedule: {
      type: DataTypes.JSON,
      comment: 'JSON object containing day and time information'
    },
    maxStudents: {
      type: DataTypes.INTEGER,
      defaultValue: 30
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'active',
        validate: {
            isIn: [['active', 'completed', 'cancelled']]
        }
    },
  }, {
    tableName: 'courses',
    timestamps: true
  });

  return Course;
};