/**
 * Token model exported in the specific format
 * for a file called with sequelize.import 
 * 
 * Token attribute solely used for validation.
 * Stores the hashed value of the tokens — important data
 * 
 * @module        token
 * @summary       token model/method definitions for todo-api
 * 
 * @requires      crypto-js
 * 
 * @param         {object} sequelize — db instance
 * @param         {object} DataTypes — sequelize convenience class of data types
 * @returns       {object} Token — model definition
 */



// NPM REQUIREMENTS
var cryptojs = require('crypto-js');


module.exports = function (sequelize, DataTypes) {
  
  return sequelize.define('token', {
    token: {
      type: DataTypes.VIRTUAL,
      allowNull: false,
      validate: {
        len: [1]
      },
      set: function (value) {
        var hash = cryptojs.MD5(value).toString();
        this.setDataValue('token', value);
        this.setDataValue('tokenHash', hash); 
      }
    },
    tokenHash: DataTypes.STRING
  });
}