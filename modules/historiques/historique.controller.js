const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../../middleware/validate-request');
const authorize = require('../../middleware/authorize')
const historiqueService = require('./historique.service');

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
        user_id: Joi.number(),
        prestataire_id: Joi.number(),
        titre_offre: Joi.string(),
        conditions_utilisation: Joi.string(),
        description: Joi.string(),
        prix_initial: Joi.number(),
        pourcentage_prix_initial: Joi.number(),
        prix_remise: Joi.number(),
        categorie: Joi.string(),
        motorisation: Joi.string().default(""),
        diametre: Joi.string().default(0),
        type_huile: Joi.string().default(""),
        marque: Joi.string().default(""),
        modele: Joi.string().default(""),
        date_debut: Joi.date().required(),
        date_fin: Joi.date().required(),
        nombre_offres: Joi.number(),
        statut_dispo: Joi.string(),
        offre_id: Joi.number(),
        offre_expired: Joi.boolean()
    });
    validateRequest(req, next, schema);
}

function fulladd(req, res, next) {
    historiqueService.createFull(req)
        .then(offre => res.json(offre))
        .catch(next);
}

function addSchema(req, res, next) {
    const schema = Joi.object({
        user_id: Joi.number(),
        prestataire_id: Joi.number(),
        titre_offre: Joi.string(),
        conditions_utilisation: Joi.string(),
        description: Joi.string(),
        prix_initial: Joi.number(),
        pourcentage_prix_initial: Joi.number(),
        prix_remise: Joi.number(),
        categorie: Joi.string(),
        motorisation: Joi.string(),
        diametre: Joi.string(),
        type_huile: Joi.string(),
        marque: Joi.string(),
        modele: Joi.string(),
        date_debut: Joi.date().required(),
        date_fin: Joi.date().required(),
        nombre_offres: Joi.number(),
        statut_dispo: Joi.string(),
        offre_id: Joi.number(),
        offre_expired: Joi.boolean()
    });
    validateRequest(req, next, schema);
}

function add(req, res, next) {
    historiqueService.create(req)
        .then(offre => res.json(offre))
        .catch(next);
}

function getFichiers(req, res, next) {
    historiqueService.getFichiers(req.params.id)
        .then(offres => res.json(offres))
        .catch(next);
}

function getPrestataire(req, res, next) {
    historiqueService.getPrestataire(req.params.id)
        .then(offres => res.json(offres))
        .catch(next);
}

function getGarage(req, res, next) {
    historiqueService.getGarage(req.params.id)
        .then(offres => res.json(offres))
        .catch(next);
}

function getAll(req, res, next) {
    historiqueService.getAll()
        .then(offres => res.json(offres))
        .catch(next);
}

function filterPrix(req, res, next) {
    historiqueService.filterPrix(req)
        .then(offres => res.json(offres))
        .catch(next);
}

function getCurrent(req, res, next) {
    res.json(req.offre);
}

function getById(req, res, next) {
    historiqueService.getById(req.params.id)
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
        statut: Joi.string(),
        categorie: Joi.string(),
        motorisation: Joi.string(),
        diametre: Joi.string(),
        type_huile: Joi.string(),
        marque: Joi.string(),
        modele: Joi.string()
    });
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    historiqueService.update(req.params.id, req)
        .then(offre => res.json(offre))
        .catch(next);
}

function _delete(req, res, next) {
    historiqueService.delete(req)
        .then(() => res.json({ message: 'Sup' }))
        .catch(next);
}

function findOffre(req, res, next) {
    historiqueService.findOffre(req.body)
        .then(offre => res.json(offre))
        .catch(next);
}