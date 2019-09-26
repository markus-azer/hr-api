const swaggerJSDoc = require('swagger-jsdoc');

// swagger definition
const swaggerDefinition = {
    openapi: "3.0.1",
    info: {
        title: 'HR API',
        version: '1.0.0',
        description: 'HR API',
    },
    host: 'localhost:3000',
    basePath: '/v1',
    servers: [
        {url: "http://localhost:3000"}
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT"
            }
        }
    }
};

// options for the swagger docs
const options = {
    // import swaggerDefinitions
    swaggerDefinition: swaggerDefinition,
    // path to the API docs
    apis: ['./routes/**/*.yaml'], // pass all in array 
};

// initialize swagger-jsdoc
module.exports = swaggerJSDoc(options);