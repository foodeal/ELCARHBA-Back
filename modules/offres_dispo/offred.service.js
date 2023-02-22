const jwt = require('jsonwebtoken');
const db = require('../../helpers/db');
const Sequelize = require("sequelize");
const Op = Sequelize.Op;


module.exports = {
    getAll,
    getById,
    create,
    update,
    getFichiers,
    findOffre,
    getAvant,
    getBest,
    getFilter,
    getPrestataire,
    delete: _delete
};


async function getAll() {
    offres = await db.Offre_Dispo.findAll({ order: [['date_debut', 'DESC']] }); 
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
    offres = await db.Offre_Dispo.findAll({ order: [['date_debut', 'DESC']] }); 
    var ofs = JSON.parse(JSON.stringify(offres));
    var res = [];
    if (ofs.length) {
    for (let i=0; i < ofs.length; i++) {
        const offre = await db.Offre.findOne({ where: { id: ofs[i].offre_id }, raw: true });
        if (offre.prestataire_id == id)
        {
        const ofsf = await getData(ofs[i]);
        res = res.concat(ofsf);
        }
    }
    console.log(res);
    return res; 
    }
}

async function getAll() {
    offres = await db.Offre_Dispo.findAll({ order: [['date_debut', 'DESC']] }); 
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

async function getAvant() {
    var today = (new Date(new Date().getTime())).toISOString();
    var nextday = (new Date(new Date().getTime()+(3*24*60*60*1000))).toISOString();
    console.log(today);

    offres = await db.Offre_Dispo.findAll({ where: { [Op.and] : [
        { date_fin: {[Op.gt]: today } },
        { date_fin: {[Op.lt]: nextday } }
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


async function getBest() {
    const offres = await db.Offre_Dispo.findAll();


    var ofs = JSON.parse(JSON.stringify(offres));
    var nb =0 ;
    var res = [];
    if (ofs.length) {
    for (let i=0; i < ofs.length; i++) {
        const coupons = await db.Coupon.findAll({ where: { offre_id: ofs[i].id }, raw: true } );
        var cps = JSON.parse(JSON.stringify(coupons));
        for (let j=0; j < cps.length; j++) {
            const coupons_hist = await db.Coupon_Historique.findAll({ where: { coupon_id: cps[i].id }, raw: true } );  
            var nbcoupons = coupons_hist.length;
            if (nbcoupons > nb) { 
                console.log(nbcoupons);
                console.log(ofs[i]);
                nb = nbcoupons; 
                const ofsf = await getData(ofs[i]);
                res = res.concat(ofsf);
            }
        }
    }
    console.log(res);
    return res; 
    }
}


async function getData(off) {
    const offre = await db.Offre.findOne({ where: { id: off.offre_id }, raw: true });
    const file = await db.Fichier.findAll({ where: { offre: offre.id }, raw: true });
    const garage = await db.Garage.findOne({ where: { prestataire_id: offre.prestataire_id }, raw: true });
    const prestataire = await db.Prestataire.findOne({ where: { id: offre.prestataire_id }, raw: true });
    let b = {
        'offre': offre,
        'files': file,
        'garage': garage,
        'prestataire': prestataire
    }
    off = Object.assign(off, b);
    return (off)
}


async function getById(id) {
    var dispo = await db.Offre_Dispo.findOne({ where: { id: id }, raw: true });
    console.log(dispo);
    const offre = await db.Offre.findOne({ where: { id: dispo.offre_id }, raw: true });
    const file = await db.Fichier.findAll({ where: { offre: dispo.offre_id }, raw: true });
    const garage = await db.Garage.findOne({ where: { prestataire_id: offre.prestataire_id }, raw: true });
    const prestataire = await db.Prestataire.findOne({ where: { id: offre.prestataire_id }, raw: true });
    let b = {
        'offre': offre,
        'files': file,
        'garage': garage,
        'prestataire': prestataire
    }
    dispo = Object.assign(dispo, b);
    return (dispo);
}

async function create(params) {
    const am = await db.Offre_Dispo.create(params.body);

    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "Offre";
    params.msg = "Ajout de OffreD ID : " + am.id;
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
    params.msg = "Update de OffreD ID : " + offre.id;
    await db.Log.create(params);

    return await omitHash(offre.get());
}

async function _delete(params) {
    const offre = await getOffre(params.params.id);
    await offre.destroy();

    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "Offre";
    params.msg = "Suppression de OffreD ID : " + offre.id;
    await db.Log.create(params);
}

// helper functions

async function getOffre(id) {
    const offre = await db.Offre_Dispo.findByPk(id);
    if (!offre) throw 'Pas de Matiere';
    return offre;
}

async function getFichiers(id) {
    return await db.Fichier.findAll({ where: { offre: id } });
}


async function findOffre(params) {
    if (params)
    {
        const offre = await db.Offre_Dispo.findAll({ where: { [Op.and] : [
           { date_debut: {[Op.like]: params.date_debut + '%'} },
           { date_fin: {[Op.like]: params.date_fin + '%'} }
        ]}});
        if (!offre) {throw 'Vide' }
        else return await offre;
    } else 
    { throw 'Vide' ;}
}

async function getFilter(params) {
    const allOffres = await db.Offre_Dispo.findAll();
    if (params)
    {
        if (params.categorie) {
        const offre = await db.Offre_Dispo.findAll({ where: { [Op.and] : [
           { categorie: params.categories  },
        //    { date_fin: {[Op.like]: params.date_fin + '%'} }
        ]}});
        }  
        if (params.categorie) {
        const offre = await db.Offre_Dispo.findAll({ where: { [Op.and] : [
            { categorie: params.categories  },
            //    { date_fin: {[Op.like]: params.date_fin + '%'} }
        ]}});
        }  
        if (!offre) {throw 'Vide' }
        else return await offre;
    } else 
    { throw 'Vide' ;}
}

function omitHash(offre) {
    const { hash, ...offreWithoutHash } = offre;
    return offreWithoutHash;
}

// Schedule 
const schedule = require('node-schedule');

var d = (new Date(new Date().getTime())).toISOString();
const job = schedule.scheduleJob('1 0 * * *', async function(){
    offres = await db.Offre_Dispo.findAll({ where: { [Op.and] : [
        { date_fin: {[Op.lt]: d } },
        { offre_expired : false}
    ]}});
    var ofs = JSON.parse(JSON.stringify(offres));
    var res = [];
    if (ofs.length) {
    for (let i=0; i < ofs.length; i++) {
        console.log(ofs[i]);
        ofs[i].offre_expired = true;
        console.log(ofs[i]);
        const offre = await getOffre(ofs[i].id);
        Object.assign(offre, ofs[i]);
        await offre.save();
    }
    }
});