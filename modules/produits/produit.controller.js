const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../../middleware/validate-request');
const authorize = require('../../middleware/authorize')
const produitService = require('./produit.service');

// routes
router.post('/add',authorize(), addSchema, add);
router.get('/', authorize(), getAll);
router.get('/current', authorize(), getCurrent);
router.get('/:id', authorize(), getById);
router.post('/sproduit/', authorize(), findProduit);
router.put('/:id', authorize(), updateSchema, update);
router.delete('/:id', authorize(), _delete);

module.exports = router;


function addSchema(req, res, next) {
    const schema = Joi.object({
        nom: Joi.string().required(),
        marque: Joi.string().required(),
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
    produitService.create(req)
        .then(produit => res.json(produit))
        .catch(next);
}

function getAll(req, res, next) {
    produitService.getAll()
        .then(produits => res.json(produits))
        .catch(next);
}

function getCurrent(req, res, next) {
    res.json(req.produit);
}

function getById(req, res, next) {
    produitService.getById(req.params.id)
        .then(produit => res.json(produit))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        nom: Joi.string().required(),
        marque: Joi.string().required(),
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
    produitService.update(req.params.id, req)
        .then(produit => res.json(produit))
        .catch(next);
}

function _delete(req, res, next) {
    produitService.delete(req)
        .then(() => res.json({ message: 'Sup' }))
        .catch(next);
}

function findProduit(req, res, next) {
    produitService.findProduit(req.body)
        .then(produit => res.json(produit))
        .catch(next);
}