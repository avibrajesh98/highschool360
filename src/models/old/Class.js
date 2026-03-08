module.exports = (sequelize, DataTypes) => {
  const Class = sequelize.define('Class', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    section: {
      type: DataTypes.STRING
    },
    academicYear: {
      type: DataTypes.STRING,
      allowNull: false
    },
    roomNumber: {
      type: DataTypes.STRING
    },
    capacity: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1
      }
    }
  }, {
    tableName: 'classes',
    timestamps: true
  });

  return Class;
};