const Token = require('./schemas/tokens');
const RestrictedToken = require('./schemas/restrictedTokens');
const User = require('./schemas/users');
const Benefit = require('./schemas/benefits');

//TODO: Create layer Here to seperate DB from controllers
module.exports = {
    Token,
    RestrictedToken,
    User,
    Benefit,
};