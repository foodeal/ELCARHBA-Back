const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../../middleware/validate-request');
const authorize = require('../../middleware/authorize')
const reservationService = require('./reservation.service');

// routes
router.post('/add',authorize(), addSchema, add);
router.get('/', authorize(), getAll);
router.get('/current', authorize(), getCurrent);
router.get('/:id', authorize(), getById);
router.post('/sreservation/', authorize(), findReservation);
router.put('/:id', authorize(), updateSchema, update);
router.delete('/:id', authorize(), _delete);

module.exports = router;


function addSchema(req, res, next) {
    const schema = Joi.object({
        offre_id : Joi.number(),
        user_id : Joi.number()
    });
    validateRequest(req, next, schema);
}

function add(req, res, next) {
    reservationService.create(req)
        .then(reservation => res.json(reservation))
        .catch(next);
}

function getAll(req, res, next) {
    reservationService.getAll()
        .then(reservations => res.json(reservations))
        .catch(next);
}

function getCurrent(req, res, next) {
    res.json(req.reservation);
}

function getById(req, res, next) {
    reservationService.getById(req.params.id)
        .then(reservation => res.json(reservation))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        offre_id : Joi.number(),
        user_id : Joi.number()
    });
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    reservationService.update(req.params.id, req)
        .then(reservation => res.json(reservation))
        .catch(next);
}

function _delete(req, res, next) {
    reservationService.delete(req)
        .then(() => res.json({ message: 'Sup' }))
        .catch(next);
}

function findReservation(req, res, next) {
    reservationService.findReservation(req.body)
        .then(reservation => res.json(reservation))
        .catch(next);
}