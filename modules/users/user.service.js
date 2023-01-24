const config = require('../../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../../helpers/db');
var nodemailer = require('nodemailer');

module.exports = {
    authenticate,
    getAll,
    getById,
    getUserData,
    create,
    update,
    updateMdp,
    getUserByEmail,
    delete: _delete
};

async function authenticate({ email, motdepasse }) {
    const user = await db.User.scope('withHash').findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(motdepasse, user.motdepasse)))
        throw 'Mot de passe incorrecte';

    // authentication successful
    const token = jwt.sign({ sub: user.id }, config.secret, { expiresIn: '7d' });
    console.log("Connected : " + user.id + " Loged In")
    return await { ...omitHash(user.get()), token };
}

async function getAll() {
    return await db.User.findAll();
}

async function getById(id) {
    return await getUser(id);
}

async function create(params) {
    // validate
    if (await db.User.findOne({ where: { email: params.email } })) {
        throw 'Email "' + params.email + '" existe déjà';
    }

    // hash password
    if (params.motdepasse) {
        params.motdepasse = await bcrypt.hash(params.motdepasse, 10);
    }

    // save user
    await db.User.create(params);
}

async function update(id, params) {
    const user = await getUser(id);

    // validate
    const emailChanged = params.email && user.email !== params.email;
    if (emailChanged && await db.User.findOne({ where: { email: params.email } })) {
        throw 'Email "' + params.email + '" existe déjà';
    }

    // hash password if it was entered
    if (params.motdepasse) {
        params.motdepasse = await bcrypt.hash(params.motdepasse, 10);
    }

    // copy params to user and save
    Object.assign(user, params);
    await user.save();

    return omitHash(user.get());
}

async function _delete(id) {
    const user = await getUser(id);
    await user.destroy();
}

// helper functions

async function getUser(id) {
    const user = await db.User.findByPk(id);
    if (!user) throw 'Pas utilisateur';
    return user;
}

async function getUserData(id) {
    const user = await db.User.findByPk(id);
    const coupons = await db.Coupon_Historique.findAll({ where: { user_id: user.id }, raw: true } );
    let b = {
        "user": user,
        "nombre_coupon": coupons.length
    }
    if (!user) throw 'Pas utilisateur';
    return b;
}

async function getUserByEmail(params) {
    const user = await db.User.findOne({ where: { email: params.email } });
    if (!user) throw 'Pas utilisateur';
    return user.id;
}


async function updateMdp(params) {
    const user = await db.User.findOne({ where: { email: params.email } });
    if (!user) throw 'Pas utilisateur';
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

    user.motdepasse = await bcrypt.hash(randomstring, 10);
    await user.save();

    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
         auth: {
         user: 'lesvergersapp@gmail.com',
         pass: 'lesvergers'
    }
    });

    var mailOptions = {
         from: 'lesvergersapp@gmail.com',
         to: 'ahmed.haddad@ieee.org',
         subject: 'Changer Mot de Passe',
         text: 'Bonjour '+ user.nom_prenom + ', votre mail est : ' + user.email +'et Mot de passe : '+randomstring+'.'
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

function omitHash(user) {
    const { hash, ...userWithoutHash } = user;
    return userWithoutHash;
}