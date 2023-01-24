const jwt = require('jsonwebtoken');
const db = require('../../helpers/db');
const Sequelize = require("sequelize");
const bcrypt = require('bcryptjs');
const Op = Sequelize.Op;


module.exports = {
    getAll,
    getCouponDispo,
    getById,
    getExpired,
    getValide,
    create,
    update,
    findCoupon,
    delete: _delete
};


async function getAll() {
    coupons = await db.Coupon.findAll(); 
    var cps = JSON.parse(JSON.stringify(coupons));
    var res = [];
    if (cps.length) {
    for (let i=0; i < cps.length; i++) {
        const cpsf = await getData(cps[i]);
        res = res.concat(cpsf);
    }
    console.log(res);
    return res; 
    }
}

async function getData(cp) {
    const offre = await db.Offre.findOne({ where: { id: cp.offre_id }, raw: true });
    console.log("offre");
    console.log(offre);
    const prestataire = await db.Prestataire.findOne({ where: { id: cp.prestataire_id}, raw: true });
    let b = {
        'prestataire_name': prestataire.nom_prestataire + " " + prestataire.prenom_prestataire,
        'offre_name': offre.titre_offre,
        'prix': cp.prix_final - cp.argent_gagner,
        'photo': ""
    }
    cp = Object.assign(cp, b);
    return (cp)
}

async function getCouponDispo() {
    coupon = await db.Coupon.findAll({ where: { date_valide_coupon : { [Op.gt]: new Date() } } });

    if (!coupon) {throw 'Vide' }
    else return await coupon;
}

async function getById(id) {
    return await getCoupon(id);
}

async function getExpired(id) {
    const coupon = await db.Coupon.findAll({ where: { [Op.and] : [
        { user_id: id },
        { coupon_expire: true}
    ]}});
    if (coupon) {
    return coupon;
    }
    else throw "pas de coupon expire"
}

async function getValide(id) {
    const coupon = await db.Coupon.findAll({ where: { [Op.and] : [
        { user_id: id },
        { coupon_valide: true}
    ]}});
    if (coupon) {
    return coupon;
    }
    else throw "pas de coupon valide"
}

async function create(params) {
    code = params.body.user_id + "," + params.body.prestataire_id + "," + params.body.offre_id + "," + params.body.date_creation_coupon + "," + params.body.date_valide_coupon;
    params.body.code_coupon = await bcrypt.hash(code, 10);
    console.log(params.body.code_coupon);
    const coupon = await db.Coupon.create(params.body);

    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "Coupon";
    params.msg = "Ajout de Coupon ID : " + coupon.id;
    await db.Log.create(params);
    return await omitHash(coupon.get());
}

async function update(id, params) {
    const coupon = await getCoupon(id);

    // copy params to am and save
    Object.assign(coupon, params.body);
    await coupon.save();

    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "Coupon";
    params.msg = "Update de Coupon ID : " + coupon.id;
    await db.Log.create(params);

    return await omitHash(coupon.get());
}

async function _delete(params) {
    const coupon = await getCoupon(params.params.id);
    await coupon.destroy();

    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "Coupon";
    params.msg = "Suppression de Coupon ID : " + coupon.id;
    await db.Log.create(params);
}

// helper functions

async function getCoupon(id) {
    const coupon = await db.Coupon.findByPk(id);
    if (!coupon) throw 'Pas de Coupon';
    return coupon;
}


async function findCoupon(params) {
    if (params)
    {
        const coupon = await db.Coupon.findAll({ where: { [Op.and] : [
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