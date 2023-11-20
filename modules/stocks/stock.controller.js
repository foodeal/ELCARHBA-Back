const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../../middleware/validate-request');
const authorize = require('../../middleware/authorize')
const stockService = require('./stock.service');

// routes
router.post('/add',authorize(), addSchema, add);
router.get('/', authorize(), getAll);
router.get('/current', authorize(), getCurrent);
router.get('/:id', authorize(), getById);
router.post('/sstock/', authorize(), findStock);
router.put('/:id', authorize(), updateSchema, update);
router.delete('/:id', authorize(), _delete);

module.exports = router;

function addSchema(req, res, next) {
    const schema = Joi.object({
        code_stock: Joi.string().allow(''),
        quantite_stock: Joi.number().allow(0),
        gain_stock: Joi.number().allow(0),
        users_stock: Joi.number().allow(0),
        offre_dispo_id: Joi.number().required(),
    });
    validateRequest(req, next, schema);
}

function add(req, res, next) {
    stockService.create(req)
        .then(stock => res.json(stock))
        .catch(next);
}

function getAll(req, res, next) {
    stockService.getAll()
        .then(stocks => res.json(stocks))
        .catch(next);
}

function getCurrent(req, res, next) {
    res.json(req.stock);
}

function getById(req, res, next) {
    stockService.getById(req.params.id)
        .then(stock => res.json(stock))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        code_stock: Joi.string().allow(''),
        quantite_stock: Joi.number().allow(0),
        gain_stock: Joi.number().allow(0),
        users_stock: Joi.number().allow(0),
        offre_dispo_id: Joi.number().required(),
    });
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    stockService.update(req.params.id, req)
        .then(stock => res.json(stock))
        .catch(next);
}

function _delete(req, res, next) {
    stockService.delete(req)
        .then(() => res.json({ message: 'Sup' }))
        .catch(next);
}

function findStock(req, res, next) {
    stockService.findStock(req.body)
        .then(stock => res.json(stock))
        .catch(next);
}