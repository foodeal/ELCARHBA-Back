const { DataTypes, BelongsTo } = require('sequelize');
module.exports = Offre_Dispo;

function Offre_Dispo(sequelize) {
    const attributes = {
        date_debut: { type: DataTypes.DATEONLY, allowNull: true },
        date_fin: { type: DataTypes.DATEONLY, allowNull: true },      
        quantite: { type: DataTypes.FLOAT, allowNull: true },
        statut: { type: DataTypes.TEXT, allowNull: true },
        nombre_offres: { type: DataTypes.INTEGER, allowNull: true },
        offre_id: { type: DataTypes.INTEGER, allowNull: false, references: { model : 'Offres', key: 'id' } },
        categorie: { type: DataTypes.STRING, allowNull: true },
        motorisation: { type: DataTypes.STRING, allowNull: true },
        diametre: { type: DataTypes.STRING, allowNull: true },
        type_huile: { type: DataTypes.STRING, allowNull: true },
        offre_expired: { type: DataTypes.BOOLEAN, allowNull: true }
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


    return sequelize.define('Offre_Dispo', attributes, options);
}