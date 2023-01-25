const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('./../../middleware/validate-request');
const authorize = require('./../../middleware/authorize')
const offreService = require('./offre.service');

// routes
router.post('/add',authorize(), addSchema, add);
router.get('/', getAll);
router.get('/filterprix', filterPrix);
router.get('/current', authorize(), getCurrent);
router.get('/:id', getById);
router.get('/fichiers/:id', authorize(), getFichiers);
router.post('/soffre/', findOffre);
router.put('/:id', authorize(), updateSchema, update);
router.delete('/:id', authorize(), _delete);

module.exports = router;


function addSchema(req, res, next) {
    const schema = Joi.object({
        titre_offre: Joi.string(),
        conditions_utilisation: Joi.string(),
        quantite: Joi.number(),
        description: Joi.string(),
        prix_initial: Joi.number(),
        pourcentage_prix_initial: Joi.number(),
        prix_remise: Joi.number(),
        prestataire_id: Joi.number(),
        statut: Joi.string()
    });
    validateRequest(req, next, schema);
}

function add(req, res, next) {
    offreService.create(req)
        .then(offre => res.json(offre))
        .catch(next);
}

function getFichiers(req, res, next) {
    offreService.getFichiers(req.params.id)
        .then(offres => res.json(offres))
        .catch(next);
}

function getAll(req, res, next) {
    offreService.getAll()
        .then(offres => res.json(offres))
        .catch(next);
}

function filterPrix(req, res, next) {
    offreService.filterPrix(req)
        .then(offres => res.json(offres))
        .catch(next);
}

function getCurrent(req, res, next) {
    res.json(req.offre);
}

function getById(req, res, next) {
    offreService.getById(req.params.id)
        .then(offre => res.json(offre))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        titre_offre: Joi.string(),
        conditions_utilisation: Joi.string(),
        quantite: Joi.number(),
        description: Joi.string(),
        prix_initial: Joi.number(),
        pourcentage_prix_initial: Joi.number(),
        prix_remise: Joi.number(),
        prestataire_id: Joi.number(),
        statut: Joi.string()
    });
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    offreService.update(req.params.id, req)
        .then(offre => res.json(offre))
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