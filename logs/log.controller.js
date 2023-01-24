const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('./../middleware/validate-request');
const authorize = require('./../middleware/authorize');
const lService = require('./log.service');

// routes
router.post('/add', addSchema, add);
router.get('/', authorize(), getAll);
router.get('/current', authorize(), getCurrent);
router.get('/:id', authorize(), getById);
router.put('/:id', authorize(), updateSchema, update);
router.delete('/:id', authorize(), _delete);

module.exports = router;


function addSchema(req, res, next) {
    const schema = Joi.object({
        date: Joi.date().required(),
        utilisateur: Joi.string().required(),
        mod: Joi.string().required(),
        msg: Joi.string()
    });
    validateRequest(req, next, schema);
}

function add(req, res, next) {
    lService.create(req.body)
        .then(l => res.json(l))
        .catch(next);
}

function getAll(req, res, next) {
    lService.getAll()
        .then(ls => res.json(ls))
        .catch(next);
}

function getCurrent(req, res, next) {
    res.json(req.l);
}

function getById(req, res, next) {
    lService.getById(req.params.id)
        .then(l => res.json(l))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        date: Joi.date().empty(),
        utilisateur: Joi.string().empty(),
        mod: Joi.string().empty(),
        msg: Joi.string().empty()
    });
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    lService.update(req.params.id, req.body)
        .then(l => res.json(l))
        .catch(next);
}

function _delete(req, res, next) {
    lService.delete(req.params.id)
        .then(() => res.json({ message: 'Sup' }))
        .catch(next);
}