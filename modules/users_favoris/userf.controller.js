const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../../middleware/validate-request');
const authorize = require('../../middleware/authorize')
const userfService = require('./userf.service');

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
    userfService.create(req)
        .then(coupon => res.json(coupon))
        .catch(next);
}

function getAll(req, res, next) {
    userfService.getAll()
        .then(coupons => res.json(coupons))
        .catch(next);
}

function getCurrent(req, res, next) {
    res.json(req.coupon);
}

function getById(req, res, next) {
    userfService.getById(req.params.id)
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
    userfService.update(req.params.id, req)
        .then(coupon => res.json(coupon))
        .catch(next);
}

function _delete(req, res, next) {
    userfService.delete(req)
        .then(() => res.json({ message: 'Sup' }))
        .catch(next);
}

function findCoupon(req, res, next) {
    userfService.findCoupon(req.body)
        .then(coupon => res.json(coupon))
        .catch(next);
}