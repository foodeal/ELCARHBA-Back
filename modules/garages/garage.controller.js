const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../../middleware/validate-request');
const authorize = require('../../middleware/authorize')
const garageService = require('./garage.service');

// routes
router.post('/add',authorize(), addSchema, add);
router.get('/', authorize(), getAll);
router.get('/current', authorize(), getCurrent);
router.get('/:id', authorize(), getById);
router.post('/sgarage/', authorize(), findGarage);
router.put('/:id', authorize(), updateSchema, update);
router.delete('/:id', authorize(), _delete);

module.exports = router;


function addSchema(req, res, next) {
    const schema = Joi.object({
        nom_garage: Joi.string().required(),
        heures_travail: Joi.string(),
        jours_travail: Joi.string(),
        adresse_garage: Joi.string(),
        contact_garage: Joi.string(),
        type_garage: Joi.string(),
        prestataire_id: Joi.number().required()
    });
    validateRequest(req, next, schema);
}

function add(req, res, next) {
    garageService.create(req)
        .then(garage => res.json(garage))
        .catch(next);
}

function getAll(req, res, next) {
    garageService.getAll()
        .then(garages => res.json(garages))
        .catch(next);
}

function getCurrent(req, res, next) {
    res.json(req.garage);
}

function getById(req, res, next) {
    garageService.getById(req.params.id)
        .then(garage => res.json(garage))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        nom_garage: Joi.string().required(),
        heures_travail: Joi.string(),
        jours_travail: Joi.string(),
        adresse_garage: Joi.string(),
        contact_garage: Joi.string(),
        type_garage: Joi.string(),
        prestataire_id: Joi.number().required()
    });
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    garageService.update(req.params.id, req)
        .then(garage => res.json(garage))
        .catch(next);
}

function _delete(req, res, next) {
    garageService.delete(req)
        .then(() => res.json({ message: 'Sup' }))
        .catch(next);
}

function findGarage(req, res, next) {
    garageService.findGarage(req.body)
        .then(garage => res.json(garage))
        .catch(next);
}