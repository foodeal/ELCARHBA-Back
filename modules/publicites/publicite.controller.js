const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../../middleware/validate-request');
const authorize = require('../../middleware/authorize')
const pubService = require('./publicite.service');

// routes
router.post('/add',authorize(), addSchema, add);
router.get('/', authorize(), getAll);
router.get('/current', authorize(), getCurrent);
router.get('/:id', authorize(), getById);
router.post('/spublicite/', authorize(), findPub);
router.put('/:id', authorize(), updateSchema, update);
router.delete('/:id', authorize(), _delete);

module.exports = router;


function addSchema(req, res, next) {
    const schema = Joi.object({
        titre_pub: Joi.string().required(),
        client_pub: Joi.string().required(),
        prix_pub: Joi.number().required(),
        duree_pub: Joi.number().required(),
        description_pub: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function add(req, res, next) {
    pubService.create(req)
        .then(publicite => res.json(publicite))
        .catch(next);
}

function getAll(req, res, next) {
    pubService.getAll()
        .then(publicites => res.json(publicites))
        .catch(next);
}

function getCurrent(req, res, next) {
    res.json(req.publicite);
}

function getById(req, res, next) {
    pubService.getById(req.params.id)
        .then(publicite => res.json(publicite))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        titre_pub: Joi.string().required(),
        client_pub: Joi.string().required(),
        prix_pub: Joi.number().required(),
        duree_pub: Joi.number().required(),
        description_pub: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    pubService.update(req.params.id, req)
        .then(publicite => res.json(publicite))
        .catch(next);
}

function _delete(req, res, next) {
    pubService.delete(req)
        .then(() => res.json({ message: 'Sup' }))
        .catch(next);
}

function findPub(req, res, next) {
    pubService.findPub(req.body)
        .then(publicite => res.json(publicite))
        .catch(next);
}