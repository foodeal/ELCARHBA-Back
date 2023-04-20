const db = require('./../helpers/db');
const fs = require('fs');

module.exports = {
    getAll,
    getById,
    create,
    update,
    delete: _delete
};


async function getAll() {
    return await db.Log.findAll();
}

async function getById(id) {
    return await getL(id);
}

async function create(params) {
    const l = await db.Log.create(params);
    const content = "Log : " + params.date + " " + params.user;
    console.log(content);
    fs.appendFile('/logs/logs/logs.txt', content, (err) => {
        if (err) {
            console.error(err)
        }
        else {
            throw "Done"
        }
    });
    return await omitHash(l.get());
}

async function update(id, params) {
    const l = await getL(id);

    // copy params to am and save
    Object.assign(l, params);
    await l.save();

    return await omitHash(l.get());
}

async function _delete(id) {
    const l = await getL(id);
    await l.destroy();
}

// helper functions

async function getL(id) {
    const l = await db.Log.findByPk(id);
    if (!l) throw 'Pas de Matiere';
    return l;
}
  

function omitHash(l) {
    const { hash, ...lWithoutHash } = l;
    return lWithoutHash;
}