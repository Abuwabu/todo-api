/**
 * Load all modules into sequelize and return {object} db
 * db contains db instance, models, and env.
 * 
 * @module        db
 * @summary       Load all modules into sequelize and export db 
 * @requires      sequelize        
 */



// NPM REQUIREMENTS
var Sequelize = require('sequelize');


// NODE_ENV = 'production' on Heroku
var env = process.env.NODE_ENV || 'development';
var sequelize;
var db = {};


if (env === 'production') {

  // DATABASE_URL contains pointer to db on Heroku
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres'
  });

} else {

  // (database, username, password, options {})
  sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect': 'sqlite',
    'storage': __dirname + '/data/dev-todo-api.sqlite'
  });

}

// __dirname — current directory
db.todo = sequelize.import(__dirname + '/models/todo.js');
db.user = sequelize.import(__dirname + '/models/user.js');
db.sequelize = sequelize;
db.env = env;

// Associations
db.todo.belongsTo(db.user);
db.user.hasMany(db.todo);

module.exports = db;