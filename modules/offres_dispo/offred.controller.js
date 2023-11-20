const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../../middleware/validate-request');
const authorize = require('../../middleware/authorize')
const offreService = require('./offred.service');

// routes
router.post('/add',authorize(), addSchema, add);
router.get('/', getAll);
router.get('/offres', getAllOffres);
router.get('/best', getBest);
router.get('/expired', getExpired);
router.post('/sort', getSort);
router.get('/avant', getAvant);
router.get('/current', authorize(), getCurrent);
router.get('/:id', getById);
router.get('/:categorie', getByCategorie);
router.get('/fichiers/:id', getFichiers);
router.get('/prestataire/:id', getPrestataire);
router.get('/prestataire/pagination/:id', getPaginationPrestataire);
router.post('/soffre/', findOffre);
router.post('/filter/', getFilter);
router.put('/:id', authorize(), updateSchema, update);
router.delete('/:id', authorize(), _delete);

module.exports = router;


function addSchema(req, res, next) {
    const schema = Joi.object({
        date_debut: Joi.date().required(),
        date_fin: Joi.date().required(),
        nombre_offres: Joi.number().default(0).allow(0),
        statut_dispo: Joi.string().default('Disponible').allow(''),
        offre_id: Joi.number(),
        offre_expired: Joi.boolean().default(false),
        offre_dispo_valid: Joi.boolean().default(true),
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

function getPrestataire(req, res, next) {
    offreService.getPrestataire(req.params.id)
        .then(offres => res.json(offres))
        .catch(next);
}

function getPaginationPrestataire(req, res, next) {
    offreService.getPrestataire(req.params.id)
        .then(offres => res.json(offres))
        .catch(next);
}

function getAll(req, res, next) {
    offreService.getAll()
        .then(ams => res.json(ams))
        .catch(next);
}

function getAllOffres(req, res, next) {
    offreService.getAllOffres()
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

function getExpired(req, res, next) {
    offreService.getExpired()
        .then(ams => res.json(ams))
        .catch(next);
}

function getSort(req, res, next) {
    offreService.getSort(req.body)
        .then(am => res.json(am))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        date_debut: Joi.date().required(),
        date_fin: Joi.date().required(),
        nombre_offres: Joi.number().default(0).allow(0),
        statut_dispo: Joi.string().default('Disponible').allow(''),
        offre_id: Joi.number(),
        offre_expired: Joi.boolean(),
        offre_dispo_valid: Joi.boolean()
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