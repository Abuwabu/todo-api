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
        where.description = {
            $like: '%' + query.q + '%'
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
    var todoId = parseInt(req.params.id, 10),
        matchedTodo = _.findWhere(todos, {id: todoId});
        
    if (!matchedTodo) {
        res.status(404).json({"error": "no todo found with that id"});
    } else {
        todos = _.without(todos, matchedTodo);    
        res.json(matchedTodo);
    }
});



// PUT /todos/:id
app.put('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id, 10),
        matchedTodo = _.findWhere(todos, {id: todoId}),
        body = _.pick(req.body, 'description', 'completed'),
        validAttributes = {};

    if (!matchedTodo) {
        return res.status(404).send();
    }

    if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
        validAttributes.completed = body.completed;
    } else if (body.hasOwnProperty('completed')) {
        // Has property 'completed' but not boolean
        return res.status(400).send();
    }

    if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
        validAttributes.description = body.description.trim();
    } else if (body.hasOwnProperty('description')) {
        return res.status(400).send();
    }

    _.extend(matchedTodo, validAttributes);
    res.json(matchedTodo);
});



// SYNC DB
db.sequelize.sync().then(function () {
    app.listen(PORT, function () {                                      // Listen up... 
        console.log('Express listening on port ' + PORT + '!');
    });
});
