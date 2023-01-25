const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../../middleware/validate-request');
const authorize = require('../../middleware/authorize')
const carnetService = require('./carnet.service');

// routes
router.post('/add',authorize(), addSchema, add);
router.get('/', authorize(), getAll);
router.get('/current', authorize(), getCurrent);
router.get('/:id', authorize(), getById);
router.get('/user/:id', authorize(), getByUser);
router.post('/scarnet/', authorize(), findCarnet);
router.put('/:id', authorize(), updateSchema, update);
router.delete('/:id', authorize(), _delete);

module.exports = router;


function addSchema(req, res, next) {
    const schema = Joi.object({
        user_id : Joi.number(),
        date_vidange: Joi.date(),
        klm_vidange: Joi.number(),
        klm_plaque: Joi.number(),
        date_batterie: Joi.date(), 
        date_assurance: Joi.date(),
        date_visite: Joi.date()
    });
    validateRequest(req, next, schema);
}

function add(req, res, next) {
    carnetService.create(req)
        .then(coupon => res.json(coupon))
        .catch(next);
}

function getAll(req, res, next) {
    carnetService.getAll()
        .then(coupons => res.json(coupons))
        .catch(next);
}

function getCurrent(req, res, next) {
    res.json(req.coupon);
}

function getById(req, res, next) {
    carnetService.getById(req.params.id)
        .then(coupon => res.json(coupon))
        .catch(next);
}

function getByUser(req, res, next) {
    carnetService.getByUser(req.params.id)
        .then(coupon => res.json(coupon))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        user_id : Joi.number(),
        date_vidange: Joi.date(),
        klm_vidange: Joi.number(),
        klm_plaque: Joi.number(),
        date_batterie: Joi.date(), 
        date_assurance: Joi.date(),
        date_visite: Joi.date()
    });
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    carnetService.update(req.params.id, req)
        .then(coupon => res.json(coupon))
        .catch(next);
}

function _delete(req, res, next) {
    carnetService.delete(req)
        .then(() => res.json({ message: 'Sup' }))
        .catch(next);
}

function findCarnet(req, res, next) {
    carnetService.findCarnet(req.body)
        .then(coupon => res.json(coupon))
        .catch(next);
}