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
    findPub,
    delete: _delete
};


async function getAll() {
    return await db.Publicite.findAll(); 
}

async function getById(id) {
    return await getPub(id);
}

async function create(params) {
    const pub = await db.Publicite.create(params.body);

    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "Publicite";
    params.msg = "Ajout de Publicite ID : " + pub.id;
    await db.Log.create(params);

    return await omitHash(pub.get());
}

async function update(id, params) {
    const pub = await getPub(id);

    // copy params to am and save
    Object.assign(pub, params.body);
    await pub.save();

    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "Publicite";
    params.msg = "Update de Publicite ID : " + pub.id;
    await db.Log.create(params);

    return await omitHash(pub.get());
}

async function _delete(params) {
    const pub = await getPub(params.params.id);
    await pub.destroy();

    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "Publicite";
    params.msg = "Suppression de Publicite ID : " + pub.id;
    await db.Log.create(params);
}

// helper functions

async function getPub(id) {
    const pub = await db.Publicite.findByPk(id);
    if (!pub) throw 'Pas de Matiere';
    return pub;
}

async function getFichiers(id) {
    return await db.Fichier.findAll({ where: { pub: id } });
}


async function findPub(params) {
    if (params)
    {
        const pub = await db.Publicite.findAll({ where: { [Op.and] : [
           { titre_pub: {[Op.like]: params.titre_pub + '%'} },
        ]}});
        if (!pub) {throw 'Vide' }
        else return await pub;
    } else 
    { throw 'Vide' ;}
}

function omitHash(pub) {
    const { hash, ...pubWithoutHash } = pub;
    return pubWithoutHash;
}