/*
 * load all modules into sequelize 
 * return that db connection to server.js
 * which will call this file
 */



var env = process.env.NODE_ENV || 'development';
var Sequelize = require('sequelize');
var sequelize;
var db = {};


if (env === 'production') {

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

db.todo.belongsTo(db.user);
db.user.hasMany(db.todo);

module.exports = db;