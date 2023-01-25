const jwt = require('jsonwebtoken');
const db = require('../../helpers/db');
const Sequelize = require("sequelize");
const Op = Sequelize.Op;


module.exports = {
    getAll,
    getById,
    create,
    update,
    findFavori,
    delete: _delete
};


async function getAll() {
    return await db.User_Favori.findAll(); 
}

async function getById(id) {
    return await getFavori(id);
}

async function create(params) {
    const favori = await db.User_Favori.create(params.body);

    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "favori";
    params.msg = "Ajout de favori ID : " + favori.id;
    await db.Log.create(params);

    return await omitHash(favori.get());
}

async function update(id, params) {
    const favori = await getFavori(id);

    // copy params to am and save
    Object.assign(favori, params.body);
    await favori.save();

    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "favori";
    params.msg = "Update de favori ID : " + favori.id;
    await db.Log.create(params);

    return await omitHash(favori.get());
}

async function _delete(params) {
    const favori = await getFavori(params.params.id);
    await favori.destroy();

    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "favori";
    params.msg = "Suppression de favori ID : " + favori.id;
    await db.Log.create(params);
}

// helper functions

async function getFavori(id) {
    const favori = await db.User_Favori.findByPk(id);
    if (!favori) throw 'Pas de favori';
    return favori;
}


async function findFavori(params) {
    if (params)
    {
        const favori = await db.User_Favori.findAll({ where: { [Op.and] : [
           { titre_favori: {[Op.like]: params.date_debut + '%'} }
        ]}});
        if (!favori) {throw 'Vide' }
        else return await favori;
    } else 
    { throw 'Vide' ;}
}

function omitHash(favori) {
    const { hash, ...favoriWithoutHash } = favori;
    return favoriWithoutHash;
}