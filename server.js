/*
 * Todo COLLECTION = all of the todos
 * Todo MODEL = single todo
 */



var express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
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
    res.json(todos); // converted into json and sent back
});


// GET /todos/:id
app.get('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id, 10), // typeof req.params.id = 'string'. Convert to number
        matchedTodo;
    
    todos.forEach(function(todo){
        if (todo.id === todoId) {
            matchedTodo = todo;
        }
    });
    
    if (matchedTodo) {
        res.json(matchedTodo);
    } else {
        res.status(404).send();
    }
});



// POST /todos
app.post('/todos', function (req, res) {
    var body = req.body;

    body.id = todoNextId++;
    todos.push(body);

    res.json(body);
});



// Listen up...
app.listen(PORT, function () {
    console.log('Express listening on port ' + PORT + '!');
});
