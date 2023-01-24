const { DataTypes, BelongsTo } = require('sequelize');
module.exports = Coupon_Historique;

function Coupon_Historique(sequelize) {
    const attributes = {
        coupon_id: { type: DataTypes.INTEGER, allowNull: false, references: { model : 'Coupons', key: 'id' } },
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


    return sequelize.define('Coupon_Historique', attributes, options);
}