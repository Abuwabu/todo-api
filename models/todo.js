// Specific format for a file called with sequelize.import 

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('todo', {                   // (modelname, {attributes})
        description: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 250]                           // description must be between 1-250 chars. || notEmpty: true
            }
        },
        completed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    });
};