const config = require('../../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../../helpers/db');
var nodemailer = require('nodemailer');

module.exports = {
    authenticate,
    getAll,
    getById,
    create,
    update,
    currentPrestatire,
    updateMdp,
    getPrestataireByEmail,
    delete: _delete
};

async function currentPrestatire(params) {
    console.log("Current");
    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    const user = await db.Prestataire.scope('withHash').findOne({ where: { id : decoded.sub } });
    return user ;
}

async function authenticate({ email, motdepasse }) {
    const email_prestataire = email;
    const prestataire = await db.Prestataire.scope('withHash').findOne({ where: { email_prestataire } });

    if (!prestataire || !(await bcrypt.compare(motdepasse, prestataire.motdepasse)))
        throw 'Mot de passe incorrecte';

    // authentication successful
    const token = jwt.sign({ sub: prestataire.id }, config.secret, { expiresIn: '7d' });
    console.log("Connected : " + prestataire.id + " Loged In")
    return await { ...omitHash(prestataire.get()), token };
}

async function getAll() {
    return await db.Prestataire.findAll();
}

async function getById(id) {
    return await getPrestataire(id);
}

async function create(params) {
    // validate
    if (await db.Prestataire.findOne({ where: { email_prestataire: params.email_prestataire } })) {
        throw 'Email "' + params.email + '" existe déjà';
    }

    // hash password
    if (params.motdepasse) {
        params.motdepasse = await bcrypt.hash(params.motdepasse, 10);
    }

    // save prestataire
    await db.Prestataire.create(params);
}

async function update(id, params) {
    const prestataire = await getPrestataire(id);

    // validate
    const emailChanged = params.email_prestataire && prestataire.email_prestataire !== params.email_prestataire;
    if (emailChanged && await db.Prestataire.findOne({ where: { email_prestataire: params.email_prestataire } })) {
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
    const prestataire = await db.Prestataire.findByPk(id);
    if (!prestataire) throw 'Pas utilisateur';
    return prestataire;
}

async function getPrestataireByEmail(params) {
    const prestataire = await db.Prestataire.findOne({ where: { email_prestataire: params.email_prestataire } });
    if (!prestataire) throw 'Pas utilisateur';
    return prestataire.id;
}


async function updateMdp(params) {
    const prestataire = await db.Prestataire.findOne({ where: { email_prestataire: params.email_prestataire } });
    if (!prestataire) throw 'Pas utilisateur';
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

    prestataire.motdepasse = await bcrypt.hash(randomstring, 10);
    await prestataire.save();

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
         to: 'ahmed.haddad@ieee.org',
         subject: 'Changer Mot de Passe',
         text: 'Bonjour '+ prestataire.nom_prestataire + ', votre mail est : ' + prestataire.email_prestataire +'et Mot de passe : '+randomstring+'.'
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