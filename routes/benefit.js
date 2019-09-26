const router = require('express').Router();
const passport = require('passport');
const passportConf = require('../middlewares/passport'); // eslint-disable-line no-unused-vars
const passportJWT = passport.authenticate('jwt', { session: false });

const schemas = require('../controllers/benefitValidation');
const BenefitsController = require('../controllers/benefit');

router.route('/')
    .all(passportJWT)
    .get(ValidateQuery(schemas.find), CatchAsyncErrors(BenefitsController.find))
    .post(ValidateBody(schemas.create), CatchAsyncErrors(BenefitsController.create))

router.route('/:id(b[0-9]+)')
    .all(passportJWT, ValidateParams(schemas.id))
    .put(ValidateBody(schemas.update), CatchAsyncErrors(BenefitsController.update))
    .delete(CatchAsyncErrors(BenefitsController.remove))

module.exports = router;