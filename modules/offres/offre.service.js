const jwt = require('jsonwebtoken');
const db = require('./../../helpers/db');
const Sequelize = require("sequelize");
const Op = Sequelize.Op;


module.exports = {
    getAll,
    getById,
    create,
    update,
    getFichiers,
    filterPrix,
    findOffre,
    getPrestataire,
    getGarage,
    createFull,
    delete: _delete
};

async function createFull(params) {
    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    params.body.offre_expired = false;
    params.body.prestataire_id = decoded.sub;
    const am = await db.Offre.create(params.body);
    params.body.offre_id = am.id;
    const am2 = await db.Offre_Dispo.create(params.body)
    params.body.code_stock = 'S'+ am.id + 'D' + am2.id;
    params.body.quantite_stock = am2.nombre_offres;
    params.body.gain_stock = 0;
    params.body.users_stock = 0;
    params.body.offre_dispo_id = am2.id;
    const st = await fb.Stock.create(params.body)
    let b = {
        offre : am,
        offre_dispo : am2,
        stock: st
    }

    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "Offre";
    params.msg = "Ajout de Offre ID : " + am.id;
    await db.Log.create(params);

    return b;
}


async function getAll() {
    offres = await db.Offre.findAll(); 
    var ofs = JSON.parse(JSON.stringify(offres));
    var res = [];
    if (ofs.length) {
    for (let i=0; i < ofs.length; i++) {
        const ofsf = await getData(ofs[i]);
        res = res.concat(ofsf);
    }
    console.log(res);
    return res; 
    }
}

async function getPrestataire(id) {
    offres = await db.Offre.findAll({ where: { prestataire_id: id }, raw: true }); 
    var ofs = JSON.parse(JSON.stringify(offres));
    var res = [];
    if (ofs.length) {
    for (let i=0; i < ofs.length; i++) {
        const ofsf = await getData(ofs[i]);
        res = res.concat(ofsf);
    }
    console.log(res);
    return res; 
    }
}

async function getGarage(id) {
    const garage = await db.Garage.findOne({ where: { prestataire_id: id }, raw: true });
    offres = await db.Offre.findAll({ where: { prestataire_id: garage.prestataire_id }, raw: true }); 
    var ofs = JSON.parse(JSON.stringify(offres));
    var res = [];
    if (ofs.length) {
    for (let i=0; i < ofs.length; i++) {
        const ofsf = await getData(ofs[i]);
        res = res.concat(ofsf);
    }
    console.log(res);
    return res; 
    }
}

async function getData(off) {
    const offre = await db.Offre.findOne({ where: { id: off.id }, raw: true });
    const file = await db.Fichier.findAll({ where: { offre: offre.id }, raw: true });
    const garage = await db.Garage.findAll({ where: { prestataire_id: offre.prestataire_id }, raw: true });
    const prestataire = await db.Prestataire.findOne({ where: { id: offre.prestataire_id }, raw: true });
    let b = {
        'files': file,
        'garage': garage,
        'prestataire': prestataire
    }
    off = Object.assign(off, b);
    return (off)
}

async function getById(id) {
    var offre = await db.Offre.findOne({ where: { id: id }, raw: true });
    const file = await db.Fichier.findAll({ where: { offre: offre.id }, raw: true });
    const garage = await db.Garage.findAll({ where: { prestataire_id: offre.prestataire_id }, raw: true });
    const prestataire = await db.Prestataire.findOne({ where: { id: offre.prestataire_id }, raw: true });
    let b = {
        'files': file,
        'garage': garage,
        'prestataire': prestataire
    }
    offre = Object.assign(offre, b);
    return (offre);
}

async function create(params) {
    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    params.body.prestataire_id = decoded.sub;
    const am = await db.Offre.create(params.body);

    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "Offre";
    params.msg = "Ajout de Offre ID : " + am.id;
    await db.Log.create(params);

    return await omitHash(am.get());
}

async function update(id, params) {
    const offre = await getOffre(id);

    // copy params to am and save
    Object.assign(offre, params.body);
    await offre.save();

    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "Offre";
    params.msg = "Update de Offre ID : " + offre.id;
    await db.Log.create(params);

    return await omitHash(offre.get());
}

async function _delete(params) {
    const offre = await getOffre(params.params.id);
    offre.offre_valid = false;
    const offres = await db.Offre_Dispo.findAll({ where: { offre_id: offre.id }, raw: true }); 
    var ofs = JSON.parse(JSON.stringify(offres));
    if (ofs.length) {
    for (let i=0; i < ofs.length; i++) {
        const off = await db.Offre_Dispo.findByPk(ofs[i].id);
        const coupons = await db.Coupon.findAll({ where: { offre_id: off.id }, raw: true }); 
        var cps = JSON.parse(JSON.stringify(coupons));
        if (cps.length) {
            for (let j=0; j < cps.length; j++) {
                const cp = await db.Coupon.findByPk(cps[j].id);
                cp.coupon_valide = false;
                await cp.save();
            }
        }
        off.offre_dispo_valid = false;
        await off.save();
    }
    }
    await offre.save();

    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "Offre";
    params.msg = "Suppression de Offre ID : " + offre.id;
    await db.Log.create(params);
}

// helper functions

async function filterPrix(params) {
    console.log(params);
    const offres = await db.Offre.findAll({ where: { [Op.and] : [
        { prix_initial: { [Op.between]: [+params.body.min, +params.body.max] } }
    ]}});



    var ofs = JSON.parse(JSON.stringify(offres));
    var res = [];
    if (ofs.length) {
    for (let i=0; i < ofs.length; i++) {
        const ofsf = await getData(ofs[i]);
        res = res.concat(ofsf);
    }
    console.log(res);
    return res; 
    }
}

async function getOffre(id) {
    const offre = await db.Offre.findByPk(id);
    if (!offre) throw 'Pas de Matiere';
    return offre;
}

async function getFichiers(id) {
    return await db.Fichier.findAll({ where: { offre: id } });
}


async function findOffre(params) {
    if (params)
    {
        const offre = await db.Offre.findAll({ where: { [Op.and] : [
           { titre_offre: {[Op.like]: params.titre_offre + '%'} },
        ]}});
        if (!offre) {throw 'Vide' }
        else return await offre;
    } else 
    { throw 'Vide' ;}
}

function omitHash(offre) {
    const { hash, ...offreWithoutHash } = offre;
    return offreWithoutHash;
}