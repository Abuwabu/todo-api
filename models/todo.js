/**
 * Todo model exported in the specific format
 * for a file called with sequelize.import 
 * 
 * @module        todo
 * @summary       todo model/method definitions for todo-api
 * @param         {object} sequelize — db instance
 * @param         {object} DataTypes — sequelize convenience class of data types
 * @returns       {object} todo — model definition
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