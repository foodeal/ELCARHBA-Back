const jwt = require('jsonwebtoken');
const db = require('../../helpers/db');
const Sequelize = require("sequelize");
const Op = Sequelize.Op;


module.exports = {
    getAll,
    getById,
    create,
    update,
    findReservation,
    delete: _delete
};


async function getAll() {
    return await db.Reservation.findAll(); 
}

async function getById(id) {
    return await getReservation(id);
}

async function create(params) {
    const reservation = await db.Reservation.create(params.body);

    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "Reservation";
    params.msg = "Ajout de Reservation ID : " + reservation.id;
    await db.Log.create(params);

    return await omitHash(reservation.get());
}

async function update(id, params) {
    const reservation = await getReservation(id);

    // copy params to am and save
    Object.assign(reservation, params.body);
    await reservation.save();

    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "Reservation";
    params.msg = "Update de Reservation ID : " + reservation.id;
    await db.Log.create(params);

    return await omitHash(reservation.get());
}

async function _delete(params) {
    const reservation = await getReservation(params.params.id);
    await reservation.destroy();

    const userToken = params.headers.authorization;
    const token = userToken.split(' ');
    const decoded = jwt.verify(token[1], 'Foodealz')
    params.date = Date.now();
    params.utilisateur = decoded.sub;
    params.mod = "Reservation";
    params.msg = "Suppression de Reservation ID : " + reservation.id;
    await db.Log.create(params);
}

// helper functions

async function getReservation(id) {
    const reservation = await db.Reservation.findByPk(id);
    if (!reservation) throw 'Pas de reservation';
    return reservation;
}


async function findReservation(params) {
    if (params)
    {
        const reservation = await db.Reservation.findAll({ where: { [Op.and] : [
           { titre_reservation: {[Op.like]: params.date_debut + '%'} }
        ]}});
        if (!reservation) {throw 'Vide' }
        else return await reservation;
    } else 
    { throw 'Vide' ;}
}

function omitHash(reservation) {
    const { hash, ...reservationWithoutHash } = reservation;
    return reservationWithoutHash;
}