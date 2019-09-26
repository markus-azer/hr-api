const Joi = require('@hapi/joi');
const {ALLGENDERS, ALLTYPES} = require('../models/enums');

module.exports = {
    inviteUser: Joi.object().keys({
        email: Joi.string().email({ minDomainSegments: 2 }).trim().required(), //TODO: email should be validated by company domain
    }),
    create: Joi.object().keys({
        email: Joi.string().email({ minDomainSegments: 2 }).trim().required(), //TODO: email should be validated by company domain
        password: Joi.string().min(6).max(30).required(),
        verifyPassword: Joi.string().min(6).max(30).valid(Joi.ref('password')).required().strict().strip(),
        fullName: Joi.string().min(3).max(30).regex(/^[\u0621-\u064Aa-zA-Z\s]+$/).required(),
        token: Joi.string().required()
    }),
    signIn: Joi.object().keys({
        email: Joi.string().email({ minDomainSegments: 2 }).required(),
        password: Joi.string().min(6).max(30).required()
    }),
    profile: Joi.object().keys({
        fullName: Joi.string().min(3).max(30).regex(/^[\u0621-\u064Aa-zA-Z\s]+$/),
        phoneNumber: Joi.string().regex(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/), // eslint-disable-line no-useless-escape
        birthday: Joi.string().isoDate(),
        gender: Joi.string().valid(...ALLGENDERS),
    }).min(1),
    find: Joi.object().keys({
        fullName: Joi.string().regex(/^[\u0621-\u064Aa-zA-Z\s]+$/),
    }),
    update: Joi.object().keys({
        type: Joi.string().valid(...ALLTYPES),
        fullName: Joi.string().min(3).max(30).regex(/^[\u0621-\u064Aa-zA-Z\s]+$/),
        phoneNumber: Joi.string().regex(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/), // eslint-disable-line no-useless-escape
        birthday: Joi.string().isoDate(),
        gender: Joi.string().valid(...ALLGENDERS),
        manager: Joi.string(),
        department: Joi.string(),
    }).min(1),
    id: Joi.object().keys({
        id: Joi.string().required().regex(/^u\d+$/)
    }),
}