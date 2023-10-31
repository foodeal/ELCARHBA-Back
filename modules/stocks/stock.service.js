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
    findProduit,
    delete: _delete
};


async function getAll() {
    return await db.Produit.findAll(); 
}

async function getById(id) {
    return await getProduit(id);
}

async function create(params) {
    const am = await db.Produit.create(params.body);

    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "Produit";
    params.msg = "Ajout de Produit ID : " + am.id;
    await db.Log.create(params);

    return await omitHash(am.get());
}

async function update(id, params) {
    const produit = await getProduit(id);

    // copy params to am and save
    Object.assign(produit, params.body);
    await produit.save();

    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "Produit";
    params.msg = "Update de Produit ID : " + produit.id;
    await db.Log.create(params);

    return await omitHash(produit.get());
}

async function _delete(params) {
    const produit = await getProduit(params.params.id);
    await produit.destroy();

    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "Produit";
    params.msg = "Suppression de Produit ID : " + produit.id;
    await db.Log.create(params);
}

// helper functions

async function getProduit(id) {
    const produit = await db.Produit.findByPk(id);
    if (!produit) throw 'Pas de Matiere';
    return produit;
}

async function getFichiers(id) {
    return await db.Fichier.findAll({ where: { produit: id } });
}


async function findProduit(params) {
    if (params)
    {
        const produit = await db.Produit.findAll({ where: { [Op.and] : [
           { date_debut: {[Op.like]: params.date_debut + '%'} },
           { date_fin: {[Op.like]: params.date_fin + '%'} }
        ]}});
        if (!produit) {throw 'Vide' }
        else return await produit;
    } else 
    { throw 'Vide' ;}
}

function omitHash(produit) {
    const { hash, ...produitWithoutHash } = produit;
    return produitWithoutHash;
}