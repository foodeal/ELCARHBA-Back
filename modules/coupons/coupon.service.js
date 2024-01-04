const jwt = require('jsonwebtoken');
const db = require('../../helpers/db');
var Sequelize = require("sequelize");
const bcrypt = require('bcryptjs');
const Op = Sequelize.Op;
var CryptoJS = require("crypto-js");
var nodemailer = require('nodemailer');


module.exports = {
    getAll,
    getCouponDispo,
    getById,
    getExpired,
    getValide,
    create,
    update,
    findCoupon,
    getData,
    addPoint,
    getDataCoupon,
    createByPoints,
    getDispoPres,
    getExpiredPres,
    dcryptCode,
    serieCoupon,
    getAllExpired,
    getAllValide,
    delete: _delete
};


async function getAll() {
    coupons = await db.Coupon.findAll(); 
    var cps = JSON.parse(JSON.stringify(coupons));
    var res = [];
    if (cps.length) {
    for (let i=0; i < cps.length; i++) {
        const cpsf = await getDataCoupon(cps[i]);
        res = res.concat(cpsf);
    }
    console.log(res);
    return res; 
    }
}

async function getData(cp) {
    const offre = await db.Offre.findOne({ where: { id: cp.offre_id }, raw: true });
    console.log("offre");
    console.log(offre);
    const prestataire = await db.Prestataire.findOne({ where: { id: cp.prestataire_id}, raw: true });
    let b = {
        'prestataire_name': prestataire.nom_prestataire + " " + prestataire.prenom_prestataire,
        'offre_name': offre.titre_offre,
        'prix': cp.prix_final - cp.argent_gagner,
        'photo': ""
    }
    cp = Object.assign(cp, b);
    return (cp)
}

async function getExpiredPres(id) {
  coupons = await db.Coupon.findAll({ where: {prestataire_id:id, [Op.or] : [ { coupon_valide:false, coupon_expire:true } ]}});
  var cps = JSON.parse(JSON.stringify(coupons));
  var res = [];
  if (cps.length) {
  for (let i=0; i < cps.length; i++) {
      const cpsf = await getDataCoupon(cps[i]);
      res = res.concat(cpsf);
  }
  console.log(res);
  return res; 
  }
}

async function getDispoPres(id) {
    coupons = await db.Coupon.findAll({ where: {[Op.and] : [ { prestataire_id:id, coupon_valide: true, coupon_expire: false } ]}});
    var cps = JSON.parse(JSON.stringify(coupons));
    var res = [];
    if (cps.length) {
    for (let i=0; i < cps.length; i++) {
        const cpsf = await getDataCoupon(cps[i]);
        res = res.concat(cpsf);
    }
    console.log(res);
    return res; 
    }
}

async function getCouponDispo() {
  coupons = await db.Coupon.findAll({ where: { date_valide_coupon : { [Op.gt]: new Date() }, coupon_valide:true } });
  var cps = JSON.parse(JSON.stringify(coupons));
  var res = [];
  if (cps.length) {
  for (let i=0; i < cps.length; i++) {
      const cpsf = await getDataCoupon(cps[i]);
      res = res.concat(cpsf);
  }
  console.log(res);
  return res; 
  }
}


async function getAllExpired() {
    coupons = await db.Coupon.findAll({ where: { [Op.and] : [
        { coupon_expire: true}
    ]}});
    var cps = JSON.parse(JSON.stringify(coupons));
    var res = [];
    if (cps.length) {
    for (let i=0; i < cps.length; i++) {
        const cpsf = await getDataCoupon(cps[i]);
        res = res.concat(cpsf);
    }
    console.log(res);
    }

    return res; 
}

async function addPoint(params) {
    const user = await db.User.findByPk(params.user_id);
    const offre_dispo = await db.Offre_Dispo.findOne({ where: { id: params.offre_id }, raw: true });    
    const offre = await db.Offre.findOne({ where: { id: await offre_dispo.offre_id }, raw: true });
    if (offre.prix_initial < 51) {
        user.point_gagner = user.point_gagner + 2;
    } else if (offre.prix_initial < 151) {
        user.point_gagner = user.point_gagner + 5;
    } else if (offre.prix_initial < 301) {
        user.point_gagner = user.point_gagner + 10;
    } else {
        user.point_gagner = user.point_gagner + 15;
    }
    const userUpd = await db.User.findByPk(params.user_id);
    Object.assign(userUpd, user);
    await userUpd.save();
    return userUpd.point_gagner;
}

async function getAllValide() {
    coupons = await db.Coupon.findAll({ where: { [Op.and] : [
        { coupon_valide: true},
        { coupon_expire : false}
    ]}});
    var cps = JSON.parse(JSON.stringify(coupons));
    var res = [];
    if (cps.length) {
    for (let i=0; i < cps.length; i++) {
        const cpsf = await getDataCoupon(cps[i]);
        res = res.concat(cpsf);
    }
    console.log(res);
    }
    return res; 
}

async function getById(id) {
    const coupon = await db.Coupon.findByPk(id);
    if (!coupon) throw 'Pas de Coupon';
    const couponData = await getDataCoupon(coupon.get());
    return await omitHash(couponData);
}

async function getExpired(id) {
    coupons = await db.Coupon.findAll({ where: { [Op.and] : [
        { user_id: id },
        { coupon_expire: true}
    ]}});
    var cps = JSON.parse(JSON.stringify(coupons));
    var res = [];
    if (cps.length) {
    for (let i=0; i < cps.length; i++) {
        const cpsf = await getDataCoupon(cps[i]);
        res = res.concat(cpsf);
    }
    console.log(res);
    }

    return res; 
}

async function getValide(id) {
    coupons = await db.Coupon.findAll({ where: { [Op.and] : [
        { user_id: id },
        { coupon_valide: true},
        { coupon_expire : false}
    ]}});
    var cps = JSON.parse(JSON.stringify(coupons));
    var res = [];
    if (cps.length) {
    for (let i=0; i < cps.length; i++) {
        const cpsf = await getDataCoupon(cps[i]);
        res = res.concat(cpsf);
    }
    console.log(res);
    }

    return res; 
}

async function create(params) {
    //Update Offre 
    const offre = await getOffre(params.body.offre_id);
    const stock = await db.Stock.findOne({ where: { offre_dispo_id: await offre.id }, raw: true });
    if (stock.quantite_stock < params.body.quantite) {
      throw "Nombre des offres insuffisant"
    } 
    else {
    code = params.body.user_id + "," + params.body.prestataire_id + "," + params.body.offre_id + "," + params.body.date_creation_coupon.toString().substring(-1,15) + "," + params.body.date_valide_coupon.toString().substring(-1,15);
    nb = await db.Coupon.count();
    serie = "CP" + params.body.user_id + params.body.prestataire_id + (nb + 1);
    const user = await db.User.findByPk(params.body.user_id);
    // Encrypt
    var codeCryp = CryptoJS.AES.encrypt(code, 'elcarhba').toString();
    params.body.coupon_valide = true;
    params.body.coupon_expire = false;
    params.body.code_coupon = codeCryp;
    params.body.serie_coupon = serie;
    await db.Reservation.create(params.body);
    console.log(params.body.code_coupon);
    const coupon = await db.Coupon.create(params.body);
    params.body.coupon_id = coupon.id;
    await db.Coupon_Historique.create(params.body);
    const couponData = await getDataCoupon(coupon.get());
    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "Coupon";
    params.msg = "Ajout de Coupon ID : " + coupon.id;
    await db.Log.create(params);

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
                        <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Ce code QR est nécessaire pour continuer le processus d'achat et doit être présenté aux fournisseurs de services.</p>
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
                        <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Vous trouverez ci-joint votre coupon avec code <b> ` + serie + ` </b> :</p>
                        <img class="displayed" id='barcode' 
                                src="https://api.qrserver.com/v1/create-qr-code/?data=`+ codeCryp + `&amp;size=250x250" 
                                alt="ElCarhba" 
                                title="ElCarhba" 
                                width="250" 
                                height="250" />
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
         to: user.email,
         subject: 'Votre Coupon',
         text: 'ElCarhba',
         html: html_data
    };

     transporter.sendMail(mailOptions, function(error, info){
         if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
    });
    

    return await omitHash(couponData);
    }
}

async function createByPoints(params) {
    //Update Offre 
    const offre = await getOffre(params.body.offre_id);
    const main_offre = await db.Offre.findByPk(offre.offre_id);
    const user = await db.User.findByPk(params.body.user_id);
    const stock = await db.Stock.findOne({ where: { offre_dispo_id: offre.id }, raw: true });
    if (stock.quantite_stock < params.body.quantite) {
        throw "Nombre des offres insuffisant";
    } else if (user.point_gagner < main_offre.prix_points) {
        throw "Nombre de points insuffisant";
    } else {
    user.point_gagner = user.point_gagner - main_offre.prix_points;
    const userUpd = await db.User.findByPk(params.body.user_id);
    Object.assign(userUpd, user);
    await userUpd.save();
    code = params.body.user_id + "," + params.body.prestataire_id + "," + params.body.offre_id + "," + params.body.date_creation_coupon.toString().substring(-1,15) + "," + params.body.date_valide_coupon.toString().substring(-1,15);
    nb = await db.Coupon.count();
    serie = "CP" + params.body.user_id + params.body.prestataire_id + (nb + 1);
    // Encrypt
    var codeCryp = CryptoJS.AES.encrypt(code, 'elcarhba').toString();
    params.body.coupon_valide = true;
    params.body.coupon_expire = false;
    params.body.code_coupon = codeCryp;
    params.body.serie_coupon = serie;
    await db.Reservation.create(params.body);
    console.log(params.body.code_coupon);
    const coupon = await db.Coupon.create(params.body);
    params.body.coupon_id = coupon.id;
    await db.Coupon_Historique.create(params.body);
    const couponData = await getDataCoupon(coupon.get());
    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "Coupon";
    params.msg = "Ajout de Coupon ID : " + coupon.id;
    await db.Log.create(params);

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
                        <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Ce code QR est nécessaire pour continuer le processus d'achat et doit être présenté aux fournisseurs de services.</p>
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
                        <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Vous trouverez ci-joint votre coupon avec code <b> ` + serie + ` </b> :</p>
                        <img class="displayed" id='barcode' 
                                src="https://api.qrserver.com/v1/create-qr-code/?data=`+ codeCryp + `&amp;size=250x250" 
                                alt="ElCarhba" 
                                title="ElCarhba" 
                                width="250" 
                                height="250" />
                                <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Cette offre est achetée en échange de points !</p>
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
         to: user.email,
         subject: 'Votre Coupon',
         text: 'ElCarhba',
         html: html_data
    };

     transporter.sendMail(mailOptions, function(error, info){
         if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
    });
    

    return await omitHash(couponData);
    }
}

async function dcryptCode(params) {
    // Dcrypt
    const barcode = (params.code).replace(/\s/g, '+')
    const coupon = await db.Coupon.findOne({ where: { [Op.and] : [
        { code_coupon: barcode }
    ]}});
    // if ((coupon.coupon_valide = false) || (coupon.coupon_expire = true)) {
    //     return 'Coupon non valide'
    // }
    const offre_dispo = await db.Offre_Dispo.findOne({ where: { id: coupon.offre_id }, raw: true });
    const user = await db.User.findOne({ where: { id: coupon.user_id }, raw: true });
    const offre = await db.Offre.findOne({ where: { id: await offre_dispo.offre_id }, raw: true });
    const file = await db.Fichier.findAll({ where: { offre: offre.id }, raw: true });
    const garage = await db.Garage.findOne({ where: { prestataire_id: offre.prestataire_id }, raw: true });
    const prestataire = await db.Prestataire.findOne({ where: { id: offre.prestataire_id }, raw: true });
    var bytes  = CryptoJS.AES.decrypt(barcode, 'elcarhba');
    var originalText = bytes.toString(CryptoJS.enc.Utf8);
    const b = true;
    if (b) {
        const stock = await db.Stock.findOne({ where: { offre_dispo_id: offre_dispo.id }, raw: true });
        stock.quantite_stock = stock.quantite_stock - coupon.quantite;
        if ( stock.quantite_stock < 0) {
            return 'Stock insuffisant';
        } else {
        const couponUpd = await db.Coupon.findByPk(coupon.id);
        // coupon.coupon_valide = false;
        Object.assign(couponUpd, coupon);
        await couponUpd.save();
        stock.gain_stock = stock.gain_stock + offre.prix_remise;
        stock.users_stock = stock.users_stock + 1;
        params.user_id = user.id;
        params.offre_id = offre_dispo.id;
        const stockUpd =  await db.Stock.findByPk(stock.id);
        Object.assign(stockUpd, stock);
        await stockUpd.save();
        const pt = await addPoint(params);
        if (stock) { offre_dispo.nombre_offres = stock.quantite_stock; }
        let res = {
            'coupon' : coupon,
            'offre_dispo': offre_dispo,
            'offre': offre,
            'files': "file",
            'garage': garage,
            'prestataire': prestataire,
            'user': user,
            'stock': stock,
            'pt': pt,
            'code' : originalText
        }
        return res;
        }
    } else {
        throw "vide"
    }
}

async function update(id, params) {
    const coupon = await getCoupon(id);

    // copy params to am and save
    Object.assign(coupon, params.body);
    await coupon.save();

    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "Coupon";
    params.msg = "Update de Coupon ID : " + coupon.id;
    await db.Log.create(params);

    return await omitHash(coupon.get());
}

async function _delete(params) {
    const coupon = await getCoupon(params.params.id);
    await coupon.destroy();

    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "Coupon";
    params.msg = "Suppression de Coupon ID : " + coupon.id;
    await db.Log.create(params);
}

// helper functions

async function getOffre(id) {
    const offre = await db.Offre_Dispo.findByPk(id);
    if (!offre) throw 'Pas de Matiere';
    return offre;
}

async function getDataCoupon(off) {
    const offre_dispo = await db.Offre_Dispo.findOne({ where: { id: off.offre_id }, raw: true });
    const user = await db.User.findOne({ where: { id: off.user_id }, raw: true });
    const stock = await db.Stock.findOne({ where: { offre_dispo_id: await offre_dispo.id }, raw: true });
    const offre = await db.Offre.findOne({ where: { id: await offre_dispo.offre_id }, raw: true });
    const file = await db.Fichier.findAll({ where: { offre: off.id }, raw: true });
    const garage = await db.Garage.findOne({ where: { prestataire_id: off.prestataire_id }, raw: true });
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
    const prestataire = await db.Prestataire.findOne({ where: { id: off.prestataire_id }, raw: true });
    if (stock) { offre_dispo.nombre_offres = stock.quantite_stock; }
    let b = {
        'user': user,
        'offre_dispo': offre_dispo,
        'offre': offre,
        'files': "file",
        'garage': garage,
        'prestataire': prestataire,
        'stock': stock,
        'avis_count': avis_count,
        'avis_sum': avis_sum
    }
    off = Object.assign(off, b);
    return (off)
}

async function getCoupon(id) {
    coupon = await db.Coupon.findByPk(id);
    if (!coupon) throw 'Pas de Coupon';
    return getDataCoupon(coupon);
}

async function serieCoupon(params) {
    if (params)
    { 
        const coupon = await db.Coupon.findOne({ where: { serie_coupon : params.serie_coupon }});
        if (!(coupon)) {throw 'Vide' }
        else {
          const couponData = await getDataCoupon(coupon.get());
          return couponData;
        }
    } 
    else { throw 'Vide' ;}
}

async function findCoupon(params) {
    if (params)
    {
        const coupon = await db.Coupon.findAll({ where: { [Op.and] : [
           { titre_coupon: {[Op.like]: params.date_debut + '%'} }
        ]}});
        if (!coupon) {throw 'Vide' }
        else return await coupon;
    } else 
    { throw 'Vide' ;}
}

function omitHash(coupon) {
    const { hash, ...couponWithoutHash } = coupon;
    return couponWithoutHash;
}

// Schedule 
const schedule = require('node-schedule');

var d = (new Date(new Date().getTime())).toISOString();
const job = schedule.scheduleJob('1 0 * * *', async function(){
    const coupons = await db.Coupon.findAll({ where: { [Op.and] : [
        { date_valide_coupon : {[Op.lt]: d } },
        { coupon_expire : false}
    ]}});
    var ofs = JSON.parse(JSON.stringify(coupons));
    var res = [];
    if (ofs.length) {
    for (let i=0; i < ofs.length; i++) {
        console.log(ofs[i]);
        ofs[i].coupon_expire = true;
        ofs[i].coupon_valide = false;
        console.log(ofs[i]);
        const coupon = await getCoupon(ofs[i].id);
        Object.assign(coupon, ofs[i]);
        await coupon.save();
    }
    }
});