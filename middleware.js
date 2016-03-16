module.exports = function (db) {
  return {


    /* 
     * Middleware function passed req, res, and next
     * Since middleware is run before the regular route handler
     * next() moves back onto regular route handler
     */


    requireAuthentication: function (req, res, next) {
      var token = req.get('Auth');

      // findByToken — custom class method
      db.user
        .findByToken(token)
        .then(function (user) {

          // add user to req obj if success
          req.user = user
          next();
        }, function () {

          // By not calling next the process stops.
          res.status(401).send();
        });
    }
  };
};