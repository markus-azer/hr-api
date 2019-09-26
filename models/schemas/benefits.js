const mongoose = require('mongoose');
const { Schema } = mongoose;

const { modelFields, lockedFields, asyncIdGenerator } = require('../utilities');

let BenefitSchema = new Schema({
    id: String,
    type: { type: String, enum:['Offer', 'Medical', 'News'], required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    deletedAt: Date, // Soft Delete
},{
    timestamps: true
});

BenefitSchema.pre('save', async function (next) {
    try {
        await modelFields(this, ['id']);

        if (this.isNew){
            this.id = await asyncIdGenerator.generateUniqueId(this, 'b', 12);
        }

        await lockedFields(this, ['id']);
        return next();
    } catch (err) {
        return next(err);
    }
});

module.exports = mongoose.model('Benefit', BenefitSchema, 'benefits');