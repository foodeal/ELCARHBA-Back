const { DataTypes, BelongsTo } = require('sequelize');
module.exports = Avis;

function Avis(sequelize) {
    const attributes = {
        avis: { type: DataTypes.INTEGER, allowNull: false },
        nb_avis: { type: DataTypes.INTEGER, allowNull: false },
        user_id: { type: DataTypes.INTEGER, allowNull: true, references: { model : 'Users', key: 'id' } },
        garage_id: { type: DataTypes.INTEGER, allowNull: true, references: { model : 'Garages', key: 'id' } }
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
            models.Avis.hasMany(models.Fichiers, {
                foreignKey: { 
                    name: relatedo,
                    allowNull: true }
               });
        }
    };


    return sequelize.define('Avis', attributes, options);
}