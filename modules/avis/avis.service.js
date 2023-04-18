const jwt = require('jsonwebtoken');
const db = require('../../helpers/db');
const Sequelize = require("sequelize");
const Op = Sequelize.Op;


module.exports = {
    getAll,
    getById,
    create,
    update,
    getByGarage,
    getByUser,
    delete: _delete
};



async function getAll() {
    avis = await db.Avis.findAll(); 
    return avis; 
}

async function getByUser(id) {
    const avis = await db.Avis.findAll({ where: { [Op.and] : [
        { user_id: {[Op.like]: id + '%'} }
     ]}});
    if (!avis) throw 'Pas de avis';
    return avis;
}

async function getByGarage(id) {
    const avis = await db.Avis.findAll({ where: { [Op.and] : [
        { garage_id: {[Op.like]: id + '%'} }
     ]}});
    if (!avis) throw 'Pas de avis';
    return avis;
}

async function getById(id) {
    const avis = await db.Avis.findOne({ where: { id: id }, raw: true });
    if (avis)
    {return (avis);}
    else {throw "Pas d'avis";}
}

async function create(params) {
    const am = await db.Avis.create(params.body);

    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "Avis";
    params.msg = "Ajout de Avis ID : " + am.id;
    await db.Log.create(params);

    return await omitHash(am.get());
}

async function update(id, params) {
    const avis = await getAvis(id);

    // copy params to am and save
    Object.assign(avis, params.body);
    await avis.save();

    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "Avis";
    params.msg = "Update de Avis ID : " + avis.id;
    await db.Log.create(params);

    return await omitHash(avis.get());
}

async function _delete(params) {
    const avis = await getAvis(params.params.id);
    await avis.destroy();

    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "Avis";
    params.msg = "Suppression de Avis ID : " + avis.id;
    await db.Log.create(params);
}

// helper functions

async function getAvis(id) {
    const avis = await db.Avis.findByPk(id);
    if (!avis) throw 'Pas de Matiere';
    return avis;
}

function omitHash(avis) {
    const { hash, ...avisWithoutHash } = avis;
    return avisWithoutHash;
}