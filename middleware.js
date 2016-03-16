/**
 * Middleware functions for todo-api.
 * Since middleware is run before the regular route handler next() moves
 * us back into regular route handler
 *  
 * @module        middleware
 * @summary       middleware functions for todo-api
 * @param         {object} db — db connection, models, and env
 * @returns       {object} middleware — all middleware functionality
 */


module.exports = function (db) {
  return {
    
    /**
     * Looks for the Auth token in the headers.
     * Finds the associated user using a custom class method findByToken().
     * Adds user data to the req object.
     * 
     * @function      requireAuthentication
     * @summary       require authentication for access to todos
     * @param         {object} req — the request object
     * @param         {object} res — the result object
     * @param         {function} next()
     */
    
    requireAuthentication: function (req, res, next) {
      var token = req.get('Auth');

      db.user
        .findByToken(token)
        .then(function addUserToReq(user) {
          req.user = user
          next();
        }, function invalidData() {

          // By not calling next() the process stops.
          res.status(401).send();
        });
    }
  };
};