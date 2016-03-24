/**
 * User model exported in the specific format
 * for a file called with sequelize.import 
 * 
 * @module        user
 * @summary       user model/method definitions for todo-api
 * 
 * @requires      underscore
 * @requires      bcrypt
 * @requires      crypto-js
 * @requires      jsonwebtoken
 * 
 * @param         {object} sequelize — db instance
 * @param         {object} DataTypes — sequelize convenience class of data types
 * @returns       {object} User — model definition
 * 
 * @todo          abstract passwords in findByToken()
 */



// NPM REQUIREMENTS
var bcrypt = require('bcrypt');
var _ = require('underscore');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');



module.exports = function (sequelize, DataTypes) {
  var User = sequelize.define('user', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,

      // only one user per email allowed
      unique: true,
      validate: {
        isEmail: true
      }
    },

    // A salt is random data that is used as an additional input
    // to a one-way function that "hashes" a password or passphrase.
    // The primary function of salts is to defend against dictionary
    // attacks versus a list of password hashes and against pre-computed
    // rainbow table attacks.
     
    salt: {
      type: DataTypes.STRING
    },
    password_hash: {
      type: DataTypes.STRING
    },
    password: {
      
      // Sequelize VIRTUAL datatype is accessible but isn't stored on the db
      type: DataTypes.VIRTUAL,
      allowNull: false,
      validate: {
        len: [7, 100]
      },
      set: function (value) {

        // Number of chars for salt
        var salt = bcrypt.genSaltSync(10);
        var hashedPassword = bcrypt.hashSync(value, salt);

        this.setDataValue('password', value);
        this.setDataValue('salt', salt);
        this.setDataValue('password_hash', hashedPassword);
      }
    }
  }, {
    hooks: {
      
      /*
       * @function        beforeValidate
       * @summary         convert email to lowercase before validating
       */
      
      beforeValidate: function (user, options) {
        if (typeof user.email === 'string') {
          user.email = user.email.toLowerCase();
        }
      }
    },
    classMethods: {
      
      /** 
       * Check email and password are strings. Find user from the db.
       * Compare input password with password_hash
       * Return {object} user or reject
       * 
       * @function      authenticate
       * @summary       Authenticate login details
       * @returns       {promise} resolve(user) || reject()
       */
      
      authenticate: function (body) {
        return new Promise(function (resolve, reject) {

          if (typeof body.email !== 'string' || typeof body.password !== 'string') {
            return reject();
          }

          User.findOne({
              where: {
                email: body.email.toLowerCase()
              }
            })
            .then(function (user) {
              if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) {
                return reject();
              }

              resolve(user);
            }, function (e) {
              reject();
            });
        });
      },
      
      /**
       * Verify the web token is valid (unmodified) and decode with password.
       * Decrypt token with password, convert to string, and parse from JSON
       * Use id from token to find user and return user object
       * 
       * @function      findByToken
       * @summary       find user data from signed web token
       * @returns       {promise} resolve(user) || reject()
       */
      
      findByToken: function (token) {
        return new Promise(function (resolve, reject) {
          try {
            var decodedJWT = jwt.verify(token, 'qwerty098');
            var bytes = cryptojs.AES.decrypt(decodedJWT.token, 'abc123');
            var tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8));

            User.findById(tokenData.id)
              .then(function (user) {
                user ? resolve(user) : reject();
              }, function (e) {
                reject();
              });
          } catch (e) {
            reject();
          }
        });
      }
    },
    instanceMethods: {
      
      /**
       * Convert user instance to JSON.
       * Remove password, salts, and other sensitive data
       * Return sanitised user instance.
       * 
       * @function      toPublicSON
       * @summary       sanitise user object for public consumption
       * @returns       {object} json — sanitised user instance
       */
      
      toPublicJSON: function () {
        var json = this.toJSON();
        return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');
      },
      
      /**
       * Create token that encrypts the users data.
       * Check token type is a string, 
       * Encrypt id and type with a password
       * Generate signed web token with encrypted data and second password
       * 
       * @function      generateToken
       * @summary       Creates token that encrypts the users data.
       * @returns       {string} token — signed web token.
       */
      
      generateToken: function (type) {
        if (!_.isString(type)) {
          return undefined;
        }

        try {
          var stringData = JSON.stringify({
              id: this.get('id'),
              type: type
            }),
            encryptedData = cryptojs.AES.encrypt(stringData, "abc123").toString(),
            token = jwt.sign({
              token: encryptedData
            }, 'qwerty098');

          return token;
        } catch (e) {
          
          // really useful for debugging
          console.error(e);
          return undefined;
        }
      }
    }
  });

  return User;
};