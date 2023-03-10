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


async function validatePrestataire(params) {
    const prestataire = await db.Prestataire.findOne({ where: { email_prestataire: params.email_prestataire } });
    if (prestataire) throw 'Utilisateur exist';
    else {
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz"; 
    var string_length = 8; var randomstring = ''; 
    var charCount = 0; var numCount = 0; 
    for (var i=0; i<string_length; i++) { 
        if((Math.floor(Math.random() * 2) == 0) && numCount < 3 || charCount >= 5) { 
            var rnum = Math.floor(Math.random() * 10); 
            randomstring += rnum; numCount += 1; } 
            else { 
                var rnum = Math.floor(Math.random() * chars.length); 
                randomstring += chars.substring(rnum,rnum+1); 
                charCount += 1; } }

    params.motdepasse = await bcrypt.hash(randomstring, 10);
    await db.Prestataire.create(params);

    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
         auth: {
         prestataire: 'lesvergersapp@gmail.com',
         pass: 'lesvergers'
    }
    });

    var mailOptions = {
         from: 'lesvergersapp@gmail.com',
         to: prestataire.email_prestataire,
         subject: 'Changer Mot de Passe',
         text: 'Bonjour '+ prestataire.nom_prestataire + ', votre mail est : ' + prestataire.email_prestataire +'et Mot de passe : '+ randomstring + '.'
    };

     transporter.sendMail(mailOptions, function(error, info){
         if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
    });
}
}

function omitHash(prestataire) {
    const { hash, ...prestataireWithoutHash } = prestataire;
    return prestataireWithoutHash;
}