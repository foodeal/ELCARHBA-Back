const { DataTypes, BelongsTo } = require('sequelize');
module.exports = Offre;

function Offre(sequelize) {
    const attributes = {
        titre_offre: { type: DataTypes.TEXT, allowNull: false },
        conditions_utilisation: { type: DataTypes.TEXT, allowNull: false },
        quantite: { type: DataTypes.FLOAT, allowNull: true },
        description: { type: DataTypes.TEXT, allowNull: true },
        prix_initial: { type: DataTypes.FLOAT, allowNull: true },
        pourcentage_prix_initial: { type: DataTypes.FLOAT, allowNull: true },
        prix_remise: { type: DataTypes.FLOAT, allowNull: true },
        prestataire_id: { type: DataTypes.INTEGER, allowNull: false, references: { model : 'Prestataires', key: 'id' } },
        statut: { type: DataTypes.TEXT, allowNull: true }
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
            models.Offre.hasMany(models.Fichiers, {
                foreignKey: { 
                    name: relatedo,
                    allowNull: true }
               });
        }
    };


    return sequelize.define('Offre', attributes, options);
}