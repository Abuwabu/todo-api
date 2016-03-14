/*
 * Todo COLLECTION = all of the todos
 * Todo MODEL = single todo
 */



// REQUIREMENTS
var express = require('express'),
    bodyParser = require('body-parser'),
    _ = require('underscore'),
    db = require('./db.js');



// VARIABLES
var app = express(),
    todos = [],
    todoNextId = 1;

const PORT = process.env.PORT || 3000;



// MIDDLEWARE
app.use(bodyParser.json());



// GET /
app.get('/', function (req, res) {
    res.send('Todo API Root');
});


// GET /todos
app.get('/todos', function (req, res) {
    var query = req.query,
        where = {};

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

    db.todo.findAll({
        where: where
    }).then(function (todos) {
        if (todos) {
            res.json(todos);
        }
    }, function (e) {
        res.status(500).send();
    });
});


// GET /todos/:id
app.get('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id, 10);                   // typeof req.params.id = 'string'. Convert to number

    db.todo.findById(todoId).then(function (todo) {
        if (!!todo) {                                           // !! converts to BOOLEAN. todo = truthy. 1st ! = false. 2nd ! = true
            res.json(todo.toJSON());
        } else {
            res.status(404).send();
        }
    }, function (e) {
        res.status(500).send();                                 // 500 — problem with server
    }); 
});



// POST /todos
app.post('/todos', function (req, res) {
    var body = _.pick(req.body, 'description', 'completed');
        
    db.todo.create(body).then(function(todo){
        res.json(todo.toJSON());
    }).catch(function(e){
        res.status(400).json(e);
    });
});



// DELETE /todos/:id
app.delete('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id, 10);

    db.todo.destroy({
        where: {
            id: todoId
        }
    }).then(function (rowsDeleted) {
        if (rowsDeleted === 0) {
            res.status(400).json({
                "error": "No todo found with that id"
            });
        } else {
            res.status(204).send(); // 204 — everything went well but nothing to send back
        }
    }, function () {
        res.status(500).send();
    });
});



// PUT /todos/:id
app.put('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id, 10),
        body = _.pick(req.body, 'description', 'completed'),
        attributes = {};

    if (body.hasOwnProperty('completed')) {
        attributes.completed = body.completed;
    }

    if (body.hasOwnProperty('description')) {
        attributes.description = body.description;
    }

    db.todo.findById(todoId).then(function (todo) {
        if (todo) {
            todo.update(attributes).then(function (todo) {
                res.json(todo.toJSON());
            }, function (e) {
                res.status(400).json(e); // invalid syntax
            });
        } else {
            res.status(404).send();
        }
    }, function () {
        res.status(500).send();
    });
});



// SYNC DB & listen up...
db.sequelize.sync().then(function () {
    app.listen(PORT, function () {                                 
        console.log('Express listening on port ' + PORT + '!');
    });
});
