const { DataTypes, BelongsTo } = require('sequelize');
module.exports = Offre;

function Offre(sequelize) {
    const attributes = {
        titre_offre: { type: DataTypes.STRING, allowNull: false },
        conditions_utilisation: { type: DataTypes.TEXT, allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: true },
        prix_initial: { type: DataTypes.FLOAT, allowNull: true },
        pourcentage_prix_initial: { type: DataTypes.FLOAT, allowNull: true },
        prix_remise: { type: DataTypes.FLOAT, allowNull: true },
        prix_points: { type: DataTypes.INTEGER, allowNull: true },
        prestataire_id: { type: DataTypes.INTEGER, allowNull: true, references: { model : 'Prestataires', key: 'id' } },
        categorie: { type: DataTypes.STRING, allowNull: true },
        motorisation: { type: DataTypes.STRING, allowNull: true },
        diametre: { type: DataTypes.STRING, allowNull: true },
        type_huile: { type: DataTypes.STRING, allowNull: true },
        marque: { type: DataTypes.STRING, allowNull: true },
        modele: { type: DataTypes.STRING, allowNull: true },
        offre_valid: { type: DataTypes.BOOLEAN, allowNull: true }
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