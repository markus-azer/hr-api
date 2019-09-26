const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;
const { ALLTYPES, ALLGENDERS, ALLTIMEZONECOUNTRIES, EMPLOYEE } = require('../enums');
const { modelFields, lockedFields, asyncIdGenerator } = require('../utilities');
const { uniqueValue, validateEmail, validatePhoneNumber } = require('../validators');

let UserSchema = new Schema({
    id: String,
    type: {
        type: String,
        enum: ALLTYPES,
        default: EMPLOYEE,
        required: [true, 'Type is required']
    },
    local: {
        _id: false,
        email: {
            type: String,
            lowercase: true,
            unique: true,
            trim: true,
            minlength: [4, 'Email length must be at least 4 character long'],
            maxlength: [100, 'Email length must be at most 100 character long'],
            validate: [uniqueValue('User', 'local.email', 'Email Exists, Please login'), validateEmail],
            required: [true, 'Email required'],
        },
        password: {
            type: String,
            minlength: [6, 'Password length must be at least 6 character long'],
            maxlength: [255, 'Password length must be at most 255 character long'],
            required: [true, 'Password required']
        },
    },

    email: String,
    
    // Company Info
    manager: String,
    department: String,

    // User Personal Info
    fullName: {
        type: String,
        trim: true,
        required: [true, 'fullName is required'],
        minlength: [3, 'Name length must be at least 3 character long'],
        maxlength: [30, ' Name length must be at most 30 character long']
    },
    phoneNumber: {
        type: String,
        validate: validatePhoneNumber
    },
    birthday: {
        date: Date,
        timeZone: {type: String, enum: ALLTIMEZONECOUNTRIES}
    },
    gender: {
        type: String,
        enum: ALLGENDERS
    },
    deletedAt: String // Soft Delete
}, {
    timestamps: true
});

UserSchema.static('validatePassword', function (password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
});

UserSchema.pre('save', async function (next) {
    try {
        await modelFields(this, ['id', 'email']);

        if (this.isNew){
            this.id = await asyncIdGenerator.generateUniqueId(this, 'u', 12);
            this.email = this.local.email;
        }

        if (this.isModified('local.password')) {
            const salt = bcrypt.genSaltSync(10);
            this.local.password = bcrypt.hashSync(JSON.parse(JSON.stringify(this.local.password)), salt);
        }

        await lockedFields(this, ['id', 'local.email', 'email']);
        return next();
    } catch (err) {
        return next(err);
    }
});

module.exports = mongoose.model('User', UserSchema, 'users');