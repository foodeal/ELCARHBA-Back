const { DataTypes, BelongsTo } = require('sequelize');
module.exports = User_Favori;

function User_Favori(sequelize) {
    const attributes = {
        offre_id: { type: DataTypes.INTEGER, allowNull: false, references: { model : 'Offres', key: 'id' } },
        user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model : 'Users', key: 'id' } }
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
    };

    return sequelize.define('User_Favori', attributes, options);
}