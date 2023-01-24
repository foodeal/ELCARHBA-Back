const { DataTypes, BelongsTo } = require('sequelize');
module.exports = Expert;

function Expert(sequelize) {
    const attributes = {
        nom_précom_expert: { type: DataTypes.STRING, allowNull: false },
        mail_expert: { type: DataTypes.STRING, allowNull: false },      
        telephone_expert: { type: DataTypes.STRING, allowNull: true },
        domaine_expert: { type: DataTypes.STRING, allowNull: false }
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


    return sequelize.define('Expert', attributes, options);
}