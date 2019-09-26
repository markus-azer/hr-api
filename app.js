const helmet = require('helmet');
const morgan = require('morgan');
const express = require('express');
const mongoose = require('mongoose');
const bluebird = require('bluebird');
const swaggerUi = require('swagger-ui-express');
const config = require('./config/config');
const swaggerSpec = require('./swagger');
const { customError, requiredParam, notification, validateParams, validateQuery, validateBody } = require('./utilities');
const responseWrapper = require('./middlewares/responseWrapper');
const { catchAsyncErrors } = require('./middlewares/error');

// Set Global Variables
global.Promise = bluebird;
global.empty = require('is-empty');
global.ValidateParams = validateParams
global.ValidateQuery = validateQuery
global.ValidateBody = validateBody;
global.CatchAsyncErrors = catchAsyncErrors;
global.CustomError = customError;
global.RequiredParam = requiredParam;
global.SendNotifications = notification({ notifications: config.notifications });

// Configure mongoose
mongoose.Promise = bluebird;
mongoose.connect(config.MONGODB_URI, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true});
global.models = require('./models'); // Push Models to global


// To Print Unhandled Error
process.on('unhandledRejection', (error) => {
    global.SendNotifications.sendSlackNotification('', `Error on HR Api System \n \`\`\`${error.stack}\`\`\``).catch(console.log);
    console.error('unhandledRejection', error.message);
});

// Create new express app and get the port
const app = express();
const port = config.PORT;

// Swagger
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Configure the app Middlewares
app.use(helmet.hidePoweredBy({ setTo: 'PHP/5.4.0'}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('tiny'));

// Import Routes
const indexRoute = require('./routes');
const userRoute = require('./routes/user');
const benefitRoute = require('./routes/benefit');


// Route Middlewares
app.use('/', indexRoute);
app.use('/user', userRoute);
app.use('/benefit', benefitRoute);

// The Catch all Not found route
app.all('*', (req, res, next) => next(new CustomError('Not Found', 404)));

// Error handler
app.use(responseWrapper.errorHandler);

// Data handler
app.use(responseWrapper.dataHandler);

// Bind the app to the port
app.listen(port, () => console.log(`Server Up and Running \n=> http://localhost:${config.PORT}`));

module.exports = app;