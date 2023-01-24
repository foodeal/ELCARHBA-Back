const { DataTypes, BelongsTo } = require('sequelize');
module.exports = Logs;

function Logs(sequelize) {
    const attributes = {
        date: { type: DataTypes.DATE, allowNull: false },
        utilisateur: { type: DataTypes.STRING, allowNull: false },
        mod: { type: DataTypes.STRING, allowNull: false },
        msg: { type: DataTypes.STRING, allowNull: false }
    };

    const options = {
        defaultScope: {
            // exclude hash by default
            attributes: { exclude: [''] }
        },
        scopes: {
            // include hash with this scope
            withHash: { attributes: {}, }
        },
        associate: function(models) {
            // associations can be defined here
        }
    };


    return sequelize.define('Logs', attributes, options);
}