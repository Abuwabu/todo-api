/*
 * load all modules into sequelize 
 * return that db connection to server.js
 * which will call this file
 */

var env = process.env.NODE_ENV || 'development',
    Sequelize = require('sequelize'),
    sequelize,
    db = {};


if (env === 'production') {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres'
    });
} else {
    sequelize = new Sequelize(undefined, undefined, undefined, {        // (database, username, password, options {})
        'dialect': 'sqlite',
        'storage': __dirname + '/data/dev-todo-api.sqlite'
    });
}


db.todo = sequelize.import(__dirname + '/models/todo.js');
db.sequelize = sequelize;

module.exports = db;
