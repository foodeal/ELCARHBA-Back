const { DataTypes, BelongsTo } = require('sequelize');
module.exports = Historique;

function Historique(sequelize) {
    const attributes = {
        user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model : 'Users', key: 'id' } },
        prestataire_id: { type: DataTypes.INTEGER, allowNull: true, references: { model : 'Prestataires', key: 'id' } },
        titre_offre: { type: DataTypes.STRING, allowNull: false },
        conditions_utilisation: { type: DataTypes.TEXT, allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: true },
        prix_initial: { type: DataTypes.FLOAT, allowNull: true },
        pourcentage_prix_initial: { type: DataTypes.FLOAT, allowNull: true },
        prix_remise: { type: DataTypes.FLOAT, allowNull: true },
        categorie: { type: DataTypes.STRING, allowNull: true },
        motorisation: { type: DataTypes.STRING, allowNull: true },
        diametre: { type: DataTypes.STRING, allowNull: true },
        type_huile: { type: DataTypes.STRING, allowNull: true },
        marque: { type: DataTypes.STRING, allowNull: true },
        modele: { type: DataTypes.STRING, allowNull: true },
        date_debut: { type: DataTypes.DATEONLY, allowNull: true },
        date_fin: { type: DataTypes.DATEONLY, allowNull: true },      
        statut_dispo: { type: DataTypes.TEXT, allowNull: true },
        nombre_offres: { type: DataTypes.INTEGER, allowNull: true },
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


    return sequelize.define('Historique', attributes, options);
}