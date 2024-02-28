const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../../middleware/validate-request');
const authorize = require('../../middleware/authorize')
const prestataireService = require('./prestataire_dmd.service');

// routes
router.post('/register', registerSchema, register);
router.get('/email', getPrestataireByEmail);
router.get('/validate/:id', authorize(), validatePrestataire);
router.get('/', authorize(), getAll);
router.get('/:categorie', getByCategorie);
router.get('/current', authorize(), getCurrent);
router.get('/:id', authorize(), getById);
router.put('/:id', authorize(), updateSchema, update);
router.delete('/:id', authorize(), _delete);

module.exports = router;


function registerSchema(req, res, next) {
    const schema = Joi.object({
        nom_prestataire: Joi.string().required(),
        prenom_prestataire: Joi.string().required(),
        email_prestataire: Joi.string().required(),
        tel_prestataire: Joi.string().required(),
        raison_sociale: Joi.string(),
        role: Joi.string().default("").allow(""),
        description: Joi.string(),
        pays_prestataire: Joi.string(),
        ville_prestataire: Joi.string(),
        adresse_prestataire: Joi.string(),
        service_prestataire: Joi.string(),
        site_web: Joi.string().default("").allow(""),
        lien_fb: Joi.string().default("").allow(""),
        lien_insta: Joi.string().default("").allow(""),
        registre_commerce: Joi.string(),
        cin_gerant: Joi.string(),
        contrat_condition: Joi.string(),
        motdepasse: Joi.string().min(6),
        categorie: Joi.string(),
        nom_garage: Joi.string().required(),
        heures_travail: Joi.string(),
        jours_travail: Joi.string(),
        adresse_garage: Joi.string(),
        contact_garage: Joi.string(),
        type_garage: Joi.string()
    });
    validateRequest(req, next, schema);
}

function register(req, res, next) {
    prestataireService.create(req.body)
        .then(() => res.json({ message: 'Succes' }))
        .catch(next);
}

function getAll(req, res, next) {
    prestataireService.getAll()
        .then(prestataires => res.json(prestataires))
        .catch(next);
}

function getPrestataireByEmail(req, res, next) {
    prestataireService.getPrestataireByEmail(req.body)
        .then(prestataire => res.json(prestataire))
        .catch(next);
}

function getCurrent(req, res, next) {
    res.json(req.prestataire);
}

function getById(req, res, next) {
    prestataireService.getById(req.params.id)
        .then(prestataire => res.json(prestataire))
        .catch(next);
}

function getByCategorie(req, res, next) {
    offreService.getByCategorie(req.params.categorie)
        .then(am => res.json(am))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        nom_prestataire: Joi.string().required(),
        prenom_prestataire: Joi.string().required(),
        email_prestataire: Joi.string().required(),
        tel_prestataire: Joi.string().required(),
        raison_sociale: Joi.string(),
        role: Joi.string(),
        description: Joi.string(),
        pays_prestataire: Joi.string(),
        ville_prestataire: Joi.string(),
        adresse_prestataire: Joi.string(),
        service_prestataire: Joi.string(),
        site_web: Joi.string(),
        lien_fb: Joi.string(),
        lien_insta: Joi.string(),
        registre_commerce: Joi.string(),
        cin_gerant: Joi.string(),
        contrat_condition: Joi.string(),
        categorie: Joi.string(),
        motdepasse: Joi.string().min(6),
        nom_garage: Joi.string().required(),
        heures_travail: Joi.string(),
        jours_travail: Joi.string(),
        adresse_garage: Joi.string(),
        contact_garage: Joi.string(),
        type_garage: Joi.string()
    });
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    prestataireService.update(req.params.id, req.body)
        .then(prestataire => res.json(prestataire))
        .catch(next);
}

function validatePrestataire(req, res, next) {
    prestataireService.validatePrestataire(req.params.id)
        .then(prestataire => res.json(prestataire))
        .catch(next);
}

function _delete(req, res, next) {
    prestataireService.delete(req.params.id)
        .then(() => res.json({ message: 'Sup' }))
        .catch(next);
}