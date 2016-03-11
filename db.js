/*
 * load all modules into sequelize 
 * return that db connection to server.js
 * which will call this file
 */

var Sequelize = require('sequelize'),
    sequelize = new Sequelize(undefined, undefined, undefined, { // (database, username, password, options {})
        'dialect': 'sqlite',
        'storage': __dirname + '/data/dev-todo-api.sqlite'
    }),
    db = {};

db.todo = sequelize.import(__dirname + '/models/todo.js');
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;