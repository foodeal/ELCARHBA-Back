const { DataTypes } = require('sequelize');
module.exports = Prestataire_Dmd;

function Prestataire_Dmd(sequelize) {
    const attributes = {
        nom_prestataire: { type: DataTypes.STRING, allowNull: false },
        prenom_prestataire: { type: DataTypes.STRING, allowNull: false },
        email_prestataire: { type: DataTypes.STRING, allowNull: false },
        tel_prestataire: { type: DataTypes.STRING, allowNull: false },
        raison_sociale: { type: DataTypes.STRING, allowNull: false },
        role: { type: DataTypes.STRING, allowNull: true },
        pays_prestataire: { type: DataTypes.STRING, allowNull: true },
        ville_prestataire: { type: DataTypes.STRING, allowNull: true },
        adresse_prestataire: { type: DataTypes.STRING, allowNull: true },
        description: { type: DataTypes.STRING, allowNull: true },
        site_web: { type: DataTypes.STRING, allowNull: true },
        lien_fb: { type: DataTypes.STRING, allowNull: true },
        lien_insta: { type: DataTypes.STRING, allowNull: true },
        registre_commerce: { type: DataTypes.STRING, allowNull: true },
        cin_gerant: { type: DataTypes.STRING, allowNull: true },
        contrat_condition: { type: DataTypes.STRING, allowNull: true },
        categorie: { type: DataTypes.STRING, allowNull: true },
        motdepasse: { type: DataTypes.STRING, allowNull: true },
        nom_garage: { type: DataTypes.STRING, allowNull: true },
        heures_travail: { type: DataTypes.STRING, allowNull: true },
        jours_travail: { type: DataTypes.STRING, allowNull: true },
        adresse_garage: { type: DataTypes.STRING, allowNull: true },
        contact_garage: { type: DataTypes.STRING, allowNull: true },
        type_garage: { type: DataTypes.TEXT, allowNull: true }
    };

    const options = {
        defaultScope: {
            // exclude hash by default
        },
        scopes: {
            // include hash with this scope
            withHash: { attributes: {}, }
        }
    };

    return sequelize.define('Prestataire_Dmd', attributes, options);
}