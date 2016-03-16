/*
 * Specific format for a file called with sequelize.import
 */



// THE REQUIREMENTS
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

    /*
     * A salt is random data that is used as an additional input
     * to a one-way function that "hashes" a password or passphrase.
     * The primary function of salts is to defend against dictionary
     * attacks versus a list of password hashes and against pre-computed
     * rainbow table attacks.
     */

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
        var salt = bcrypt.genSaltSync(10),
          hashedPassword = bcrypt.hashSync(value, salt);

        this.setDataValue('password', value);
        this.setDataValue('salt', salt);
        this.setDataValue('password_hash', hashedPassword);
      }
    }
  }, {
    hooks: {
      beforeValidate: function (user, options) {
        if (typeof user.email === 'string') {
          user.email = user.email.toLowerCase();
        }
      }
    },
    classMethods: {
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
      findByToken: function (token) {
        return new Promise(function (resolve, reject) {
          try {
            // token hasn't been modified and is valid?
            var decodedJWT = jwt.verify(token, 'qwerty098'),
              // decrypt token
              bytes = cryptojs.AES.decrypt(decodedJWT.token, 'abc123'),
              tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8));

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
      toPublicJSON: function () {
        var json = this.toJSON();
        return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');
      },
      // create token that encrypts the users data
      generateToken: function (type) {
        if (!_.isString(type)) {
          return undefined;
        }

        try {
          var stringData = JSON.stringify({
              id: this.get('id'),
              type: type
            }),
            encryptedData = cryptojs.AES.encrypt(stringData, "abc123").toString(), // encrypt id and token type 
            token = jwt.sign({ // 
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