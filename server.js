require('rootpath')();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const errorHandler = require('./middleware/error-handler');
var path = require('path');
const https = require('https');
const fs = require('fs');

const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
  };
  

// const localtunnel = require('localtunnel');

// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.json({limit: "200mb", extended: true, parameterLimit:50000}));
app.use(bodyParser.urlencoded({limit: "200mb", extended: true, parameterLimit:50000}));

// request handlers
app.get('/', (req, res) => {
    res.send('Node js Application');
});

// api routes
app.use('/images', express.static('images'));
app.use('/users', require('./modules/users/user.controller'));
app.use('/avis', require('./modules/avis/avis.controller'));
app.use('/publicites', require('./modules/publicites/publicite.controller'));
app.use('/users_favoris', require('./modules/users_favoris/userf.controller'));
app.use('/prestataires', require('./modules/prestataires/prestataire.controller'));
app.use('/coupons', require('./modules/coupons/coupon.controller'));
app.use('/coupons_hist', require('./modules/coupons_historiques/couponh.controller'));
app.use('/experts', require('./modules/experts/expert.controller'));
app.use('/services', require('./modules/services/service.controller'));
app.use('/produits', require('./modules/produits/produit.controller'));
app.use('/reservations', require('./modules/reservations/reservation.controller'));
app.use('/garages', require('./modules/garages/garage.controller'));
app.use('/fichiers', require('./fichiers/fichier.controller'));
app.use('/logs', require('./logs/log.controller'));
app.use('/offres', require('./modules/offres/offre.controller'));
app.use('/offres_dispo', require('./modules/offres_dispo/offred.controller'));
app.use('/carnets', require('./modules/carnets/carnet.controller'));
app.use('/prestataire_dmd', require('./modules/prestataires_dmd/prestataire_dmd.controller'));
app.use('/historiques', require('./modules/historiques/historique.controller'));
// global error handler
app.use(errorHandler);

// start server local
// const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;
// app.listen(port, () => console.log('Server listening on port ' + port));

// start server
console.log('Server listening on port 443');
https.createServer(options, app).listen(443);

// //LocalTunnel
// (async () => {
//     const tunnel = await localtunnel({ port: 4000, subdomain: 'ElCarhba' });  
//     tunnel.on('close', () => {
//       console.log('Tunnel closed');
//       // tunnels are closed
//     });
//     console.log('-----');
//     console.log('-------> LocalTunnel Active : ' + tunnel.url);
//     console.log('-----');
//   })();

// //Set Global user
// app.use(function(req, res, next) {
//   res.locals.user = req.user;
//   next();
// });