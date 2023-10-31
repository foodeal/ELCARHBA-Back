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
    isFavori,
    getByUser,
    delete: _delete
};


async function getAll() {
    const fav = await db.User_Favori.findAll(); 
    if (fav) {
        return fav
    } else {
        return [];
    }
}

async function getById(id) {
    return await getFavori(id);
}

async function isFavori(user, offre) {
    const favori = await await db.User_Favori.findOne({ where: { [Op.and] : [
        { user_id: user },
        { offre_id: offre }
     ]}});
    if (favori) {
        return true;
    }
    else {
        return false;
    }
}

async function create(params) {
    console.log(params.body);
    const favoriDispo = await db.User_Favori.findOne({ where: { [Op.and] : [
        { user_id: params.body.user_id },
        { offre_id: params.body.offre_id }
     ]}});
    console.log(favoriDispo);
    if (favoriDispo) {
        throw "exist deja";
    }
    else {
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
    return getData(favori);
}

async function getData(fav) {
    const offre = await db.Offre.findOne({ where: { id: fav.offre_id }, raw: true });
    const user = await db.User.findOne({ where: { id: fav.user_id }, raw: true });
    const file = await db.Fichier.findAll({ where: { offre: await offre.id }, raw: true });
    const garage = await db.Garage.findOne({ where: { prestataire_id: await offre.prestataire_id }, raw: true });
    const prestataire = await db.Prestataire.findOne({ where: { id: await offre.prestataire_id }, raw: true });
    let b = {
        'user': user,
        'offre': offre,
        'files': file,
        'garage': garage,
        'prestataire': prestataire
    }
    fav = Object.assign(fav, b);
    return (fav)
}

async function getByUser(id) {
    const favori = await db.User_Favori.findAll({ where:  {user_id: id}});
    if (!favori) {
        return [];
    }
    else {
        var ofs = JSON.parse(JSON.stringify(favori));
        var res = [];
        if (ofs.length) {
        for (let i=0; i < ofs.length; i++) {
            const ofsf = await getData(ofs[i]);
            res = res.concat(ofsf);
        }
        console.log(res);
        return res; 
        }
    }
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