const jwt = require('jsonwebtoken');
const db = require('./../../helpers/db');
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
// AWS
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
    region: 'de',
    accessKeyId: 'f6920d3469784ad8af3f72472d89ae56',
    secretAccessKey: '645c52c0f42f4de5bb3599eea1fb14da',
    endpoint: "https://s3.de.io.cloud.ovh.net/"
  });

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
    deactivate,
    delete: _delete
};

async function deactivate(id) {
    const offre = await db.Offre.scope('withHash').findOne({ where: { id : id } });
    const offreUpd = await db.Offre.findOne({ where: { id : offre.id } });
    if (offreUpd.offre_valid) { offreUpd.offre_valid = false; }
    else { offreUpd.offre_valid = true; }
    Object.assign(offre, offreUpd);
    await offre.save();
    return omitHash(offre.get()); 
}

async function createFull(req, res) {

    const userToken = req.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    req.body.offre_expired = false;
    req.body.prestataire_id = decoded.sub;
    const am = await db.Offre.create(req.body);
    req.body.prix_points = Math.round(req.body.prix_initial);
    req.body.offre_id = am.id;
    req.body.offre = am.id;
    const am2 = await db.Offre_Dispo.create(req.body)
    req.body.code_stock = 'S'+ am.id + 'D' + am2.id;
    req.body.quantite_stock = am2.nombre_offres;
    req.body.gain_stock = 0;
    req.body.users_stock = 0;
    req.body.offre_dispo_id = am2.id;
    const st = await db.Stock.create(req.body)
    if (req.file) {
    req.body.link = "";
    req.body.path = req.file.path;
    const fname = req.body.titre_offre.replace(/ /g,'') + am.id;
    req.body.name = fname;
    console.log(fname);
    req.body.type = req.file.originalname.substr(req.file.originalname.lastIndexOf('.') + 1);
    
    s3.upload({
        Bucket: "elcarhba",
        Key: req.body.titre_offre,
        Body: req.file.buffer
        }, (err, data) => {
        if (err) {
        console.error(err);
        } else {
        req.body.url = data.Location;
        console.log(`File uploaded successfully. ${data.Location}`);
        console.log("Req: " + req.body.path);
        db.Fichier.create(req.body);
        }
    });
    }

    req.date = Date.now();
    req.utilisateur = decoded.sub;
    req.mod = "Offre";
    req.msg = "Ajout de Offre ID : " + am.id;
    await db.Log.create(req);
    
    const fichier = db.Fichier.findOne({ where: { offre: am.id }, raw: true });
    let b = {
        offre : am,
        offre_dispo : am2,
        stock: st,
        fichier: fichier
    }
    
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
    params.body.prix_points = Math.round(params.body.prix_initial);
    if (params.body.nombre_offres) {
    const dispo = await db.Offre_Dispo.findOne({ where: { offre_id: offre.id }, raw: true });
    const stock = await db.Stock.findOne({ where: { offre_dispo_id: dispo.id }, raw: true });
    const stockUpd = await db.Stock.findOne({ where: { offre_dispo_id: dispo.id }, raw: true });
    stockUpd.quantite_stock = params.body.nombre_offres;
    // copy params to am and save
    Object.assign(stock, stockUpd);
    }
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