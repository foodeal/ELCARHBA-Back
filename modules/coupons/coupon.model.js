const { DataTypes, BelongsTo } = require('sequelize');
module.exports = Coupon;

function Coupon(sequelize) {
    const attributes = {
        date_creation_coupon: { type: DataTypes.DATEONLY, allowNull: false },
        date_valide_coupon: { type: DataTypes.DATEONLY, allowNull: false },      
        quantite: { type: DataTypes.INTEGER, allowNull: true },
        prestataire_id: { type: DataTypes.INTEGER, allowNull: false, references: { model : 'Prestataires', key: 'id' } },
        offre_id: { type: DataTypes.INTEGER, allowNull: false, references: { model : 'Offres', key: 'id' } },
        user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model : 'Users', key: 'id' } },
        coupon_valide: { type: DataTypes.BOOLEAN, allowNull: true },
        coupon_expire: { type: DataTypes.BOOLEAN, allowNull: true },
        code_coupon: { type: DataTypes.STRING, allowNull: true}
    };

    const options = {
        defaultScope: {
            // exclude hash by default
            attributes: { exclude: ['code_coupon'] }
        },
        scopes: {
            // include hash with this scope
            withHash: { attributes: {}, }
        },
    };


    return sequelize.define('Coupon', attributes, options);
}