/*
 * Todo COLLECTION = all of the todos
 * Todo MODEL = single todo
 */

var express = require('express'),
    app = express(),
    todos = [{
        id: 1,
        description: 'Meet Mum for lunch',
        completed: false
    }, {
        id: 2,
        description: 'Go to market',
        completed: false
    }, {
        id: 3,
        description: 'Storm through node.js course',
        completed: true
    }];


const PORT = process.env.PORT || 3000;



// GET /
app.get('/', function (req, res) {
    res.send('Todo API Root');
});


// GET /todos
app.get('/todos', function (req, res) {
    res.json(todos); // converted into json and sent back
});


// GET /todo/:id


app.listen(PORT, function () {
    console.log('Express listening on port ' + PORT + '!');
});