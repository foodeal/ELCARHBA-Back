const { DataTypes } = require('sequelize');
module.exports = User;

function User(sequelize) {
    const attributes = {
        nom_utilisateur: { type: DataTypes.STRING, allowNull: true },
        prenom_utilisateur: { type: DataTypes.STRING, allowNull: true },
        date_naissance: { type: DataTypes.DATEONLY, allowNull: true },
        email: { type: DataTypes.STRING, allowNull: true },
        tel_utilisateur: { type: DataTypes.STRING, allowNull: true },
        role: { type: DataTypes.STRING, allowNull: true },
        pays_user: { type: DataTypes.STRING, allowNull: true },
        ville_user: { type: DataTypes.STRING, allowNull: true },
        adresse_user: { type: DataTypes.STRING, allowNull: true },
        motdepasse: { type: DataTypes.STRING, allowNull: false },
        argent_gagner: { type: DataTypes.FLOAT, allowNull: true }
    };

    const options = {
        defaultScope: {
            // exclude hash by default
            attributes: { exclude: ['motdepasse'] }
        },
        scopes: {
            // include hash with this scope
            withHash: { attributes: {}, }
        }
    };

    return sequelize.define('User', attributes, options);
}