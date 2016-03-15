var Sequelize = require('sequelize'),
    sequelize = new Sequelize(undefined, undefined, undefined, { // (database, username, password, options {})
        'dialect': 'sqlite',
        'storage': 'basic-sqlite-database.sqlite'
    });


// MODELS

// Todo
var Todo = sequelize.define('todo', { // (modelname, {attributes})
    description: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            len: [1, 250] // description must be between 1-250 chars. || notEmpty: true
        }
    },
    completed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});


// User
var User = sequelize.define('user', {

    /*
     * email: {
     *     type: Sequelize.STRING
     * }
     * 
     * abbreviated to:
     * 
     * email: Sequelize.STRING
     */

    email: Sequelize.STRING
});


// Associations
Todo.belongsTo(User);
User.hasMany(Todo);



// SYNC
sequelize.sync({
    //    force: true
}).then(function () {
    console.log("Everything is sync'd");

    //    User.create({
    //        email: 'abuwabu@gmail.com'
    //    }).then(function () {
    //        return Todo.create({
    //            description: "Shake a tail feather"
    //        }).then(function (todo) {
    //            return User.findById(1).then(function (user) {
    //                user.addTodo(todo); // built in Sequelize functionality
    //            });
    //        });
    //    });

    User.findById(1).then(function (user) {
        user.getTodos({
            where: {
                completed: false
            }
        }).then(function (todos) { // user.getTodos — built in Sequelize functionality
            todos.forEach(function (todo) {
                console.log(todo.toJSON());
            });
        });
    });
});