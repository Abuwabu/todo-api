/*
 * Specific format for a file called with sequelize.import
 */



// THE REQUIREMENTS
var bcrypt = require('bcrypt'),
    _ = require('underscore'),
    cryptojs = require('crypto-js'),
    jwt = require('jsonwebtoken');



module.exports = function (sequelize, DataTypes) {
    var User = sequelize.define('user', {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true, // only one user per email allowed
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
            type: DataTypes.VIRTUAL, // VIRTUAL datatype is accessible but isn't stored on the db
            allowNull: false,
            validate: {
                len: [7, 100]
            },
            set: function (value) {
                var salt = bcrypt.genSaltSync(10), // Number of chars for salt
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
                    }).then(function (user) {
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
                return new Promise(function(resolve, reject){
                    try {
                        var decodedJWT = jwt.verify(token, 'qwerty098'), // token hasn't been modified and is valid
                            bytes = cryptojs.AES.decrypt(decodedJWT.token, 'abc123'), // decrypt token
                            tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8));
                        
                        User.findById(tokenData.id).then(function(user) {
                            user ? resolve(user) : reject();
                        }, function(e) {
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
            generateToken: function (type) { // create token that encrypts the users data
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
                    console.error(e); // really useful for debugging
                    return undefined;
                }
            }
        }
    });

    return User;
};