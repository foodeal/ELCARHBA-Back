const jwt = require('jsonwebtoken');
const db = require('../../helpers/db');
const Sequelize = require("sequelize");
const bcrypt = require('bcryptjs');
const Op = Sequelize.Op;
var CryptoJS = require("crypto-js");


module.exports = {
    getAll,
    getCouponDispo,
    getById,
    getExpired,
    getValide,
    create,
    update,
    findCoupon,
    getData,
    getDataCoupon,
    dcryptCode,
    delete: _delete
};


async function getAll() {
    coupons = await db.Coupon.findAll(); 
    var cps = JSON.parse(JSON.stringify(coupons));
    var res = [];
    if (cps.length) {
    for (let i=0; i < cps.length; i++) {
        const cpsf = await getDataCoupon(cps[i]);
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
    coupons = await db.Coupon.findAll({ where: { date_valide_coupon : { [Op.gt]: new Date() } } });
    var cps = JSON.parse(JSON.stringify(coupons));
    var res = [];
    if (cps.length) {
    for (let i=0; i < cps.length; i++) {
        const cpsf = await getDataCoupon(cps[i]);
        res = res.concat(cpsf);
    }
    console.log(res);
    return res; 
    }
}

async function getById(id) {
    const coupon = await db.Coupon.findByPk(id);
    if (!coupon) throw 'Pas de Coupon';
    const couponData = await getDataCoupon(coupon.get());
    return await omitHash(couponData);
}

async function getExpired(id) {
    coupons = await db.Coupon.findAll({ where: { [Op.and] : [
        { user_id: id },
        { coupon_expire: true}
    ]}});
    var cps = JSON.parse(JSON.stringify(coupons));
    var res = [];
    if (cps.length) {
    for (let i=0; i < cps.length; i++) {
        const cpsf = await getDataCoupon(cps[i]);
        res = res.concat(cpsf);
    }
    console.log(res);
    return res; 
    }
}

async function getValide(id) {
    coupons = await db.Coupon.findAll({ where: { [Op.and] : [
        { user_id: id },
        { coupon_valide: true}
    ]}});
    var cps = JSON.parse(JSON.stringify(coupons));
    var res = [];
    if (cps.length) {
    for (let i=0; i < cps.length; i++) {
        const cpsf = await getDataCoupon(cps[i]);
        res = res.concat(cpsf);
    }
    console.log(res);
    return res; 
    }
}

async function create(params) {
    code = params.body.user_id + "," + params.body.prestataire_id + "," + params.body.offre_id + "," + params.body.date_creation_coupon.toString().substring(-1,15) + "," + params.body.date_valide_coupon.toString().substring(-1,15);
    nb = await db.Coupon.count();
    serie = "CO" + (nb + 1);
    // Encrypt
    var codeCryp = CryptoJS.AES.encrypt(code, 'elcarhba').toString();
    params.body.code_coupon = codeCryp;
    params.body.serie_coupon = serie;
    console.log(params.body.code_coupon);
    const coupon = await db.Coupon.create(params.body);
    const couponData = await getDataCoupon(coupon.get());
    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "Coupon";
    params.msg = "Ajout de Coupon ID : " + coupon.id;
    await db.Log.create(params);

    return await omitHash(couponData);
}

async function dcryptCode(params) {
    // Dcrypt
    const coupon = await db.Coupon.findOne({ where: { [Op.and] : [
        { code_coupon: params.code }
    ]}});
    const offre_dispo = await db.Offre_Dispo.findOne({ where: { id: coupon.offre_id }, raw: true });
    const offre = await db.Offre.findOne({ where: { id: await offre_dispo.offre_id }, raw: true });
    const file = await db.Fichier.findAll({ where: { offre: offre.id }, raw: true });
    const garage = await db.Garage.findOne({ where: { prestataire_id: offre.prestataire_id }, raw: true });
    const prestataire = await db.Prestataire.findOne({ where: { id: offre.prestataire_id }, raw: true });
    var bytes  = CryptoJS.AES.decrypt(params.code, 'elcarhba');
    var originalText = bytes.toString(CryptoJS.enc.Utf8);
    let b = {
        'coupon' : coupon,
        'offre_dispo': offre_dispo,
        'offre': offre,
        'files': file,
        'garage': garage,
        'prestataire': prestataire,
        'code' : originalText
    }
    if (b) {
        return b;
    } else {
        throw "vide"
    }
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
async function getDataCoupon(off) {
    console.log(off.id);
    const offre_dispo = await db.Offre_Dispo.findOne({ where: { id: off.offre_id }, raw: true });
    const offre = await db.Offre.findOne({ where: { id: await offre_dispo.offre_id }, raw: true });
    const file = await db.Fichier.findAll({ where: { offre: off.id }, raw: true });
    const garage = await db.Garage.findOne({ where: { prestataire_id: off.prestataire_id }, raw: true });
    const prestataire = await db.Prestataire.findOne({ where: { id: off.prestataire_id }, raw: true });
    let b = {
        'offre_dispo': offre_dispo,
        'offre': offre,
        'files': file,
        'garage': garage,
        'prestataire': prestataire
    }
    off = Object.assign(off, b);
    return (off)
}

async function getCoupon(id) {
    coupon = await db.Coupon.findByPk(id);
    if (!coupon) throw 'Pas de Coupon';
    return getDataCoupon(coupon);
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

// Schedule 
const schedule = require('node-schedule');

var d = (new Date(new Date().getTime())).toISOString();
const job = schedule.scheduleJob('1 0 * * *', async function(){
    coupons = await db.Coupon.findAll({ where: { [Op.and] : [
        { date_valide_coupon : {[Op.lt]: d } },
        { coupon_expire : false}
    ]}});
    var ofs = JSON.parse(JSON.stringify(coupon));
    var res = [];
    if (ofs.length) {
    for (let i=0; i < ofs.length; i++) {
        console.log(ofs[i]);
        ofs[i].coupon_expire = true;
        console.log(ofs[i]);
        const coupon = await getCoupon(ofs[i].id);
        Object.assign(coupon, ofs[i]);
        await coupon.save();
    }
    }
});