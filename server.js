/*
 * Todo COLLECTION = all of the todos
 * Todo MODEL = single todo
 */



// REQUIREMENTS
// exports a function — pass in the db
var _ = require('underscore');
var bcrypt = require('bcrypt');
var bodyParser = require('body-parser');
var db = require('./db.js');
var express = require('express');
var middleware = require('./middleware.js')(db);



// GLOBAL VARIABLES
var app = express();

const PORT = process.env.PORT || 3000;



// APP-LEVEL MIDDLEWARE
app.use(bodyParser.json());



// GET /
app.get('/', function (req, res) {
  res.send('Todo API Root');
});


// GET /todos
// requireAuthentication — route-level middleware
app.get('/todos', middleware.requireAuthentication, function (req, res) {
  var query = req.query;
  var where = {};

  if (query.hasOwnProperty('completed') && query.completed === 'false') {
    where.completed = false;
  } else if (query.hasOwnProperty('completed') && query.completed === 'true') {
    where.completed = true;
  }

  if (query.hasOwnProperty('q') && query.q.length > 0) {

    if (db.env === 'production') {
      where.description = {
        $iLike: '%' + query.q + '%'
      }
    } else {
      where.description = {
        $like: '%' + query.q + '%'
      }
    }
  }

  db.todo
    .findAll({
      where: where
    })
    .then(function (todos) {
      if (todos) {
        res.json(todos);
      }
    }, function (e) {
      res.status(500).send();
    });
});


// GET /todos/:id
app.get('/todos/:id', middleware.requireAuthentication, function (req, res) {

  // typeof req.params.id = 'string' — convert to number
  var todoId = parseInt(req.params.id, 10);

  db.todo
    .findById(todoId)
    .then(function (todo) {

      // !! converts to BOOLEAN. todo = truthy. 1st ! = false. 2nd ! = true
      if (!!todo) {
        res.json(todo.toJSON());
      } else {
        res.status(404).send();
      }
    }, function (e) {
      // 500 — problem with server
      res.status(500).send();
    });
});



// POST /todos
app.post('/todos', middleware.requireAuthentication, function (req, res) {
  var body = _.pick(req.body, 'description', 'completed');

  db.todo.create(body)
    .then(function (todo) {

      //Associate user with todo
      req.user.addTodo(todo)
        .then(function () {

          /* 
           * todo we have referenced is different from the one 
           * in the db since we have added an association.
           * reload to sync to db
           * continue w/ updated version of todo
           */

          return todo.reload();
        })
        .then(function (todo) {
          res.json(todo.toJSON());
        });

    })
    .catch(function (e) {
      res.status(400).json(e);
    });
});



// DELETE /todos/:id
app.delete('/todos/:id', middleware.requireAuthentication, function (req, res) {
  var todoId = parseInt(req.params.id, 10);

  db.todo.destroy({
      where: {
        id: todoId
      }
    })
    .then(function (rowsDeleted) {
      if (rowsDeleted === 0) {
        res.status(400).json({
          "error": "No todo found with that id"
        });
      } else {

        // 204 — everything went well but nothing to send back
        res.status(204).send();
      }
    }, function () {
      res.status(500).send();
    });
});



// PUT /todos/:id
app.put('/todos/:id', middleware.requireAuthentication, function (req, res) {
  var todoId = parseInt(req.params.id, 10),
    body = _.pick(req.body, 'description', 'completed'),
    attributes = {};

  if (body.hasOwnProperty('completed')) {
    attributes.completed = body.completed;
  }

  if (body.hasOwnProperty('description')) {
    attributes.description = body.description;
  }

  db.todo.findById(todoId)
    .then(function (todo) {
      if (todo) {
        todo
          .update(attributes)
          .then(function (todo) {
            res.json(todo.toJSON());
          }, function (e) {

            // 400 — invalid syntax
            res.status(400).json(e);
          });
      } else {
        res.status(404).send();
      }
    }, function () {
      res.status(500).send();
    });
});



// POST /users
app.post('/users', function (req, res) {
  var body = _.pick(req.body, 'email', 'password');

  db.user.create(body)
    .then(function (user) {
      res.json(user.toPublicJSON());
    })
    .catch(function (e) {
      res.status(400).json(e);
    });
});



// POST /users/login
app.post('/users/login', function (req, res) {
  var body = _.pick(req.body, 'email', 'password');

  db.user
    .authenticate(body)
    .then(function (user) {


      /* 
       * If we have a successful login request we want to return a
       * token in the header to the person using the API.
       * Then they can make a bunch of request to create/edit todos
       * without worrying about messing with someone else's todos.
       */

      // 'authentication' — our bespoke type
      var token = user.generateToken('authentication');

      if (token) {
        res.header('Auth', token).json(user.toPublicJSON());
      } else {
        res.send(401).send();
      }
    }, function () {
      res.send(401).send();
    });
});



// SYNC DB & listen up...
// db.sequelize.sync({force: true}) — force complete rebuild of db
db.sequelize
  .sync({
    force: true
  })
  .then(function () {
    app.listen(PORT, function () {
      console.log('Express listening on port ' + PORT + '!');
    });
  });