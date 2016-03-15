var Sequelize = require('sequelize'),
    sequelize = new Sequelize(undefined, undefined, undefined, { // (database, username, password, options {})
        'dialect': 'sqlite',
        'storage': 'basic-sqlite-database.sqlite'
    });


// MODELS

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

sequelize.sync({
    force: true
}).then(function () { // force: true — automatically drops all tables & re-create them
    console.log("Everything is sync'd");

    Todo.create({
        description: "Walk my dog",
        completed: false
    }).then(function (todo) {
        return Todo.create({
            description: "Take out rubbish"
        });
    }).then(function () {
        // return Todo.findById(1);
        return Todo.findAll({
            where: {
                completed: false, // search for todos where completed: false
                description: {
                    $like: '%rubbish%' // %% — don't care if other content on either side of search. case insensitive
                }
            }
        });
    }).then(function (todos) {
        if (todos) {
            todos.forEach(function (todo) {
                console.log(todo.toJSON());
            });
        } else {
            console.log('No todos found!');
        }
    }).catch(function (e) {
        console.log(e);
    });
});