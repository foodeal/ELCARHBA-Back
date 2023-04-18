const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../../middleware/validate-request');
const authorize = require('../../middleware/authorize')
const avisService = require('./avis.service');

// routes
router.post('/add',authorize(), addSchema, add);
router.get('/', getAll);
router.get('/current', authorize(), getCurrent);
router.get('/:id', getById);
router.get('/user/:id', authorize(), getByUser);
router.get('/garage/:id', authorize(), getByGarage);
router.put('/:id', authorize(), updateSchema, update);
router.delete('/:id', authorize(), _delete);

module.exports = router;


function addSchema(req, res, next) {
    const schema = Joi.object({
        avis: Joi.number(),
        nb_avis: Joi.number(),
        user_id: Joi.number(),
        garage_id: Joi.number()
    });
    validateRequest(req, next, schema);
}

function add(req, res, next) {
    avisService.create(req)
        .then(avis => res.json(avis))
        .catch(next);
}

function getAll(req, res, next) {
    avisService.getAll()
        .then(aviss => res.json(aviss))
        .catch(next);
}

function getByUser(req, res, next) {
    avisService.getByUser(req.params.id)
        .then(avis => res.json(avis))
        .catch(next);
}

function getByGarage(req, res, next) {
    avisService.getByGarage(req.params.id)
        .then(avis => res.json(avis))
        .catch(next);
}

function getCurrent(req, res, next) {
    res.json(req.avis);
}

function getById(req, res, next) {
    avisService.getById(req.params.id)
        .then(avis => res.json(avis))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        avis: Joi.number(),
        nb_avis: Joi.number(),
        user_id: Joi.number(),
        garage_id: Joi.number()
    });
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    avisService.update(req.params.id, req)
        .then(avis => res.json(avis))
        .catch(next);
}

function _delete(req, res, next) {
    avisService.delete(req)
        .then(() => res.json({ message: 'Sup' }))
        .catch(next);
}
