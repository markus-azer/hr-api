const router = require('express').Router();
const passport = require('passport');
const passportConf = require('../middlewares/passport'); // eslint-disable-line no-unused-vars
const passportJWT = passport.authenticate('jwt', { session: false });

const schemas = require('../controllers/userValidation');
const UsersController = require('../controllers/user');

router.route('/invite-user')
    .post(passportJWT, ValidateBody(schemas.inviteUser), CatchAsyncErrors(UsersController.inviteUser));

router.route('/signin')
    .post(ValidateBody(schemas.signIn), passport.authenticate('local', { session: false }), CatchAsyncErrors(UsersController.signIn));

router.route('/signout')
    .get(passportJWT, CatchAsyncErrors(UsersController.signOut));

router.route('/profile')
    .all(passportJWT)
    .get(CatchAsyncErrors(UsersController.getProfile))
    .put(ValidateBody(schemas.profile), CatchAsyncErrors(UsersController.updateProfile));

router.route('/')
    .get(passportJWT, ValidateQuery(schemas.find), CatchAsyncErrors(UsersController.find))
    .post(ValidateBody(schemas.create), CatchAsyncErrors(UsersController.create));

router.route('/:id(u[0-9]+)') // eslint-disable-line no-useless-escape
    .all(passportJWT, ValidateParams(schemas.id))
    .get(CatchAsyncErrors(UsersController.get))
    .put(ValidateBody(schemas.update), CatchAsyncErrors(UsersController.update))
    .delete(CatchAsyncErrors(UsersController.remove));

module.exports = router;