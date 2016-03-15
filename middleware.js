module.exports = function (db) {
    return {


        /* 
         * Middleware function passed req, res, and next
         * Since middleware is run before the regular route handler
         * next() moves back onto regular route handler
         */


        requireAuthentication: function (req, res, next) {
            var token = req.get('Auth');

            db.user.findByToken(token).then(function (user) { // findByToken — custom class method
                req.user = user                               // add user to req obj if success
                next();
            }, function () {
                res.status(401).send();                       // By not calling next the process stops.
            });
        }
    };
};