const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

let RestrictedTokenSchema = new Schema({
    token: { type: String, index: true, required: true },
    createdAt: { type: Date, required: true, default: Date.now, expires: 2592000 }, //expires in 30 days
});

module.exports = mongoose.model('RestrictedToken', RestrictedTokenSchema, 'restrictedTokens');