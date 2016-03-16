/*
 * Specific format for a file called with sequelize.import 
 */


module.exports = function (sequelize, DataTypes) {

  // define(modelname, {attributes})
  return sequelize.define('todo', {
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {

        // 1-250 chars. or use notEmpty: true
        len: [1, 250]
      }
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  });
};