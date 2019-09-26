const mongoose = require('mongoose');
const { Schema } = mongoose;

let TokenSchema = new Schema({
    type: { type: String, enum:['createAccount'], required: true },
    token: { type: String, unique: true, required: true },
    email: { type: String, required: [function () { return this.type == "createAccount"; }, 'Email is required']},
    createdAt: { type: Date, required: true, default: Date.now, expires: 43200 }, //expires in 12 hours
});

module.exports = mongoose.model('Token', TokenSchema, 'tokens');