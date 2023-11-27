const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('./../../middleware/validate-request');
const authorize = require('./../../middleware/authorize')
const offreService = require('./offre.service');

// routes
router.post('/fulladd',authorize(), fulladdSchema, fulladd);
router.post('/add',authorize(), addSchema, add);
router.get('/', getAll);
router.get('/filterprix', filterPrix);
router.get('/current', authorize(), getCurrent);
router.get('/:id', getById);
router.get('/fichiers/:id', authorize(), getFichiers);
router.get('/prestataire/:id', authorize(), getPrestataire);
router.get('/garage/:id', authorize(), getGarage);
router.post('/soffre/', findOffre);
router.put('/:id', authorize(), updateSchema, update);
router.delete('/:id', authorize(), _delete);

module.exports = router;


function fulladdSchema(req, res, next) {
    const schema = Joi.object({
        titre_offre: Joi.string(),
        conditions_utilisation: Joi.string(),
        description: Joi.string(),
        prix_initial: Joi.number().min(0),
        pourcentage_prix_initial: Joi.number().min(0),
        prix_remise: Joi.number().min(0),
        prix_points: Joi.number().min(0),
        prestataire_id: Joi.number(),
        categorie: Joi.string(),
        motorisation: Joi.string().allow("").default(""),
        diametre: Joi.string().allow(0).default(0),
        type_huile: Joi.string().allow("").default(""),
        marque: Joi.string().allow("").default(""),
        modele: Joi.string().allow("").default(""),
        offre_valid: Joi.boolean().default(true),
        date_debut: Joi.date().required(),
        date_fin: Joi.date().required(),
        nombre_offres: Joi.number().default(0).allow(0).min(0),
        statut_dispo: Joi.string().default('Disponible').allow(''),
        offre_id: Joi.number(),
        offre_dispo_valid: Joi.boolean().default(true)
    });
    validateRequest(req, next, schema);
}

function fulladd(req, res, next) {
    offreService.createFull(req)
        .then(offre => res.json(offre))
        .catch(next);
}

function addSchema(req, res, next) {
    const schema = Joi.object({
        titre_offre: Joi.string(),
        conditions_utilisation: Joi.string(),
        description: Joi.string(),
        prix_initial: Joi.number().min(0),
        pourcentage_prix_initial: Joi.number().min(0),
        prix_remise: Joi.number().min(0),
        prix_points: Joi.number().min(0),
        prestataire_id: Joi.number(),
        categorie: Joi.string(),
        motorisation: Joi.string().default("").allow(""),
        diametre: Joi.string().default(0).allow(0),
        type_huile: Joi.string().default("").allow(""),
        marque: Joi.string().default("").allow(""),
        modele: Joi.string().default("").allow(""),
        offre_valid: Joi.boolean().default(true)
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

function getPrestataire(req, res, next) {
    offreService.getPrestataire(req.params.id)
        .then(offres => res.json(offres))
        .catch(next);
}

function getGarage(req, res, next) {
    offreService.getGarage(req.params.id)
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
        description: Joi.string(),
        prix_initial: Joi.number().min(0),
        pourcentage_prix_initial: Joi.number().min(0),
        prix_remise: Joi.number().min(0),
        prix_points: Joi.number().min(0),
        prestataire_id: Joi.number(),
        categorie: Joi.string(),
        motorisation: Joi.string().default("").allow(""),
        diametre: Joi.string().default(0).allow(0),
        type_huile: Joi.string().default("").allow(""),
        marque: Joi.string().default("").allow(""),
        modele: Joi.string().default("").allow(""),
        offre_valid: Joi.boolean().default(true)
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