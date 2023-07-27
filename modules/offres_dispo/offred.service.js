﻿const jwt = require('jsonwebtoken');
const db = require('../../helpers/db');
var Sequelize = require("sequelize");
const Op = Sequelize.Op;


module.exports = {
    getAll,
    getById,
    create,
    update,
    getFichiers,
    findOffre,
    getAvant,
    getExpired,
    getSort,
    getBest,
    getFilter,
    getPrestataire,
    getPaginationPrestataire,
    delete: _delete
};


async function getAll() {
    offres = await db.Offre_Dispo.findAll({ 
        where : { offre_expired: null}, 
        raw: true,
        order: [['date_debut', 'DESC']]
    }); 
    var ofs = JSON.parse(JSON.stringify(offres));
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

async function getPaginationPrestataire(id) {
    offres = await db.Offre_Dispo.findAll({ order: [['date_debut', 'DESC']] }); 
    var ofs = JSON.parse(JSON.stringify(offres));
    var res = [];
    if (ofs.length) {
    for (let i=0; i < ofs.length; i++) {
        const offre = await db.Offre.findOne({ where: { id: ofs[i].offre_id }, raw: true });
        if (offre.prestataire_id == id)
        {
        const ofsf = await getData(ofs[i]);
        res = res.concat(ofsf);
        }
    }
    console.log(res);
    return res; 
    }
}

async function getPrestataire(id) {
    offres = await db.Offre_Dispo.findAll({ order: [['date_debut', 'DESC']] }); 
    var ofs = JSON.parse(JSON.stringify(offres));
    var res = [];
    if (ofs.length) {
    for (let i=0; i < ofs.length; i++) {
        const offre = await db.Offre.findOne({ where: { id: ofs[i].offre_id }, raw: true });
        if (offre.prestataire_id == id)
        {
        const ofsf = await getData(ofs[i]);
        res = res.concat(ofsf);
        }
    }
    console.log(res);
    return res; 
    }
}

// async function getAll() {
//     offres = await db.Offre_Dispo.findAll({ order: [['date_debut', 'DESC']] }); 
//     var ofs = JSON.parse(JSON.stringify(offres));
//     var res = [];
//     if (ofs.length) {
//     for (let i=0; i < ofs.length; i++) {
//         const ofsf = await getData(ofs[i]);
//         res = res.concat(ofsf);
//     }
//     console.log(res);
//     return res; 
//     }
// }

async function getAvant() {
    var today = (new Date(new Date().getTime())).toISOString();
    var nextday = (new Date(new Date().getTime()+(3*24*60*60*1000))).toISOString();
    console.log(today);

    offres = await db.Offre_Dispo.findAll({ where: { [Op.and] : [
        { date_fin: {[Op.gt]: today } },
        { date_fin: {[Op.lt]: nextday } }
    ]}});

    var ofs = JSON.parse(JSON.stringify(offres));
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

async function getExpired() {
    const offres = await db.Offre_Dispo.findAll({ where: { offre_expired: true }, order: [['date_debut', 'DESC']] }); 
    var ofs = JSON.parse(JSON.stringify(offres));
    var res = [];
    if (ofs.length) {
    for (let i=0; i < ofs.length; i++) {
        const ofsf = await getData(ofs[i]);
        res = res.concat(ofsf);
    }
    }
    return res; 
}

async function getSort(params) {
    if (params.type == "Date")
    {
        console.log("date")
        var offres = await db.Offre_Dispo.findAll({ order: [['date_debut', 'DESC']] });  
        var ofs = JSON.parse(JSON.stringify(offres));
        var res = [];
        if (ofs.length) {
        for (let i=0; i < ofs.length; i++) {
            const ofsf = await getData(ofs[i]);
            res = res.concat(ofsf);
        }
        return res; 
        }
    } else if (params.type == "Prix") {
         console.log("prix")
         var offre = await db.Offre.findAll({ order: [['prix_remise', 'DESC']] });
         if (offre) {
         var ofsf = JSON.parse(JSON.stringify(offre));
         var res = [];
         if (ofsf.length) {
         for (let j=0; j < ofsf.length; j++) {
             const offres = await db.Offre_Dispo.findAll({ where: { offre_id: ofsf[j].id }, raw: true });
             var ofs = JSON.parse(JSON.stringify(offres));
             if (ofs.length) {
             for (let i=0; i < ofs.length; i++) {
                 const ofsf = await getData(ofs[i]);
                 res = res.concat(ofsf);
             }            
         }}   
         }} 
        return res; 
    } else {
        console.log("all")
        var offres = await db.Offre_Dispo.findAll({ order: [['date_debut', 'DESC']] });  
        var ofs = JSON.parse(JSON.stringify(offres));
        var res = [];
        if (ofs.length) {
        for (let i=0; i < ofs.length; i++) {
            const ofsf = await getData(ofs[i]);
            res = res.concat(ofsf);
        }
        return res; 
        }
    }
}

async function getBest() {
    const offres = await db.Offre_Dispo.findAll({ order: [['nombre_offres', 'DESC']], limit: 5 }); 
    var ofs = JSON.parse(JSON.stringify(offres));
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


async function getData(off) {
    const offre = await db.Offre.findOne({ where: { id: off.offre_id }, raw: true });
    const file = await db.Fichier.findAll({ where: { offre: offre.id }, raw: true });
    const garage = await db.Garage.findOne({ where: { prestataire_id: offre.prestataire_id }, raw: true });
        const avis_count = await db.Avis.findOne({ 
        where: { garage_id: await garage.id }, 
        attributes: ['id', [Sequelize.fn('count', Sequelize.col('id')), 'count']],
        raw: true 
    });
    const avis_sum = await db.Avis.findOne({ 
        where: { garage_id: await garage.id }, 
        attributes: ['id', [Sequelize.fn('sum', Sequelize.col('id')), 'sum']],
        raw: true 
    });
    const prestataire = await db.Prestataire.findOne({ where: { id: offre.prestataire_id }, raw: true });
    let b = {
        'offre': offre,
        'files': file,
        'garage': garage,
        'prestataire': prestataire,
        'avis_count': avis_count,
        'avis_sum': avis_sum
    }
    off = Object.assign(off, b);
    return (off)
}


async function getById(id) {
    var dispo = await db.Offre_Dispo.findOne({ where: { id: id }, raw: true });
    console.log(dispo);
    const offre = await db.Offre.findOne({ where: { id: dispo.offre_id }, raw: true });
    const file = await db.Fichier.findAll({ where: { offre: dispo.offre_id }, raw: true });
    const garage = await db.Garage.findOne({ where: { prestataire_id: offre.prestataire_id }, raw: true });
    const avis_count = await db.Avis.findOne({ 
        where: { garage_id: await garage.id }, 
        attributes: ['id', [Sequelize.fn('count', Sequelize.col('id')), 'count']],
        raw: true 
    });
    const avis_sum = await db.Avis.findOne({ 
        where: { garage_id: await garage.id }, 
        attributes: ['id', [Sequelize.fn('sum', Sequelize.col('id')), 'sum']],
        raw: true 
    });
    const prestataire = await db.Prestataire.findOne({ where: { id: offre.prestataire_id }, raw: true });
    let b = {
        'offre': offre,
        'files': file,
        'garage': garage,
        'prestataire': prestataire,
        'avis_count': avis_count,
        'avis_sum': avis_sum
    }
    dispo = Object.assign(dispo, b);
    return (dispo);
}

async function create(params) {
    const am = await db.Offre_Dispo.create(params.body);

    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "Offre";
    params.msg = "Ajout de OffreD ID : " + am.id;
    await db.Log.create(params);

    return await omitHash(am.get());
}

async function update(id, params) {
    const offre = await getOffre(id);

    // copy params to am and save
    Object.assign(offre, params.body);
    await offre.save();

    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "Offre";
    params.msg = "Update de OffreD ID : " + offre.id;
    await db.Log.create(params);

    return await omitHash(offre.get());
}

async function _delete(params) {
    const offre = await getOffre(params.params.id);
    await offre.destroy();

    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "Offre";
    params.msg = "Suppression de OffreD ID : " + offre.id;
    await db.Log.create(params);
}

// helper functions

async function getOffre(id) {
    const offre = await db.Offre_Dispo.findByPk(id);
    if (!offre) throw 'Pas de Matiere';
    return offre;
}

async function getFichiers(id) {
    return await db.Fichier.findAll({ where: { offre: id } });
}


async function findOffre(params) {

    if (params.titre_offre) 
    {
        console.log(params);
        const offre = await db.Offre.findAll({ where: { [Op.and] : [
           { titre_offre: {[Op.like]: params.titre_offre + '%'} },
        ]}});
        if (offre) {
        var ofsf = JSON.parse(JSON.stringify(offre));
        var res = [];
        if (ofsf.length) {
        for (let j=0; j < ofsf.length; j++) {
            const offres = await db.Offre_Dispo.findAll({ where: { offre_id: ofsf[j].id }, raw: true });
            var ofs = JSON.parse(JSON.stringify(offres));
            console.log(ofs.length)
            if (ofs.length) {
            for (let i=0; i < ofs.length; i++) {
                const ofsf = await getData(ofs[i]);
                console.log("res : " + res);
                res = res.concat(ofsf);
            }            
        }}   
        }}
    } 
    else if (params.marque_offre) 
    {
        console.log(params);
        const offre = await db.Offre.findAll({ where: { 
           marque: params.marque_offre
        }});
        if (offre) {
        var ofsf = JSON.parse(JSON.stringify(offre));
        var res = [];
        if (ofsf.length) {
        for (let j=0; j < ofsf.length; j++) {
            const offres = await db.Offre_Dispo.findAll({ where: { offre_id: ofsf[j].id }, raw: true });
            var ofs = JSON.parse(JSON.stringify(offres));
            console.log(ofs.length)
            if (ofs.length) {
            for (let i=0; i < ofs.length; i++) {
                const ofsf = await getData(ofs[i]);
                console.log("res : " + res);
                res = res.concat(ofsf);
            }            
        }}   
        }}
    } else if (params.modele_offre) 
    {
        console.log(params);
        const offre = await db.Offre.findAll({ where: { [Op.and] : [
           { modele: {[Op.like]: params.modele_offre + '%'} },
        ]}});
        if (offre) {
        var ofsf = JSON.parse(JSON.stringify(offre));
        var res = [];
        if (ofsf.length) {
        for (let j=0; j < ofsf.length; j++) {
            const offres = await db.Offre_Dispo.findAll({ where: { offre_id: ofsf[j].id }, raw: true });
            var ofs = JSON.parse(JSON.stringify(offres));
            console.log(ofs.length)
            if (ofs.length) {
            for (let i=0; i < ofs.length; i++) {
                const ofsf = await getData(ofs[i]);
                console.log("res : " + res);
                res = res.concat(ofsf);
            }            
        }}   
        }}
    } else  if (params.motorisation_offre) 
    {
        console.log(params);
        const offre = await db.Offre.findAll({ where: { [Op.and] : [
           { motorisation: {[Op.like]: params.motorisation_offre + '%'} },
        ]}});
        if (offre) {
        var ofsf = JSON.parse(JSON.stringify(offre));
        var res = [];
        if (ofsf.length) {
        for (let j=0; j < ofsf.length; j++) {
            const offres = await db.Offre_Dispo.findAll({ where: { offre_id: ofsf[j].id }, raw: true });
            var ofs = JSON.parse(JSON.stringify(offres));
            console.log(ofs.length)
            if (ofs.length) {
            for (let i=0; i < ofs.length; i++) {
                const ofsf = await getData(ofs[i]);
                console.log("res : " + res);
                res = res.concat(ofsf);
            }            
        }}   
        }}
    } 
    else
    {
        console.log(params);
        offres = await db.Offre_Dispo.findAll({ order: [['date_debut', 'DESC']] }); 
        var ofs = JSON.parse(JSON.stringify(offres));
        var res = [];
        if (ofs.length) {
        for (let i=0; i < ofs.length; i++) {
            const ofsf = await getData(ofs[i]);
            res = res.concat(ofsf);
        }
        }
    }
        return res;
}


async function getFilter(params) {
    var allOffres = await db.Offre_Dispo.findAll();
    if (params)
    {
        if (params.categorie) {
        console.log(params);
        const offre = await db.Offre.findAll({ where: { [Op.or] : [
           { categorie: {[Op.or]: params.categorie } },
        ]}});
        if (offre) {
        var ofsf = JSON.parse(JSON.stringify(offre));
        var res = [];
        if (ofsf.length) {
        for (let j=0; j < ofsf.length; j++) {
            const offres = await db.Offre_Dispo.findAll({ where: { offre_id: ofsf[j].id }, raw: true });
            var ofs = JSON.parse(JSON.stringify(offres));
            console.log(ofs.length)
            if (ofs.length) {
            for (let i=0; i < ofs.length; i++) {
                const ofsf = await getData(ofs[i]);
                console.log("res : " + res);
                res = res.concat(ofsf);
            }            
        }}   
        }}
        }  
        if (params.motorisation) {
            console.log(params);
            const offre = await db.Offre.findAll({ where: { [Op.or] : [
               { motorisation: {[Op.like]: params.motorisation + '%'} },
            ]}});
            if (offre) {
            var ofsf = JSON.parse(JSON.stringify(offre));
            var res = [];
            if (ofsf.length) {
            for (let j=0; j < ofsf.length; j++) {
                const offres = await db.Offre_Dispo.findAll({ where: { offre_id: ofsf[j].id }, raw: true });
                var ofs = JSON.parse(JSON.stringify(offres));
                console.log(ofs.length)
                if (ofs.length) {
                for (let i=0; i < ofs.length; i++) {
                    const ofsf = await getData(ofs[i]);
                    console.log("res : " + res);
                    res = res.concat(ofsf);
                }            
            }}   
            }}
        }  
        if (!res) 
        {throw 'Vide' }
        else return await res;
    } else 
    { return allOffres;}
}


function omitHash(offre) {
    const { hash, ...offreWithoutHash } = offre;
    return offreWithoutHash;
}

// Schedule 
const schedule = require('node-schedule');

var d = (new Date(new Date().getTime())).toISOString();
const job = schedule.scheduleJob('1 0 * * *', async function(){
    offres = await db.Offre_Dispo.findAll({ where: { [Op.and] : [
        { date_fin: {[Op.lt]: d } },
        { offre_expired : false}
    ]}});
    var ofs = JSON.parse(JSON.stringify(offres));
    var res = [];
    if (ofs.length) {
    for (let i=0; i < ofs.length; i++) {
        console.log(ofs[i]);
        ofs[i].offre_expired = true;
        console.log(ofs[i]);
        const offre = await getOffre(ofs[i].id);
        Object.assign(offre, ofs[i]);
        await offre.save();
    }
    }
});