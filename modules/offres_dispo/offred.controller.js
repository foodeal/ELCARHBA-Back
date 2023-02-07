const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../../middleware/validate-request');
const authorize = require('../../middleware/authorize')
const offreService = require('./offred.service');

// routes
router.post('/add',authorize(), addSchema, add);
router.get('/', getAll);
router.get('/best', getBest);
router.get('/avant', getAvant);
router.get('/current', authorize(), getCurrent);
router.get('/:id', getById);
router.get('/:categorie', getByCategorie);
router.get('/fichiers/:id', authorize(), getFichiers);
router.post('/soffre/', findOffre);
router.post('/filter/', getFilter);
router.put('/:id', authorize(), updateSchema, update);
router.delete('/:id', authorize(), _delete);

module.exports = router;


function addSchema(req, res, next) {
    const schema = Joi.object({
        date_debut: Joi.date().required(),
        date_fin: Joi.date().required(),
        quantite: Joi.number(),
        nombre_offres: Joi.number(),
        statut: Joi.string(),
        offre_id: Joi.number(),
        categorie: Joi.string(),
        motorisation: Joi.string(),
        diametre: Joi.string(),
        type_huile: Joi.string(),
        offre_expired: Joi.boolean()
    });
    validateRequest(req, next, schema);
}

function add(req, res, next) {
    offreService.create(req)
        .then(am => res.json(am))
        .catch(next);
}

function getFichiers(req, res, next) {
    offreService.getFichiers(req.params.id)
        .then(ams => res.json(ams))
        .catch(next);
}

function getAll(req, res, next) {
    offreService.getAll()
        .then(ams => res.json(ams))
        .catch(next);
}

function getBest(req, res, next) {
    offreService.getBest()
        .then(ams => res.json(ams))
        .catch(next);
}

function getAvant(req, res, next) {
    offreService.getAvant()
        .then(ams => res.json(ams))
        .catch(next);
}

function getCurrent(req, res, next) {
    res.json(req.am);
}

function getById(req, res, next) {
    offreService.getById(req.params.id)
        .then(am => res.json(am))
        .catch(next);
}

function getByCategorie(req, res, next) {
    offreService.getByCategorie(req.params.categorie)
        .then(am => res.json(am))
        .catch(next);
}

function getFilter(req, res, next) {
    offreService.getFilter(req.body)
        .then(am => res.json(am))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        date_debut: Joi.date().required(),
        date_fin: Joi.date().required(),
        quantite: Joi.number(),
        nombre_offres: Joi.number(),
        statut: Joi.string(),
        offre_id: Joi.number(),
        categorie: Joi.string(),
        motorisation: Joi.string(),
        diametre: Joi.string(),
        type_huile: Joi.string(),
        offre_expired: Joi.boolean()
    });
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    offreService.update(req.params.id, req)
        .then(am => res.json(am))
        .catch(next);
}

function _delete(req, res, next) {
    offreService.delete(req)
        .then(() => res.json({ message: 'Sup' }))
        .catch(next);
}

function findOffre(req, res, next) {
    offreService.findOffre(req.body)
        .then(offre => res.json(offre))
        .catch(next);
}