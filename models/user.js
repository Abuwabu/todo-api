// Specific format for a file called with sequelize.import 

var bcrypt = require('bcrypt'),
    _ = require('underscore');

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('user', {
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
            set: function(value){
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
        instanceMethods: {
            toPublicJSON: function() {
                var json = this.toJSON();
                return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');
            }
        }
    });
};