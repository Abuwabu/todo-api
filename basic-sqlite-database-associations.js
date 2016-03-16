var Sequelize = require('sequelize');

// (database, username, password, options {})
var sequelize = new Sequelize(undefined, undefined, undefined, {
  'dialect': 'sqlite',
  'storage': 'basic-sqlite-database.sqlite'
});



// MODELS

// Todo  define(modelname, {attributes})
var Todo = sequelize.define('todo', {
  description: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {

      // 1-250 chars or use notEmpty: true
      len: [1, 250]
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
  })
  .then(function () {
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

    User.findById(1)
      .then(function (user) {

        // user.getTodos — built in Sequelize functionality
        user.getTodos({
            where: {
              completed: false
            }
          })
          .then(function (todos) {
            todos.forEach(function (todo) {
              console.log(todo.toJSON());
            });
          });
      });
  });