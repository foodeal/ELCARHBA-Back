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
    findService,
    delete: _delete
};


async function getAll() {
    return await db.Service.findAll(); 
}

async function getById(id) {
    return await getService(id);
}

async function create(params) {
    const am = await db.Service.create(params.body);

    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "Service";
    params.msg = "Ajout de Service ID : " + am.id;
    await db.Log.create(params);

    return await omitHash(am.get());
}

async function update(id, params) {
    const service = await getService(id);

    // copy params to am and save
    Object.assign(service, params.body);
    await service.save();

    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "Service";
    params.msg = "Update de Service ID : " + service.id;
    await db.Log.create(params);

    return await omitHash(service.get());
}

async function _delete(params) {
    const service = await getService(params.params.id);
    await service.destroy();

    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "Service";
    params.msg = "Suppression de Service ID : " + service.id;
    await db.Log.create(params);
}

// helper functions

async function getService(id) {
    const service = await db.Service.findByPk(id);
    if (!service) throw 'Pas de Matiere';
    return service;
}

async function getFichiers(id) {
    return await db.Fichier.findAll({ where: { service: id } });
}


async function findService(params) {
    if (params)
    {
        const service = await db.Service.findAll({ where: { [Op.and] : [
           { date_debut: {[Op.like]: params.date_debut + '%'} },
           { date_fin: {[Op.like]: params.date_fin + '%'} }
        ]}});
        if (!service) {throw 'Vide' }
        else return await service;
    } else 
    { throw 'Vide' ;}
}

function omitHash(service) {
    const { hash, ...serviceWithoutHash } = service;
    return serviceWithoutHash;
}