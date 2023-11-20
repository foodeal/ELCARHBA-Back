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
    findStock,
    delete: _delete
};


async function getAll() {
    return await db.Stock.findAll(); 
}

async function getById(id) {
    return await getStock(id);
}

async function create(params) {
    const am = await db.Stock.create(params.body);

    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "Stock";
    params.msg = "Ajout de Stock ID : " + am.id;
    await db.Log.create(params);

    return await omitHash(am.get());
}

async function update(id, params) {
    const stock = await getStock(id);

    // copy params to am and save
    Object.assign(stock, params.body);
    await stock.save();

    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "Stock";
    params.msg = "Update de Stock ID : " + stock.id;
    await db.Log.create(params);

    return await omitHash(stock.get());
}

async function _delete(params) {
    const stock = await getStock(params.params.id);
    await stock.destroy();

    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "Stock";
    params.msg = "Suppression de Stock ID : " + stock.id;
    await db.Log.create(params);
}

// helper functions

async function getStock(id) {
    const stock = await db.Stock.findByPk(id);
    if (!stock) throw 'Pas de Stock';
    return stock;
}

async function getFichiers(id) {
    return await db.Fichier.findAll({ where: { stock: id } });
}


async function findStock(params) {
    if (params)
    {
        const stock = await db.Stock.findAll({ where: { [Op.and] : [
           { date_debut: {[Op.like]: params.date_debut + '%'} },
           { date_fin: {[Op.like]: params.date_fin + '%'} }
        ]}});
        if (!stock) {throw 'Vide' }
        else return await stock;
    } else 
    { throw 'Vide' ;}
}

function omitHash(stock) {
    const { hash, ...stockWithoutHash } = stock;
    return stockWithoutHash;
}