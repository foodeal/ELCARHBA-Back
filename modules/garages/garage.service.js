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
    findGarage,
    delete: _delete
};


async function getAll() {
    return await db.Garage.findAll(); 
}

async function getById(id) {
    return await getGarage(id);
}

async function create(params) {
    const am = await db.Garage.create(params.body);

    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "Offre";
    params.msg = "Ajout de garage ID : " + am.id;
    await db.Log.create(params);

    return await omitHash(am.get());
}

async function update(id, params) {
    const garage = await getGarage(id);

    // copy params to am and save
    Object.assign(garage, params.body);
    await garage.save();

    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "garage";
    params.msg = "Update de garage ID : " + garage.id;
    await db.Log.create(params);

    return await omitHash(garage.get());
}

async function _delete(params) {
    const garage = await getGarage(params.params.id);
    await garage.destroy();

    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "garage";
    params.msg = "Suppression de garage ID : " + garage.id;
    await db.Log.create(params);
}

// helper functions

async function getGarage(id) {
    const garage = await db.Garage.findByPk(id);
    if (!garage) throw 'Pas de Matiere';
    return garage;
}

async function getFichiers(id) {
    return await db.Fichier.findAll({ where: { garage: id } });
}


async function findGarage(params) {
    if (params)
    {
        const garage = await db.Garage.findAll({ where: { [Op.and] : [
           { date_debut: {[Op.like]: params.date_debut + '%'} },
           { date_fin: {[Op.like]: params.date_fin + '%'} }
        ]}});
        if (!garage) {throw 'Vide' }
        else return await garage;
    } else 
    { throw 'Vide' ;}
}

function omitHash(garage) {
    const { hash, ...garageWithoutHash } = garage;
    return garageWithoutHash;
}