
const https = require('https');
const Joi = require('@hapi/joi');
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const config = serverConfig;

const updateMongooseObject = (mongooseObject, data, push, pull) => {
    for (const [key, value] of Object.entries(data)) {
        if (Array.isArray(mongooseObject[key]) && push) {
            if(Array.isArray(value)){
                mongooseObject[key].push(...value);
            }else{
                mongooseObject[key].push(value);
            }
        }else if (Array.isArray(mongooseObject[key]) && pull) {
            if(Array.isArray(value)){
                mongooseObject[key].pull(...value);
            }else{
                mongooseObject[key].pull(value);
            }
        }else if(Array.isArray(mongooseObject[key])){
            mongooseObject[key] = value;
        }else if(typeof value === 'object'){
            updateMongooseObject(mongooseObject[key], value, push);
        }else {
            mongooseObject[key] = (!empty(value))?value:undefined;
        }
    }
}

const cleanObject = obj =>
    Object.keys(obj)
    .filter(k => !empty(obj[k])) // Remove undef. and null.
    .reduce((newObj, k) =>
        Array.isArray(obj[k])?{ ...newObj, [k]: obj[k] }:typeof obj[k] === "object" ?
        { ...newObj, [k]: cleanObject(obj[k]) } // Recurse.
        :{ ...newObj, [k]: obj[k] }, // Copy value.
        {}
    );

class RequiredParameterError extends Error {
    constructor (param) {
        super(`${param} can not be null or underfined.`)
    
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, RequiredParameterError)
        }
    }
}


module.exports = {
    updateMongooseObject,
    cleanObject,
    requiredParam: function (param) {
        throw new RequiredParameterError(param);
    },
    customError: function (message, errorCode) {
        Error.captureStackTrace(this, this.constructor);

        this.name = this.constructor.name;
        this.message = message || 'The requested resource couldn\'t be found';
        this.errorCode = errorCode || 404;
    },
    validateBody: (schema) => {
        return (req, res, next) => {
            const result = Joi.validate(req.body, schema, { abortEarly: false });
            if (result.error)
                return next(result.error);

            req.body = result.value;
            return next();
        }
    },
    validateQuery: (schema) => {
        return (req, res, next) => {
            const result = Joi.validate(req.query, schema, { abortEarly: false });
            if (result.error)
                return next(result.error);

            req.query = result.value;
            return next();
        }
    },
    validateParams: (schema) => {
        return (req, res, next) => {
            const result = Joi.validate(req.params, schema, { abortEarly: false });
            if (result.error)
                return next(result.error);

            req.params = result.value;
            return next();
        }
    },
    sendMail: async(mailOptions, callback)=>{
        const {service, user, pass } = config.mailService;
        const transporter = nodemailer.createTransport({
            service,
            auth: {
                user,
                pass
            }
        });

        return transporter.sendMail(Object.assign({from: user}, mailOptions), callback);
    },
    generateRandomToken: async (number) => {
        const buffer = await new Promise((resolve, reject) => {
            crypto.randomBytes(number, function (ex, buffer) {
                if (ex) {
                    reject("Error generating token");
                }
                resolve(buffer);
            });
        });
    
        return crypto
            .createHash("sha1")
            .update(buffer)
            .digest("hex");
    },
    emailTemplates: {
        userInvitation: (token, email)=>{
            return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>User Invitation</title>
            </head>
            <body>
                <div>
                    <h3>Hello</h3>
                    <p>Please complete your account by clicking the link: <a href="${config.host}/user/create?token=${token}"&email=${email}>link</a></p>
                    <br>
                    <p>Cheers!</p>
                </div>
            </body>
            </html>`
        }
    },
    notification: (config) => {
        return {
          sendSlackNotification: (channelId, message) => {
            return new Promise((resolve, reject) => {
              try {
                const notificationsConfig = config && config.notifications;

                if (empty(notificationsConfig)) {
                  throw new Error('Notification Config is Missing');
                }

                const { slackHostName, slackToken } = notificationsConfig;
                if (empty(slackHostName) || empty(slackToken)) {
                  throw new Error('Slack Host Name & Slack Token is required');
                }

                if (empty(channelId) || empty(message)) {
                  throw new Error('channelId Or message is Missing');
                }

                const options = {
                  hostname: slackHostName,
                  port: 443,
                  path: `/api/chat.postMessage?token=${slackToken}&channel=${channelId}&username=elnotifier&text=${encodeURI(message)}`,
                  method: 'POST',
                };

                const req = https.request(options, (response) => {
                  // Continuously update stream with data
                  let body = '';
                  response.on('data', d => body += d);

                  // Data reception is done, do whatever with it!
                  response.on('end', () => resolve(body));
                });
                req.on('error', error => reject(error));
                req.end();
              } catch (error) {
                reject(error);
              }
            });
          },
        };
    },
}