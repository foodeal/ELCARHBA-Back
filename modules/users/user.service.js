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
    currentUser,
    getUserByEmail,
    delete: _delete
};


async function currentUser(params) {
    console.log("Current");
    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    const user = await db.User.scope('withHash').findOne({ where: { id : decoded.sub } });
    return user ;
}

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

    console.log(params);
    // validate
    if (await db.User.findOne({ where: { email: params.email } })) {
        throw 'Email "' + params.email + '" existe déjà';
    }

    // hash password
    if (params.motdepasse) {
        params.motdepasse = await bcrypt.hash(params.motdepasse, 10);
    }

    // mail 
    const html_data = ` 
        <html> 
        <html>
        <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>QR Code</title>
        <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
        <style>
        img.displayed {
            display: block;
            margin-left: auto;
            margin-right: auto;
            padding-top: 20px;
            padding-bottom: 20px;
        }
        @media only screen and (max-width: 620px) {
        table.body h1 {
            font-size: 28px !important;
            margin-bottom: 10px !important;
        }

        table.body p,
        table.body ul,
        table.body ol,
        table.body td,
        table.body span,
        table.body a {
            font-size: 16px !important;
        }

        table.body .wrapper,
        table.body .article {
            padding: 10px !important;
        }

        table.body .content {
            padding: 0 !important;
        }

        table.body .container {
            padding: 0 !important;
            width: 100% !important;
        }

        table.body .main {
            border-left-width: 0 !important;
            border-radius: 0 !important;
            border-right-width: 0 !important;
        }

        table.body .btn table {
            width: 100% !important;
        }

        table.body .btn a {
            width: 100% !important;
        }

        table.body .img-responsive {
            height: auto !important;
            max-width: 100% !important;
            width: auto !important;
        }
        }
        @media all {
        .ExternalClass {
            width: 100%;
        }

        .ExternalClass,
        .ExternalClass p,
        .ExternalClass span,
        .ExternalClass font,
        .ExternalClass td,
        .ExternalClass div {
            line-height: 100%;
        }

        .apple-link a {
            color: inherit !important;
            font-family: inherit !important;
            font-size: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
            text-decoration: none !important;
        }

        #MessageViewBody a {
            color: inherit;
            text-decoration: none;
            font-size: inherit;
            font-family: inherit;
            font-weight: inherit;
            line-height: inherit;
        }

        .btn-primary table td:hover {
            background-color: #34495e !important;
        }

        .btn-primary a:hover {
            background-color: #34495e !important;
            border-color: #34495e !important;
        }
        }
        </style>
    </head>
    <body style="background-color: #f6f6f6; font-family: sans-serif; -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.4; margin: 0; padding: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">
        <span class="preheader" style="color: transparent; display: none; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden; width: 0;">ElCarhba QR Code</span>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f6f6f6; width: 100%;" width="100%" bgcolor="#f6f6f6">
        <tr>
            <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
            <td class="container" style="font-family: sans-serif; font-size: 14px; vertical-align: top; display: block; max-width: 580px; padding: 10px; width: 580px; margin: 0 auto;" width="580" valign="top">
            <div class="content" style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 580px; padding: 10px;">

                <!-- START CENTERED WHITE CONTAINER -->
                <table role="presentation" class="main" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: #ffffff; border-radius: 3px; width: 100%;" width="100%">

                <!-- START MAIN CONTENT AREA -->
                <tr>
                    <td class="wrapper" style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;" valign="top">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
                        <tr>
                        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">
                            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Bonjour,</p>
                            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Welcome to ElCarhba.</p>
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; box-sizing: border-box; width: 100%;" width="100%">
                            <tbody>
                                <tr>
                                <td align="left" style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding-bottom: 15px;" valign="top">
                                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: auto;">
                                    <tbody>
                                        <tr>
                                        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; border-radius: 5px; text-align: center; background-color: #3498db;" valign="top" align="center" bgcolor="#3498db"> <a href="" target="_blank" style="border: solid 1px #3498db; border-radius: 5px; box-sizing: border-box; cursor: pointer; display: inline-block; font-size: 14px; font-weight: bold; margin: 0; padding: 12px 25px; text-decoration: none; text-transform: capitalize; background-color: #3498db; border-color: #3498db; color: #ffffff;">Visitez notre site</a> </td>
                                        </tr>
                                    </tbody>
                                    </table>
                                </td>
                                </tr>
                            </tbody>
                            </table>
                            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Elcarhba.tn est une plateforme dédiée aux propriétaires de voitures pour trouver les meilleures offres adapté à leurs besoins automobiles. Nous Sommes un espace de confiance qui propose desservoces de haut niveau et oriente les propriétaires de voitures vers les meilleures prestataires de services en Tunisie.</p>
                            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Nous proposons également un service d'expédition de produits automobiles avec la possibilité de paiment en ligne ou à la livraison. Les propriétaires de voitures peuvent enregistrer l'historique de leurs voitures et avoir un carnet de suivi.</p>
                            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Merci !</p>

                        </td>
                        </tr>
                    </table>
                    </td>
                </tr>

                <!-- END MAIN CONTENT AREA -->
                </table>
                <!-- END CENTERED WHITE CONTAINER -->

                <!-- START FOOTER -->
                <div class="footer" style="clear: both; margin-top: 10px; text-align: center; width: 100%;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
                    <tr>
                    <td class="content-block" style="font-family: sans-serif; vertical-align: top; padding-bottom: 10px; padding-top: 10px; color: #999999; font-size: 12px; text-align: center;" valign="top" align="center">
                        <span class="apple-link" style="color: #999999; font-size: 12px; text-align: center;">ElCarhba - Tunis</span>
                        <br> Erreur <a href="" style="text-decoration: underline; color: #999999; font-size: 12px; text-align: center;">Contact</a>.
                    </td>
                    </tr>
                    <tr>
                    <td class="content-block powered-by" style="font-family: sans-serif; vertical-align: top; padding-bottom: 10px; padding-top: 10px; color: #999999; font-size: 12px; text-align: center;" valign="top" align="center">
                        Powered by <a href="http://htmlemail.io" style="color: #999999; font-size: 12px; text-align: center; text-decoration: none;">ELCARHBA</a>.
                    </td>
                    </tr>
                </table>
                </div>
                <!-- END FOOTER -->

            </div>
            </td>
            <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
        </tr>
        </table>
    </body>
    </html>
        `

    // save user
    await db.User.create(params);
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
         subject: 'Welcome !',
         text: 'Welcome to ELCarhba',
         html: html_data
    };

     transporter.sendMail(mailOptions, function(error, info){
         if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
    });
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