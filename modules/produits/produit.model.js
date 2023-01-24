const { DataTypes, BelongsTo } = require('sequelize');
module.exports = Produit;

function Produit(sequelize) {
    const attributes = {
        nom: { type: DataTypes.STRING, allowNull: true },
        marque: { type: DataTypes.STRING, allowNull: true },
        modele: { type: DataTypes.STRING, allowNull: true },
        type_motorisation: { type: DataTypes.STRING, allowNull: true },
        categorie: { type: DataTypes.STRING, allowNull: true },
        reference: { type: DataTypes.STRING, allowNull: true },
        prix: { type: DataTypes.FLOAT, allowNull: true },
        description: { type: DataTypes.TEXT, allowNull: true },
        offre_id: { type: DataTypes.INTEGER, allowNull: false, references: { model : 'Offres', key: 'id' } }
    };

    const options = {
        defaultScope: {
            // exclude hash by default
            attributes: { exclude: [''] }
        },
        scopes: {
            // include hash with this scope
            withHash: { attributes: {}, }
        }
    };


    return sequelize.define('Produit', attributes, options);
}