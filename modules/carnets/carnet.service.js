const jwt = require('jsonwebtoken');
const db = require('../../helpers/db');
const Sequelize = require("sequelize");
const Op = Sequelize.Op;


module.exports = {
    getAll,
    getById,
    create,
    update,
    findCarnet,
    getByUser,
    delete: _delete
};


async function getAll() {
    return await db.Carnet.findAll(); 
}

async function getById(id) {
    return await getCarnet(id);
}

async function getByUser(id) {
    const carnet = await db.Carnet.findOne({ where: { [Op.and] : [
        { user_id: {[Op.like]: id + '%'} }
     ]}});
    if (!carnet) throw 'Pas de carnet';
    return carnet;
}

async function create(params) {
    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    const carnetdispo = await db.Carnet.findOne({ where: { [Op.and] : [
        { user_id: {[Op.like]: decoded.sub + '%'} }
     ]}});
    
    if (carnetdispo) { 
        throw 'Utilisateur avec carnet';
    } else {
    const carnet = await db.Carnet.create(params.body);
    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "carnet";
    params.msg = "Ajout de carnet ID : " + carnet.id;
    await db.Log.create(params);
    return await omitHash(carnet.get());
    }
}

async function update(id, params) {
    const carnet = await getCarnet(id);

    // copy params to am and save
    Object.assign(carnet, params.body);
    await carnet.save();

    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "carnet";
    params.msg = "Update de carnet ID : " + carnet.id;
    await db.Log.create(params);

    return await omitHash(carnet.get());
}

async function _delete(params) {
    const carnet = await getCarnet(params.params.id);
    await carnet.destroy();

    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "carnet";
    params.msg = "Suppression de carnet ID : " + carnet.id;
    await db.Log.create(params);
}

// helper functions

async function getCarnet(id) {
    const carnet = await db.Carnet.findByPk(id);
    if (!carnet) throw 'Pas de carnet';
    return carnet;
}


async function findCarnet(params) {
    if (params)
    {
        const carnet = await db.Carnet.findAll({ where: { [Op.and] : [
           { titre_carnet: {[Op.like]: params.date_debut + '%'} }
        ]}});
        if (!carnet) {throw 'Vide' }
        else return await carnet;
    } else 
    { throw 'Vide' ;}
}

function omitHash(carnet) {
    const { hash, ...carnetWithoutHash } = carnet;
    return carnetWithoutHash;
}