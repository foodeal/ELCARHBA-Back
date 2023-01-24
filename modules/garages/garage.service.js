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
    delete: _delete
};


async function getAll() {
    return await db.Offre.findAll(); 
}

async function getById(id) {
    return await getOffre(id);
}

async function create(params) {
    const am = await db.Offre.create(params.body);

    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
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
    await offre.destroy();

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
           { date_debut: {[Op.like]: params.date_debut + '%'} },
           { date_fin: {[Op.like]: params.date_fin + '%'} }
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