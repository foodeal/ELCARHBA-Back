const config = require('../../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../../helpers/db');
var nodemailer = require('nodemailer');

module.exports = {
    getAll,
    getById,
    create,
    update,
    validatePrestataire,
    //updateMdp,
    getPrestataireByEmail,
    delete: _delete
};


async function getAll() {
    return await db.Prestataire_Dmd.findAll();
}

async function getById(id) {
    return await getPrestataire(id);
}

async function create(params) {
    // verif
    if (!params.lien_fb) {params.lien_fb = ''}
    if (!params.lien_insta) {params.lien_insta = ''}

    // validate
    if (await db.Prestataire_Dmd.findOne({ where: { email_prestataire: params.email_prestataire } })) {
        throw 'Email "' + params.email + '" existe déjà';
    }

    // save prestataire
    await db.Prestataire_Dmd.create(params);
}

async function update(id, params) {
    const prestataire = await getPrestataire(id);

    // validate
    const emailChanged = params.email_prestataire && prestataire.email_prestataire !== params.email_prestataire;
    if (emailChanged && await db.Prestataire_Dmd.findOne({ where: { email_prestataire: params.email_prestataire } })) {
        throw 'Email "' + params.email_prestataire + '" existe déjà';
    }

    // hash password if it was entered
    if (params.motdepasse) {
        params.motdepasse = await bcrypt.hash(params.motdepasse, 10);
    }

    // copy params to prestataire and save
    Object.assign(prestataire, params);
    await prestataire.save();

    return omitHash(prestataire.get());
}

async function _delete(id) {
    const prestataire = await getPrestataire(id);
    await prestataire.destroy();
}

// helper functions

async function getPrestataire(id) {
    const prestataire = await db.Prestataire_Dmd.findByPk(id);
    if (!prestataire) throw 'Pas utilisateur';
    return prestataire;
}

async function getPrestataireByEmail(params) {
    const prestataire = await db.Prestataire_Dmd.findOne({ where: { email_prestataire: params.email_prestataire } });
    if (!prestataire) throw 'Pas utilisateur';
    return prestataire.id;
}


async function validatePrestataire(id) {
    const dmd = await db.Prestataire_Dmd.findByPk(id)
    const prestataire = await db.Prestataire.findOne({ where: { email_prestataire: dmd.email_prestataire } });
    if (prestataire) throw 'Utilisateur exist';
    else {
    var params = omitHash(dmd.get());
    delete params.id;
    const pres = await db.Prestataire.create(params);
    console.log(pres.id);
    params.prestataire_id = pres.id
    const garage = await db.Garage.create(params);
    console.log(params);

    var transporter = nodemailer.createTransport({
        name: 'elcarhba',
        host: 'mail.solyntek.com',
        port: 465,
        secure: true,
        requireTLS: true,
         auth: {
         user: 'test@solyntek.com',
         pass: 'o?zL6-o$e21!'
    }
    });

    var mailOptions = {
         from: 'test@solyntek.com',
         to: pres.email_prestataire,
         subject: 'Welcome',
         text: 'Prestataire ELCarhba',
         html: `Bonjour `+ pres.nom_prestataire + `, votre mail est : ` + pres.email_prestataire + ` .`
    };

     transporter.sendMail(mailOptions, function(error, info){
         if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
    });
    
    return 'Prestataire Added';
}
}

function omitHash(prestataire) {
    const { hash, ...prestataireWithoutHash } = prestataire;
    return prestataireWithoutHash;
}