const mongoose = require('mongoose');

const uniqueValue = (model, fieldName, errorMessage) => ({
    validator: function (value) {
        const docId = this._id;
        const isNewOrIsModified = this.isNew || this.isModified(value);
        return new Promise(function (resolve) {
            if (isNewOrIsModified) {
                mongoose.model(model).countDocuments({
                    [fieldName]: {
                        $regex: new RegExp(`^${value}$`),
                        $options: 'i'
                    },
                    "_id": {
                        $ne: docId
                    }
                }, function (err, number) {
                    if (err)
                        throw new Error(err);

                    return resolve(number === 0);
                });
            } else {
                return resolve(true);
            }
        });
    },
    message: (errorMessage) ? errorMessage : (props => `${fieldName} :- ${props.value} is Already Duplicated`)
});

const foundValue = (model, fieldName, schemafieldName, dynamicModel) => ({
    validator: function (value) {
        const modelName = (dynamicModel) ? this[model] : model;
        const isNewOrIsModified = this.isNew || this.isModified(schemafieldName);
        return new Promise(function (resolve) {
            if (isNewOrIsModified) {
                mongoose.model(modelName).countDocuments({
                    [fieldName]: value,
                }, function (err, number) {
                    if (err)
                        throw new Error(err);

                    return resolve(number === 1);
                });
            } else {
                return resolve(true);
            }
        });
    },
    message: props => `${fieldName} :- ${props.value} is Already Duplicated`
});

const validateEmail = {
    validator: function (value) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value); // eslint-disable-line no-useless-escape
    },
    message: props => `Email :- ${props.value} is invalid`
}

const validatePhoneNumber = {
    validator: function (value) {
        return /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/g.test(value); // eslint-disable-line no-useless-escape
    },
    message: props => `PhoneNumber :- ${props.value} is invalid`
}

module.exports = {
    uniqueValue,
    foundValue,
    validateEmail,
    validatePhoneNumber
}