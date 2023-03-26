const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../../middleware/validate-request');
const authorize = require('../../middleware/authorize')
const expertService = require('./expert.service');

// routes
router.post('/add',authorize(), addSchema, add);
router.get('/', getAll);
router.get('/current', authorize(), getCurrent);
router.get('/:id', authorize(), getById);
router.post('/sexpert/', authorize(), findExpert);
router.put('/:id', authorize(), updateSchema, update);
router.delete('/:id', authorize(), _delete);

module.exports = router;


function addSchema(req, res, next) {
    const schema = Joi.object({
        nom_prenom_expert: Joi.string(),
        mail_expert: Joi.string().email(),   
        telephone_expert: Joi.string(),
        domaine_expert: Joi.string()
    });
    validateRequest(req, next, schema);
}

function add(req, res, next) {
    expertService.create(req)
        .then(expert => res.json(expert))
        .catch(next);
}

function getAll(req, res, next) {
    expertService.getAll()
        .then(experts => res.json(experts))
        .catch(next);
}

function getCurrent(req, res, next) {
    res.json(req.expert);
}

function getById(req, res, next) {
    expertService.getById(req.params.id)
        .then(expert => res.json(expert))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        nom_prenom_expert: Joi.string(),
        mail_expert: Joi.string().email(),   
        telephone_expert: Joi.string(),
        domaine_expert: Joi.string()
    });
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    expertService.update(req.params.id, req)
        .then(expert => res.json(expert))
        .catch(next);
}

function _delete(req, res, next) {
    expertService.delete(req)
        .then(() => res.json({ message: 'Sup' }))
        .catch(next);
}

function findExpert(req, res, next) {
    expertService.findExpert(req.body)
        .then(expert => res.json(expert))
        .catch(next);
}