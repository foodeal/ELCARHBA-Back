const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../../middleware/validate-request');
const authorize = require('../../middleware/authorize')
const couponhService = require('./couponh.service');

// routes
router.post('/add',authorize(), addSchema, add);
router.get('/', authorize(), getAll);
router.get('/current', authorize(), getCurrent);
router.get('/:id', authorize(), getById);
router.post('/scoupon/', authorize(), findCoupon);
router.put('/:id', authorize(), updateSchema, update);
router.delete('/:id', authorize(), _delete);

module.exports = router;


function addSchema(req, res, next) {
    const schema = Joi.object({
        coupon_id : Joi.number(),
        user_id : Joi.number()
    });
    validateRequest(req, next, schema);
}

function add(req, res, next) {
    couponhService.create(req)
        .then(coupon => res.json(coupon))
        .catch(next);
}

function getAll(req, res, next) {
    couponhService.getAll()
        .then(coupons => res.json(coupons))
        .catch(next);
}

function getCurrent(req, res, next) {
    res.json(req.coupon);
}

function getById(req, res, next) {
    couponhService.getById(req.params.id)
        .then(coupon => res.json(coupon))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        coupon_id : Joi.number(),
        user_id : Joi.number()
    });
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    couponhService.update(req.params.id, req)
        .then(coupon => res.json(coupon))
        .catch(next);
}

function _delete(req, res, next) {
    couponhService.delete(req)
        .then(() => res.json({ message: 'Sup' }))
        .catch(next);
}

function findCoupon(req, res, next) {
    couponhService.findCoupon(req.body)
        .then(coupon => res.json(coupon))
        .catch(next);
}