const Joi = require('@hapi/joi');
const { ALLBENEFITS } = require('../models/enums');

module.exports = {
    create: Joi.object().keys({
        type: Joi.string().valid(...ALLBENEFITS),
        title: Joi.string().min(4).max(300).required(),
        body: Joi.string().min(10).max(10000).required(),
    }),
    find: Joi.object().keys({
        title: Joi.string().regex(/^[\u0621-\u064Aa-zA-Z\s]+$/),
    }),
    update: Joi.object().keys({
        title: Joi.string().min(4).max(300),
        body: Joi.string().min(10).max(10000),
    }).min(1),
    id: Joi.object().keys({
        id: Joi.string().required().regex(/^b\d+$/)
    }),
}