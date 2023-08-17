const config = require('./../config.json');
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');

User = require('../modules/users/user.model');
User_Favori = require('../modules/users_favoris/userf.model');
Prestataire = require('../modules/prestataires/prestataire.model');
Prestataire_Dmd = require('../modules/prestataires_dmd/prestataire_dmd.model');
Garage = require('../modules/garages/garage.model');
Publicite = require('../modules/publicites/publicite.model');
Coupon = require('../modules/coupons/coupon.model');
Coupon_Historique = require('../modules/coupons_historiques/couponh.model');
Service = require('../modules/services/service.model');
Produit = require('../modules/produits/produit.model');
Reservation = require('../modules/reservations/reservation.model');
Expert = require('../modules/experts/expert.model');
Fichier = require('../fichiers/fichier.model');
Log = require('../logs/log.model');
Offre = require('../modules/offres/offre.model');
Offre_Dispo = require('../modules/offres_dispo/offred.model');
Carnet = require('../modules/carnets/carnet.model');
Avis = require('../modules/avis/avis.model');
Historique = require('../modules/historiques/historique.model');

module.exports = db = {};

initialize();

async function initialize() {
    try {
    // create db if it doesn't already exist
    const { host, port, user, password, database } = config.database;
    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);

    // connect to db
    const sequelize = new Sequelize(database, user, password, { dialect: 'mysql' });

    // init models and add them to the exported db object

    db.User = require('../modules/users/user.model')(sequelize);
    db.User_Favori = require('../modules/users_favoris/userf.model')(sequelize);
    db.Fichier = require('../fichiers/fichier.model')(sequelize);
    db.Log = require('../logs/log.model')(sequelize);
    db.Offre = require('../modules/offres/offre.model')(sequelize);
    db.Publicite = require('../modules/publicites/publicite.model')(sequelize);
    db.Offre_Dispo = require('../modules/offres_dispo/offred.model')(sequelize);
    db.Prestataire = require('../modules/prestataires/prestataire.model')(sequelize);
    db.Prestataire_Dmd = require('../modules/prestataires_dmd/prestataire_dmd.model')(sequelize);
    db.Garage = require('../modules/garages/garage.model')(sequelize);
    db.Service = require('../modules/services/service.model')(sequelize);
    db.Produit = require('../modules/produits/produit.model')(sequelize);
    db.Reservation = require('../modules/reservations/reservation.model')(sequelize);
    db.Coupon = require('../modules/coupons/coupon.model')(sequelize);
    db.Coupon_Historique = require('../modules/coupons_historiques/couponh.model')(sequelize);
    db.Carnet = require('../modules/carnets/carnet.model')(sequelize);
    db.Avis = require('../modules/avis/avis.model')(sequelize);
    db.Expert = require('../modules/experts/expert.model')(sequelize);
    db.Historique = require('../modules/historiques/historique.model')(sequelize);
    
    // Association ManyToMany

    // sync all models with database
    await sequelize.sync();
    } catch (err) {
        console.log(err);
    }
}    
