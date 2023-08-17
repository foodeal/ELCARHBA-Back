const db = require('./../helpers/db');
const fs = require('fs');


module.exports = {
    getAll,
    getById,
    create,
    update,
    base64_encode,
    delete: _delete
};


async function getAll() {
    return await db.Fichier.findAll();
}

async function getById(id) {
    return await GetFile(id);
}

async function create(params) {
    await db.Fichier.create(params);
}

async function update(id, params) {
    const f = await GetFile(id);

    // copy params to i and save
    Object.assign(f, params);
    await f.save();

    return omitHash(f.get());
}

async function _delete(id) {
    const f = await GetFile(id);
    await f.destroy();
}

// helper functions

async function GetFile(id) {
    const f = await db.Fichier.findByPk(id);
    if (!f) throw 'Pas dFichiers';
    return f;
}

async function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer.from(bitmap).toString('base64');
}
  

function omitHash(f) {
    const { hash, ...ficheWithoutHash } = f;
    return ficheWithoutHash;
}