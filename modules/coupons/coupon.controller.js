const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../../middleware/validate-request');
const authorize = require('../../middleware/authorize')
const couponService = require('./coupon.service');

// routes
router.post('/add',authorize(), addSchema, add);
router.post('/addbypoints',authorize(), addSchema, addbypoints);
router.get('/', authorize(), getAll);
router.get('/dispo', authorize(), getCouponDispo);
router.get('/current', authorize(), getCurrent);
router.get('/:id', authorize(), getById);
router.get('/expire/:id', authorize(), getExpired);
router.get('/valide/:id', authorize(), getValide);
router.get('/expirepres/:id', authorize(), getExpired);
router.get('/validepres/:id', authorize(), getValide);
router.get('/allexpired', authorize(), getAllExpired);
router.get('/allvalides', authorize(), getAllValide);
router.post('/scoupon/', authorize(), findCoupon);
router.post('/serie', authorize(), serieCoupon);
router.post('/dcrypt/', authorize(), dcryptCode);
router.put('/:id', authorize(), updateSchema, update);
router.delete('/:id', authorize(), _delete);

module.exports = router;


function addSchema(req, res, next) {
    const schema = Joi.object({
        date_valide_coupon: Joi.date(),
        date_creation_coupon: Joi.date(),
        quantite: Joi.number(),
        prestataire_id : Joi.number(),
        offre_id : Joi.number(),
        user_id : Joi.number(),
        coupon_valide : Joi.bool(),
        coupon_expire : Joi.bool(),
        code_coupon : Joi.string(),
        serie_coupon : Joi.string()
    });
    validateRequest(req, next, schema);
}

function add(req, res, next) {
    couponService.create(req)
        .then(coupon => res.json(coupon))
        .catch(next);
}

function addbypoints(req, res, next) {
    couponService.createByPoints(req)
        .then(coupon => res.json(coupon))
        .catch(next);
}


function getAll(req, res, next) {
    couponService.getAll()
        .then(coupons => res.json(coupons))
        .catch(next);
}

function getAllExpired(req, res, next) {
    couponService.getAllExpired()
        .then(coupon => res.json(coupon))
        .catch(next);
}

function getAllValide(req, res, next) {
    couponService.getAllValide()
        .then(coupon => res.json(coupon))
        .catch(next);
}

function getCouponDispo(req, res, next) {
    couponService.getCouponDispo()
        .then(coupons => res.json(coupons))
        .catch(next);
}

function getCurrent(req, res, next) {
    res.json(req.coupon);
}

function getById(req, res, next) {
    couponService.getById(req.params.id)
        .then(coupon => res.json(coupon))
        .catch(next);
}

function getExpired(req, res, next) {
    couponService.getExpired(req.params.id)
        .then(coupon => res.json(coupon))
        .catch(next);
}

function getDispoPres(req, res, next) {
    couponService.getDispoPres(req.params.id)
        .then(coupon => res.json(coupon))
        .catch(next);
}

function getExpiredPres(req, res, next) {
    couponService.getExpiredPres(req.params.id)
        .then(coupon => res.json(coupon))
        .catch(next);
}

function getValide(req, res, next) {
    couponService.getValide(req.params.id)
        .then(coupon => res.json(coupon))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        date_valide_coupon: Joi.date(),
        date_creation_coupon: Joi.date(),
        quantite: Joi.number(),
        prestataire_id : Joi.number(),
        offre_id : Joi.number(),
        user_id : Joi.number(),
        coupon_valide : Joi.bool(),
        coupon_expire : Joi.bool(),
        code_coupon : Joi.string(),
        serie_coupon : Joi.string()
    });
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    couponService.update(req.params.id, req)
        .then(coupon => res.json(coupon))
        .catch(next);
}

function _delete(req, res, next) {
    couponService.delete(req)
        .then(() => res.json({ message: 'Sup' }))
        .catch(next);
}

function findCoupon(req, res, next) {
    couponService.findCoupon(req.body)
        .then(coupon => res.json(coupon))
        .catch(next);
}

function serieCoupon(req, res, next) {
    couponService.serieCoupon(req.body)
        .then(coupon => res.json(coupon))
        .catch(next);
}

function dcryptCode(req, res, next) {
    couponService.dcryptCode(req.body)
        .then(coupon => res.json(coupon))
        .catch(next);
}