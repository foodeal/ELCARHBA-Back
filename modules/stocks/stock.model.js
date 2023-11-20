const { DataTypes, BelongsTo } = require('sequelize');
module.exports = Stock;

function Stock(sequelize) {
    const attributes = {
        code_stock: { type: DataTypes.STRING, allowNull: true },
        quantite_stock: { type: DataTypes.INTEGER, allowNull: true },
        gain_stock: { type: DataTypes.INTEGER, allowNull: true },
        users_stock: { type: DataTypes.INTEGER, allowNull: true },
        offre_dispo_id: { type: DataTypes.INTEGER, allowNull: false, references: { model : 'Offre_Dispo', key: 'id' } }
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


    return sequelize.define('Stock', attributes, options);
}