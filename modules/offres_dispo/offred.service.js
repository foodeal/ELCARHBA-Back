const jwt = require('jsonwebtoken');
const db = require('../../helpers/db');
var Sequelize = require("sequelize");
const Op = Sequelize.Op;
// AWS
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
    region: 'de',
    accessKeyId: 'f6920d3469784ad8af3f72472d89ae56',
    secretAccessKey: '645c52c0f42f4de5bb3599eea1fb14da',
    endpoint: "https://s3.de.io.cloud.ovh.net/"
  });

module.exports = {
    getAll,
    getById,
    create,
    update,
    getFichiers,
    findOffre,
    getAvant,
    getExpired,
    getFile,
    getSort,
    getBest,
    getFilter,
    getPrestataire,
    getPaginationPrestataire,
    getAllOffres,
    delete: _delete
};

async function getAllOffres() {
    offres = await db.Offre_Dispo.findAll({ 
        order: [['date_debut', 'DESC']]
    }); 
    var ofs = JSON.parse(JSON.stringify(offres));
    var res = [];
    if (ofs.length) {
    for (let i=0; i < ofs.length; i++) {
        if (ofs[i].offre_valid) {
        const ofsf = await getData(ofs[i]);
        res = res.concat(ofsf);
        }
    }
    return res; 
    }
}

async function getFile(title) {
    console.log(title);
    try {
        const params = {
          Bucket: "elcarhba",
          Key: 'Orange_sport_car.png'
        };
        // Download the image from S3
        const { Body } = await s3.getObject(params).promise();
        // Convert the image body to a Buffer
        const imageBuffer = Buffer.from(Body);
        return imageBuffer;
      } catch (error) {
        console.error('Error fetching image from S3:', error);
        throw error;
      }
}

async function getAll() {
    offres = await db.Offre_Dispo.findAll({ 
        where : { offre_expired: false}, 
        raw: true,
        order: [['date_debut', 'DESC']]
    }); 
    var ofs = JSON.parse(JSON.stringify(offres));
    var res = [];
    if (ofs.length) {
    for (let i=0; i < ofs.length; i++) {
        if (ofs[i].offre_valid) {
        const ofsf = await getData(ofs[i]);
        res = res.concat(ofsf);
        }
    }
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
            if (ofs[i].offre_valid) {
                const ofsf = await getData(ofs[i]);
                res = res.concat(ofsf);
            }
        }
    }
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
            if (ofs[i].offre_valid) {
                const ofsf = await getData(ofs[i]);
                res = res.concat(ofsf);
            }
        }
    }
    return res; 
    }
}

async function getAvant() {
    var today = (new Date(new Date().getTime())).toISOString();
    var nextday = (new Date(new Date().getTime()+(3*24*60*60*1000))).toISOString();

    offres = await db.Offre_Dispo.findAll({ where: { [Op.and] : [
        { date_fin: {[Op.gt]: today } },
        { date_fin: {[Op.lt]: nextday } },
        { offre_expired: false }
    ]}});

    var ofs = JSON.parse(JSON.stringify(offres));
    var res = [];
    if (ofs.length) {
    for (let i=0; i < ofs.length; i++) {
        if (ofs[i].offre_valid) {
        const ofsf = await getData(ofs[i]);
        res = res.concat(ofsf);
        }
    }
    return res; 
    }
}

async function getExpired() {
    const offres = await db.Offre_Dispo.findAll({ where: { offre_expired: true }, order: [['date_debut', 'DESC']] }); 
    var ofs = JSON.parse(JSON.stringify(offres));
    var res = [];
    if (ofs.length) {
    for (let i=0; i < ofs.length; i++) {
        if (ofs[i].offre_valid) {
        const ofsf = await getData(ofs[i]);
        res = res.concat(ofsf);
        }
    }
    }
    return res; 
}

async function getSort(params) {
    if (params.type == "Date")
    {
        var offres = await db.Offre_Dispo.findAll({ where : { offre_expired: false}, raw:true, order: [['date_debut', 'DESC']] });  
        var ofs = JSON.parse(JSON.stringify(offres));
        var res = [];
        if (ofs.length) {
        for (let i=0; i < ofs.length; i++) {
            if (ofs[i].offre_valid) {
            const ofsf = await getData(ofs[i]);
            res = res.concat(ofsf);
            }
        }
        return res; 
        }
    } else if (params.type == "Prix") {
         var offre = await db.Offre.findAll({ order: [['prix_remise', 'DESC']] });
         if (offre) {
         var ofsf = JSON.parse(JSON.stringify(offre));
         var res = [];
         if (ofsf.length) {
         for (let j=0; j < ofsf.length; j++) {
             const offres = await db.Offre_Dispo.findAll({ where: { where : { offre_expired: false}, raw:true, offre_id: ofsf[j].id, offre_expired:false }, raw: true });
             var ofs = JSON.parse(JSON.stringify(offres));
             if (ofs.length) {
             for (let i=0; i < ofs.length; i++) {
                if (ofs[i].offre_valid) {
                 const ofsf = await getData(ofs[i]);
                 res = res.concat(ofsf);
                } 
             }            
         }}   
         }} 
        return res; 
    } else {
        var offres = await db.Offre_Dispo.findAll({ where : { offre_expired: false}, raw:true, order: [['date_debut', 'DESC']] });  
        var ofs = JSON.parse(JSON.stringify(offres));
        var res = [];
        if (ofs.length) {
        for (let i=0; i < ofs.length; i++) {
            if (ofs[i].offre_valid) {
            const ofsf = await getData(ofs[i]);
            res = res.concat(ofsf);
            }
        }
        return res; 
        }
    }
}

async function getBest() {
    const offres = await db.Offre_Dispo.findAll({ where : { offre_expired: false}, raw:true, order: [['nombre_offres', 'DESC']], limit: 6 }); 
    var ofs = JSON.parse(JSON.stringify(offres));
    var res = [];
    if (ofs.length) {
    for (let i=0; i < ofs.length; i++) {
        if (ofs[i].offre_valid) {
        const ofsf = await getData(ofs[i]);
        res = res.concat(ofsf);
        }
    }
    return res; 
    }
}


async function getData(off) {
    const offre = await db.Offre.findOne({ where: { id: off.offre_id }, raw: true });
    const stock = await db.Stock.findOne({ where: { offre_dispo_id: off.id }, raw: true });
    const file = await db.Fichier.findAll({ where: { name: offre.titre_offre }, raw: true });
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
    if (stock) { off.nombre_offres = stock.quantite_stock; }
    if (file) {
    //   const files = await getFile(offre.titre_offre);
      var b = {
        'offre': offre,
        'files': "files",
        'garage': garage,
        'prestataire': prestataire,
        'stock': stock,
        'avis_count': avis_count,
        'avis_sum': avis_sum
    }
    } else {
        var b = {
            'offre': offre,
            'garage': garage,
            'prestataire': prestataire,
            'stock': stock,
            'avis_count': avis_count,
            'avis_sum': avis_sum
        }
    }
    off = Object.assign(off, b);
    return (off)
}


async function getById(id) {
    var dispo = await db.Offre_Dispo.findOne({ where: { id: id }, raw: true });
    const offre = await db.Offre.findOne({ where: { id: dispo.offre_id }, raw: true });
    const file = await db.Fichier.findAll({ where: { offre: dispo.offre_id }, raw: true });
    const garage = await db.Garage.findOne({ where: { prestataire_id: offre.prestataire_id }, raw: true });
    const stock = await db.Stock.findOne({ where: { offre_dispo_id: dispo.id }, raw: true });
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
    if (stock) { dispo.nombre_offres = stock.quantite_stock; }
    if (file) {
        var b = {
          'offre': offre,
          'files': "files",
          'garage': garage,
          'prestataire': prestataire,
          'stock': stock,
          'avis_count': avis_count,
          'avis_sum': avis_sum
      }
      } else {
          var b = {
              'offre': offre,
              'garage': garage,
              'prestataire': prestataire,
              'stock': stock,
              'avis_count': avis_count,
              'avis_sum': avis_sum
          }
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
    const stock = await db.Stock.findOne({ where: { offre_dispo_id: offre.id }, raw: true });
    const stockdel = await db.Stock.findByPk(stock.id)
    await stockdel.destroy();
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
                if (ofs[i].offre_valid) {
                const ofsf = await getData(ofs[i]);
                res = res.concat(ofsf);
                }
            }            
        }}   
        }}
    } 
    else if (params.marque_offre) 
    {
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
                if (ofs[i].offre_valid) {
                const ofsf = await getData(ofs[i]);
                res = res.concat(ofsf);
                }
            }            
        }}   
        }}
    } else if (params.modele_offre) 
    {
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
                if (ofs[i].offre_valid) {
                const ofsf = await getData(ofs[i]);
                res = res.concat(ofsf);
                }
            }            
        }}   
        }}
    } else  if (params.motorisation_offre) 
    {
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
                if (ofs[i].offre_valid) {
                const ofsf = await getData(ofs[i]);
                res = res.concat(ofsf);
                }
            }            
        }}   
        }}
    } 
    else
    {
        offres = await db.Offre_Dispo.findAll({ order: [['date_debut', 'DESC']] }); 
        var ofs = JSON.parse(JSON.stringify(offres));
        var res = [];
        if (ofs.length) {
        for (let i=0; i < ofs.length; i++) {
            if (ofs[i].offre_valid) {
            const ofsf = await getData(ofs[i]);
            res = res.concat(ofsf);
            }
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
                if (ofs[i].offre_valid) {
                const ofsf = await getData(ofs[i]);
                res = res.concat(ofsf);
                }
            }            
        }}   
        }}
        }  
        if (params.motorisation) {
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
                    if (ofs[i].offre_valid) {
                    const ofsf = await getData(ofs[i]);
                    res = res.concat(ofsf);
                    }
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