const ValidationError = require('mongoose').Error.ValidationError;
const ValidatorError = require('mongoose').Error.ValidatorError;


const asyncIdGenerator = {
    generate: function (length, startingCharacter) {
        const chars = '123456789';
        let id = startingCharacter;
        for (let i = 0; i < length; i++) {
            id += chars[Math.floor(Math.random() * 9)];
        }
        return id;
    },
    /**
     * 
     * @param {Object} $this 
     * @param {String} initialCharacter 
     * @param {Number} length 
     */
    generateUniqueId: async function ($this, initialCharacter, length) {
        const generateIdAndCheckUniqueness = async function ($this) {
            const id = asyncIdGenerator.generate(length, initialCharacter);

            const countNum = await $this.constructor.countDocuments({
                id
            });

            return (countNum) ? generateIdAndCheckUniqueness($this) : id;
        }

        return generateIdAndCheckUniqueness($this);
    }
}

const validObjectID = (mongoId) => /^[0-9a-fA-F]{24}$/.test(mongoId);
const objectIdRegex = /^[0-9a-fA-F]{24}$/

const lockedFields = ($this, lockedFields) => {

    const updatedLockedFields = lockedFields.filter((lockedField) => $this.isModified(lockedField));

    if (!$this.isNew && updatedLockedFields && updatedLockedFields.length >= 1) {

        let error = new ValidationError($this);
        updatedLockedFields.forEach((updatedLockedField) => {
            error.errors[updatedLockedField] = new ValidatorError({
                'message': `${updatedLockedField} is Locked`,
                'type': 'locked',
                'path': updatedLockedField,
                'value': $this[updatedLockedField]
            });
        });
        throw error;
    }
}

const modelFields = ($this, modelFields) => {

    const updatedModelFields = modelFields.filter((modelField) => $this.isModified(modelField));

    if (updatedModelFields && updatedModelFields.length >= 1) {

        let error = new ValidationError($this);
        updatedModelFields.forEach((updatedModelField) => {
            error.errors[updatedModelField] = new ValidatorError({
                'message': `${updatedModelField} is Locked`,
                'type': 'locked',
                'path': updatedModelField,
                'value': $this[updatedModelField]
            });
        });
        throw error;
    }
}
module.exports = {
    asyncIdGenerator,
    validObjectID,
    objectIdRegex,
    lockedFields,
    modelFields
}