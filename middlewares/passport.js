const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const LocalStrategy = require('passport-local').Strategy;
const { checkAllowedRouteAndMethod } = require('../middlewares/auth');

const { User, RestrictedToken } = models;
const config = serverConfig;

/**
 * The choose to create one collection for all user types, Cause employee could be transferred to HR department
 */

// JSON WEB TOKENS STRATEGY
passport.use(new JwtStrategy({
    jwtFromRequest:  ExtractJwt.fromAuthHeaderAsBearerToken('authorization'),
    secretOrKey: config.JWT_SECRET_TOKEN,
    passReqToCallback: true
}, async (req, payload, done) => {
    try {
        const { id } = payload;
        const bearerToken = req.headers["authorization"];

        if(empty(bearerToken))
            return done(null, false);

        const token = bearerToken.replace('Bearer ', '');

        // Once the App scale, Then Redis Layer is required
        const restrictedTokenPromise = RestrictedToken.findOne({token}).lean();
        const userPromise = User.findOne({id, deletedAt: {$exists: false}}).lean();
        const [user, restrictedToken] = await Promise.all([userPromise, restrictedTokenPromise]);

        // If user doesn't exists, or Invalid JWT handle it
        if (!user || restrictedToken)
            return done(null, false);

        // RACL
        const { originalUrl, method } = req;
        const result = checkAllowedRouteAndMethod(user.type, originalUrl, method);

        if(result !== true)
            return done(null, false);

        // Otherwise, return the user
        req.user = user; // eslint-disable-line require-atomic-updates
        done(null, user);
    } catch(error) {
        done(error, false);
    }
}));

// LOCAL STRATEGY
passport.use(new LocalStrategy({
    usernameField: 'email',
    passReqToCallback: true
}, async (req, email, password, done) => {
    try {

        const user = await User.findOne({ "local.email": email, deletedAt: {$exists: false} }).lean();

        if(!user)
            throw new CustomError(`Your email or password is incorrect.`, 400);

        const validPass = await User.validatePassword(password, user.local.password);

        if(!validPass)
            throw new CustomError(`Your email or password is incorrect.`, 400);

        // Otherwise, return the user
        done(null, user);
    } catch (error) {
        done(error, false);
    }
}));
