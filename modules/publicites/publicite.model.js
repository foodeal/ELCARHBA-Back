const { DataTypes, BelongsTo } = require('sequelize');
module.exports = Publicite;

function Publicite(sequelize) {
    const attributes = {
        titre_pub: { type: DataTypes.STRING, allowNull: true },
        client_pub: { type: DataTypes.STRING, allowNull: true },
        prix_pub: { type: DataTypes.FLOAT, allowNull: true },
        duree_pub: { type: DataTypes.INTEGER, allowNull: true },
        description_pub: { type: DataTypes.TEXT, allowNull: true }
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


    return sequelize.define('Publicite', attributes, options);
}