const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../../middleware/validate-request');
const authorize = require('../../middleware/authorize')
const serviceService = require('./service.service');

// routes
router.post('/add',authorize(), addSchema, add);
router.get('/', authorize(), getAll);
router.get('/current', authorize(), getCurrent);
router.get('/:id', authorize(), getById);
router.post('/sservice/', authorize(), findService);
router.put('/:id', authorize(), updateSchema, update);
router.delete('/:id', authorize(), _delete);

module.exports = router;


function addSchema(req, res, next) {
    const schema = Joi.object({
        nom: Joi.string().required(),
        modele: Joi.string().required(),
        type_motorisation: Joi.string().required(),
        categorie: Joi.string().required(),
        reference: Joi.string().required(),
        prix: Joi.number().required(),
        description: Joi.string().required(),
        offre_id: Joi.number()
    });
    validateRequest(req, next, schema);
}

function add(req, res, next) {
    serviceService.create(req)
        .then(service => res.json(service))
        .catch(next);
}

function getAll(req, res, next) {
    serviceService.getAll()
        .then(services => res.json(services))
        .catch(next);
}

function getCurrent(req, res, next) {
    res.json(req.service);
}

function getById(req, res, next) {
    serviceService.getById(req.params.id)
        .then(service => res.json(service))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        nom: Joi.string().required(),
        modele: Joi.string().required(),
        type_motorisation: Joi.string().required(),
        categorie: Joi.string().required(),
        reference: Joi.string().required(),
        prix: Joi.number().required(),
        description: Joi.string().required(),
        offre_id: Joi.number()
    });
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    serviceService.update(req.params.id, req)
        .then(service => res.json(service))
        .catch(next);
}

function _delete(req, res, next) {
    serviceService.delete(req)
        .then(() => res.json({ message: 'Sup' }))
        .catch(next);
}

function findService(req, res, next) {
    serviceService.findService(req.body)
        .then(service => res.json(service))
        .catch(next);
}