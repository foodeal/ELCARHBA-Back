const jwt = require('jsonwebtoken');
const db = require('../../helpers/db');
const Sequelize = require("sequelize");
const Op = Sequelize.Op;


module.exports = {
    getAll,
    getById,
    create,
    update,
    findExpert,
    delete: _delete
};


async function getAll() {
    return await db.Expert.findAll(); 
}

async function getById(id) {
    return await getExpert(id);
}

async function create(params) {
    const expert = await db.Expert.create(params.body);

    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "Expert";
    params.msg = "Ajout de Expert ID : " + am.id;
    await db.Log.create(params);

    return await omitHash(expert.get());
}

async function update(id, params) {
    const expert = await getExpert(id);

    // copy params to am and save
    Object.assign(expert, params.body);
    await expert.save();

    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "Expert";
    params.msg = "Update de Expert ID : " + expert.id;
    await db.Log.create(params);

    return await omitHash(expert.get());
}

async function _delete(params) {
    const expert = await getExpert(params.params.id);
    await expert.destroy();

    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "Expert";
    params.msg = "Suppression de Expert ID : " + expert.id;
    await db.Log.create(params);
}

// helper functions

async function getExpert(id) {
    const expert = await db.Expert.findByPk(id);
    if (!expert) throw 'Pas de Matiere';
    return expert;
}

async function findExpert(params) {
    if (params)
    {
        const expert = await db.Expert.findAll({ where: { [Op.and] : [
           { date_debut: {[Op.like]: params.date_debut + '%'} },
           { date_fin: {[Op.like]: params.date_fin + '%'} }
        ]}});
        if (!expert) {throw 'Vide' }
        else return await expert;
    } else 
    { throw 'Vide' ;}
}

function omitHash(expert) {
    const { hash, ...expertWithoutHash } = expert;
    return expertWithoutHash;
}