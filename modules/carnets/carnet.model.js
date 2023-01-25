const { DataTypes, BelongsTo } = require('sequelize');
module.exports = Carnet;

function Carnet(sequelize) {
    const attributes = {
        user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model : 'Users', key: 'id' } },
        date_vidange: { type: DataTypes.DATEONLY, allowNull: true },
        klm_vidange: { type: DataTypes.INTEGER, allowNull: true }, 
        klm_plaque: { type: DataTypes.INTEGER, allowNull: true },
        date_batterie: { type: DataTypes.DATEONLY, allowNull: true }, 
        date_assurance: { type: DataTypes.DATEONLY, allowNull: true },
        date_visite: { type: DataTypes.DATEONLY, allowNull: true }
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

    return sequelize.define('Carnet', attributes, options);
}