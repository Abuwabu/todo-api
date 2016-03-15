/*
 * Todo COLLECTION = all of the todos
 * Todo MODEL = single todo
 */



// REQUIREMENTS
var _           = require('underscore'),
    bcrypt      = require('bcrypt'),
    bodyParser  = require('body-parser'),
    db          = require('./db.js'),
    express     = require('express'),
    middleware  = require('./middleware.js')(db);    // exports a function — pass in the db



// VARIABLES
var app = express();

const PORT = process.env.PORT || 3000;



// APP-LEVEL MIDDLEWARE
app.use(bodyParser.json());



// GET /
app.get('/', function (req, res) {
    res.send('Todo API Root');
});


// GET /todos
app.get('/todos', middleware.requireAuthentication, function (req, res) {       // route-level middleware
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
app.get('/todos/:id', middleware.requireAuthentication, function (req, res) {
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
app.post('/todos', middleware.requireAuthentication, function (req, res) {
    var body = _.pick(req.body, 'description', 'completed');
        
    db.todo.create(body).then(function(todo){
        
        //Associate user with todo
        req.user.addTodo(todo).then(function(){
            
            /* 
             * todo we have referenced is different from the on 
             * in the db since we have added and association.
             */
            
            // reload todo to sync
            return todo.reload();
        }).then(function(todo){ // updated version of todo
            res.json(todo.toJSON()); 
        });
        
    }).catch(function(e){
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



// POST /users
app.post('/users', function (req, res) {
    var body = _.pick(req.body, 'email', 'password');
        
    db.user.create(body).then(function(user){
        res.json(user.toPublicJSON());
    }).catch(function(e){
        res.status(400).json(e);
    });
});



// POST /users/login
app.post('/users/login', function (req, res) {
    var body = _.pick(req.body, 'email', 'password');
        
    db.user.authenticate(body).then(function (user) {
        
        
        /* 
         * If we have a successful login request we want to return a
         * token in the header to the person using the API.
         * Then they can make a bunch of request to create/edit todos
         * without worrying about messing with someone else's todos.
         */
        
        
        var token = user.generateToken('authentication'); // 'authentication' — our bespoke type
        
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
db.sequelize.sync({force: true}).then(function () { // db.sequelize.sync({force: true})... to force complete rebuild of databses
    app.listen(PORT, function () {                                 
        console.log('Express listening on port ' + PORT + '!');
    });
});
