const ValidationError = require('mongoose').Error.ValidationError;
const { isDev, SLACK_ERROR_CHANNEL } = serverConfig;

const errorHandler = (payload, req, res, next) => {
    try {
        if (payload instanceof CustomError) {
            return res.status(payload.errorCode).json({
                statusCode: payload.errorCode,
                message: payload.message,
                successful: false,
            });
        }

        if (payload instanceof SyntaxError) {
            return res.status(500).json({
                statusCode: 500,
                message: `Invalid JSON`,
                successful: false,
            });
        }

        if (payload instanceof ValidationError) {
            const validationsArray = Object.values(payload.errors).map(error => error.message.replace(/"+/g, ''));

            return res.status(payload.errorCode || 400).json({
                statusCode: payload.errorCode || 400,
                message: 'Validation Errors',
                validations: validationsArray,
                successful: false,
            });
        }

        if ((payload.name === 'ValidationError') && (payload.isJoi === true)) {
            const validationsArray = payload.details.map(detail => detail.message.replace(/"+/g, ''));

            return res.status(payload.errorCode || 400).json({
                statusCode: payload.errorCode || 400,
                message: 'Validation Errors',
                validations: validationsArray,
                successful: false,
            });
        }

        if (payload instanceof Error) {
            if (isDev) {
                // eslint-disable-next-line no-console
                console.log(`DEVELOPMENT ERRORS \n ${payload}`);
            }

            SendNotifications.sendSlackNotification(SLACK_ERROR_CHANNEL, `Error on HR api \n \`\`\`${payload.stack}\`\`\``).catch(console.log); // eslint-disable-line no-console

            return res.status(500).json({
                statusCode: 500,
                message: 'Internal Server Error',
                successful: false,
            });
        }

        return next(payload);
    } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
        return res.status(500).json({
            statusCode: 500,
            message: 'Internal Server Error',
            successful: false,
        });
    }
};

// eslint-disable-next-line
const dataHandler = (payload, req, res, next) => res.status(200).json({
    statusCode: 200,
    message: payload.message ? payload.message : 'data successfully retrieved',
    data: payload && payload.data,
    successful: true,
});

module.exports = {
    errorHandler,
    dataHandler
};