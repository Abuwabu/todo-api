/**
 * Middleware functions for todo-api.
 * Since middleware is run before the regular route handler next() moves
 * us back into regular route handler
 *  
 * @module        middleware
 * @summary       middleware functions for todo-api
 * @requires      crypto-js
 * @param         {object} db — db connection, models, and env
 * @returns       {object} middleware — all middleware functionality
 */



// NPM REQUIREMNTS
cryptojs = require('crypto-js');



module.exports = function (db) {
  return {
    
    /**
     * Looks for the Auth token in the headers.
     * Finds encrypted token hash in db.
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
      var token = req.get('Auth') || '';
      
      db.token
        .findOne({
          where: {
            tokenHash: cryptojs.MD5(token).toString()
          }
        })
      
        .then(function addTokenToReq(tokenInstance) {
          if (!tokenInstance) {
            throw new Error();
          }
        
          req.token = tokenInstance;
          return db.user.findByToken(token);
        })
        
        .then(function addUserToReq(user) { 
          req.user = user;
          next();
        })
        
        .catch(function () {
          res.status(401).send();
        });
    }
  };
};
