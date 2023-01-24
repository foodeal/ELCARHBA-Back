const jwt = require('jsonwebtoken');
const db = require('../../helpers/db');
const Sequelize = require("sequelize");
const Op = Sequelize.Op;


module.exports = {
    getAll,
    getById,
    create,
    update,
    findCouponH,
    delete: _delete
};


async function getAll() {
    return await db.Coupon_Historique.findAll(); 
}

async function getById(id) {
    return await getCouponH(id);
}

async function create(params) {
    const coupon = await db.Coupon_Historique.create(params.body);

    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "Coupon";
    params.msg = "Ajout de CouponH ID : " + coupon.id;
    await db.Log.create(params);

    return await omitHash(am.get());
}

async function update(id, params) {
    const coupon = await getCouponH(id);

    // copy params to am and save
    Object.assign(coupon, params.body);
    await coupon.save();

    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "Coupon";
    params.msg = "Update de CouponH ID : " + coupon.id;
    await db.Log.create(params);

    return await omitHash(coupon.get());
}

async function _delete(params) {
    const coupon = await getCouponH(params.params.id);
    await coupon.destroy();

    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "Coupon";
    params.msg = "Suppression de CouponH ID : " + coupon.id;
    await db.Log.create(params);
}

// helper functions

async function getCouponH(id) {
    const coupon = await db.Coupon_Historique_Historique.findByPk(id);
    if (!coupon) throw 'Pas de Coupon';
    return coupon;
}


async function findCouponH(params) {
    if (params)
    {
        const coupon = await db.Coupon_Historique_Historique.findAll({ where: { [Op.and] : [
           { titre_coupon: {[Op.like]: params.date_debut + '%'} }
        ]}});
        if (!coupon) {throw 'Vide' }
        else return await coupon;
    } else 
    { throw 'Vide' ;}
}

function omitHash(coupon) {
    const { hash, ...couponWithoutHash } = coupon;
    return couponWithoutHash;
}